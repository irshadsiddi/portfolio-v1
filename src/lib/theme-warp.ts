import { flushSync } from "react-dom";
import { FRAGMENT_SHADER, HYPERSPACE_DURATION_MS, VERTEX_SHADER } from "./theme-warp-shaders";
import {
  captureCoverFrame,
  prepareThemeViewport,
  renderThemeViewport,
  refreshThemeViewport,
} from "./theme-snapshot";

type WarpOptions = { originX: number; originY: number; toDark: boolean; onSwitch: () => void };
type Renderer = NonNullable<ReturnType<typeof createRenderer>>;
let cachedRenderer: Renderer | undefined;
let running = false;
let revision = 0;
type PreparedViewport = { key: string; svg: SVGElement; canvas: HTMLCanvasElement };
const preparedViewports = new Map<string, PreparedViewport>();
let preparingViewport: { key: string; promise: Promise<PreparedViewport> } | undefined;
let schedulePreparation: (() => void) | undefined;
let cancelCurrentWarp: (() => void) | undefined;

function viewport() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2_073_600 / (width * height)));
  const key = [
    width,
    height,
    scale,
    window.scrollX,
    window.scrollY,
    document.body.scrollHeight,
    document.documentElement.classList.contains("dark"),
    window.location.pathname,
    revision,
  ].join(":");
  return { width, height, scale, key };
}

function prepareViewport(frame?: string) {
  const { width, height, scale, key } = viewport();
  const cached = preparedViewports.get(key);
  if (cached) return Promise.resolve(cached);
  if (preparingViewport?.key === key) return preparingViewport.promise;
  const coverFrame = frame ?? captureCoverFrame();
  const promise = prepareThemeViewport(width, height, scale, coverFrame).then(async (svg) => {
    const canvas = await renderThemeViewport(svg, width, height, scale, coverFrame);
    const result = { key, svg, canvas };
    if (!running && viewport().key === key) preparedViewports.set(key, result);
    return result;
  });
  preparingViewport = { key, promise };
  void promise
    .finally(() => {
      if (preparingViewport?.promise === promise) preparingViewport = undefined;
    })
    .catch(() => {});
  return promise;
}

/** Prepare the current viewport while idle, then refresh after meaningful changes. */
export function watchThemeWarpPreparation() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let idle: number | undefined;
  let disposed = false;
  const warm = () => {
    if (disposed || running || document.hidden) return;
    try {
      if (!cachedRenderer || cachedRenderer.gl.isContextLost())
        cachedRenderer = createRenderer() ?? undefined;
      if (cachedRenderer) void prepareViewport().catch(() => {});
    } catch {
      // Unsupported GPUs use the immediate theme switch instead.
    }
  };
  const schedule = () => {
    clearTimeout(timer);
    if (idle !== undefined) window.cancelIdleCallback(idle);
    timer = setTimeout(() => {
      if ("requestIdleCallback" in window)
        idle = window.requestIdleCallback(warm, { timeout: 700 });
      else warm();
    }, 160);
  };
  schedulePreparation = schedule;
  const invalidate = () => {
    if (running) return;
    revision++;
    preparedViewports.clear();
    schedule();
  };
  const ignored = (node: Node) =>
    node instanceof Element &&
    node.matches(".theme-warp-canvas, nextjs-portal, iframe[id^='__SANDBOX__']");
  const observer = new MutationObserver((records) => {
    if (
      records.some((record) => {
        if (record.type === "attributes") return !ignored(record.target);
        return [...record.addedNodes, ...record.removedNodes].some((node) => !ignored(node));
      })
    )
      invalidate();
  });
  const loaded = (event: Event) => {
    if (event.target instanceof Node && !ignored(event.target)) invalidate();
  };
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "open", "aria-expanded", "aria-selected"],
  });
  const button = document.getElementById("theme-toggle");
  button?.addEventListener("pointerenter", warm);
  button?.addEventListener("focus", warm);
  button?.addEventListener("pointerdown", warm);
  window.addEventListener("scroll", invalidate, { passive: true });
  window.addEventListener("resize", invalidate);
  document.addEventListener("load", loaded, true);
  schedule();
  return () => {
    disposed = true;
    cancelCurrentWarp?.();
    revision++;
    preparedViewports.clear();
    if (schedulePreparation === schedule) schedulePreparation = undefined;
    clearTimeout(timer);
    if (idle !== undefined) window.cancelIdleCallback(idle);
    observer.disconnect();
    button?.removeEventListener("pointerenter", warm);
    button?.removeEventListener("focus", warm);
    button?.removeEventListener("pointerdown", warm);
    window.removeEventListener("scroll", invalidate);
    window.removeEventListener("resize", invalidate);
    document.removeEventListener("load", loaded, true);
  };
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate theme shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error("Unable to compile theme shader");
  }
  return shader;
}

function createRenderer() {
  const canvas = document.createElement("canvas");
  canvas.className = "theme-warp-canvas fixed inset-0 z-2147483647";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;
  let vertex: WebGLShader | undefined;
  let fragment: WebGLShader | undefined;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const textures = [gl.createTexture(), gl.createTexture()];
  try {
    if (!program || !buffer || !textures[0] || !textures[1])
      throw new Error("Unable to allocate theme renderer");
    vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Unable to link theme shader");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    for (const texture of textures) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    const renderer = {
      canvas,
      gl,
      program,
      buffer,
      fromTexture: textures[0],
      toTexture: textures[1],
      position: gl.getAttribLocation(program, "a_position"),
      from: gl.getUniformLocation(program, "u_from"),
      to: gl.getUniformLocation(program, "u_to"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      origin: gl.getUniformLocation(program, "u_origin"),
      progress: gl.getUniformLocation(program, "u_progress"),
      time: gl.getUniformLocation(program, "u_time"),
    };
    // Drivers can defer the expensive shader compilation until its first draw.
    // Exercise the actual program on a tiny surface during idle preparation.
    canvas.width = canvas.height = 1;
    gl.useProgram(program);
    gl.enableVertexAttribArray(renderer.position);
    gl.vertexAttribPointer(renderer.position, 2, gl.FLOAT, false, 0, 0);
    for (const [index, texture] of textures.entries()) {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255]),
      );
    }
    gl.uniform1i(renderer.from, 0);
    gl.uniform1i(renderer.to, 1);
    gl.uniform2f(renderer.resolution, 1, 1);
    gl.uniform2f(renderer.origin, 0.5, 0.5);
    gl.uniform1f(renderer.progress, 0.5);
    gl.uniform1f(renderer.time, 0);
    gl.viewport(0, 0, 1, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.finish();
    return renderer;
  } catch (error) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    textures.forEach((texture) => gl.deleteTexture(texture));
    throw error;
  } finally {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
  }
}

function upload(
  renderer: Renderer,
  texture: WebGLTexture,
  source: HTMLCanvasElement | ImageBitmap,
) {
  const { gl } = renderer;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
}

async function textureSource(canvas: HTMLCanvasElement) {
  if (typeof createImageBitmap !== "function") return canvas;
  return createImageBitmap(canvas, { premultiplyAlpha: "none", colorSpaceConversion: "none" });
}

function releaseSnapshots(renderer: Renderer) {
  const { gl, canvas } = renderer;
  // Keep the compiled program, but release the page textures after each switch.
  for (const texture of [renderer.fromTexture, renderer.toTexture]) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  canvas.width = canvas.height = 1;
}

export async function playThemeWarp({ originX, originY, onSwitch }: WarpOptions) {
  if (running) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onSwitch();
    return;
  }
  running = true;
  const preparationStartedAt = performance.now();
  let switched = false;
  const switchOnce = () => {
    if (switched) return;
    switched = true;
    flushSync(onSwitch);
  };
  const root = document.documentElement;
  const { width, height, scale, key } = viewport();
  let renderer: Renderer | undefined;
  let cancelled = false;
  let finishAnimation: (() => void) | undefined;
  let frame = 0;
  const captureAbort = new AbortController();
  const cancel = () => {
    cancelled = true;
    captureAbort.abort();
    finishAnimation?.();
  };
  cancelCurrentWarp = cancel;
  const visibility = () => {
    if (document.hidden) cancel();
  };
  const preventScroll = (event: Event) => event.preventDefault();
  const keys = (event: KeyboardEvent) => {
    if (event.key === "Escape") cancel();
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key))
      event.preventDefault();
  };
  const capture = async <T>(operation: Promise<T>) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let rejectCapture: (() => void) | undefined;
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          rejectCapture = () => reject(new DOMException("Theme capture cancelled", "AbortError"));
          if (captureAbort.signal.aborted) rejectCapture();
          else captureAbort.signal.addEventListener("abort", rejectCapture, { once: true });
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("Theme snapshot timed out")), 4000);
        }),
      ]);
    } finally {
      clearTimeout(timeout);
      if (rejectCapture) captureAbort.signal.removeEventListener("abort", rejectCapture);
    }
  };
  root.dataset.themeWarping = "true";
  window.addEventListener("resize", cancel);
  window.addEventListener("pagehide", cancel);
  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  window.addEventListener("keydown", keys);
  document.addEventListener("visibilitychange", visibility);
  try {
    if (!cachedRenderer || cachedRenderer.gl.isContextLost())
      cachedRenderer = createRenderer() ?? undefined;
    renderer = cachedRenderer;
    if (!renderer) return;
    const coverFrame = captureCoverFrame();
    const cached = preparedViewports.get(key);
    const cacheHit = !!cached;
    const prepared = cached ?? (await capture(prepareViewport(coverFrame)));
    const preparedAt = performance.now();
    const from = await capture(
      refreshThemeViewport(prepared.svg, prepared.canvas, scale, coverFrame),
    );
    const refreshedAt = performance.now();
    if (cancelled) return;
    preparedViewports.set(key, prepared);
    const { canvas, gl, program, buffer } = renderer;
    canvas.width = from.width;
    canvas.height = from.height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    const fromBitmap = await capture(textureSource(from));
    if (cancelled) {
      if ("close" in fromBitmap) fromBitmap.close();
      return;
    }
    upload(renderer, renderer.fromTexture, fromBitmap);
    // Start with the outgoing texture in both slots. The incoming page is only
    // faintly sampled during the opening pull, so it can finish in parallel.
    upload(renderer, renderer.toTexture, fromBitmap);
    if ("close" in fromBitmap) fromBitmap.close();
    const uploadedAt = performance.now();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderer.fromTexture);
    gl.uniform1i(renderer.from, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, renderer.toTexture);
    gl.uniform1i(renderer.to, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(renderer.position);
    gl.vertexAttribPointer(renderer.position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(renderer.resolution, width, height);
    gl.uniform2f(
      renderer.origin,
      Math.max(0, Math.min(originX, width)),
      Math.max(0, Math.min(originY, height)),
    );
    gl.uniform1f(renderer.progress, 0);
    gl.uniform1f(renderer.time, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    const drawnAt = performance.now();
    document.body.append(canvas);
    switchOnce();
    const targetKey = viewport().key;
    const animationStartedAt = performance.now();
    let incoming: Promise<void> | undefined;
    let incomingReadyAt: number | undefined;
    await new Promise<void>((resolve) => {
      finishAnimation = resolve;
      const start = performance.now();
      const draw = (now: number) => {
        if (cancelled || gl.isContextLost()) {
          resolve();
          return;
        }
        const elapsed = now - start;
        const t = Math.min(1, elapsed / HYPERSPACE_DURATION_MS);
        const progress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        gl.uniform1f(renderer!.progress, progress);
        gl.uniform1f(renderer!.time, elapsed / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (!incoming) {
          // Yield the opening frame before cloning the new theme's styles.
          incoming = new Promise<void>((done) => setTimeout(done, 0))
            .then(async () => {
              const target = preparedViewports.get(targetKey);
              const preparedTarget = target ?? (await capture(prepareViewport(coverFrame)));
              const to = target
                ? await capture(refreshThemeViewport(target.svg, target.canvas, scale, coverFrame))
                : preparedTarget.canvas;
              if (cancelled) return;
              preparedViewports.set(targetKey, preparedTarget);
              const toBitmap = await capture(textureSource(to));
              if (cancelled) {
                if ("close" in toBitmap) toBitmap.close();
                return;
              }
              gl.activeTexture(gl.TEXTURE1);
              upload(renderer!, renderer!.toTexture, toBitmap);
              if ("close" in toBitmap) toBitmap.close();
              incomingReadyAt = performance.now();
            })
            .catch((error) => {
              if (!cancelled && process.env.NODE_ENV === "development")
                console.warn("Theme warp fallback:", error);
              cancel();
            });
        }
        if (t < 1) frame = requestAnimationFrame(draw);
        else resolve();
      };
      frame = requestAnimationFrame(draw);
    });
    performance.clearMeasures("portfolio-theme-warp");
    performance.measure("portfolio-theme-warp", {
      start: animationStartedAt,
      end: performance.now(),
    });
    if (process.env.NODE_ENV === "development") {
      root.dataset.themeWarpTiming = JSON.stringify({
        prepare: Math.round(animationStartedAt - preparationStartedAt),
        cacheHit,
        layout: Math.round(preparedAt - preparationStartedAt),
        refresh: Math.round(refreshedAt - preparedAt),
        upload: Math.round(uploadedAt - refreshedAt),
        draw: Math.round(drawnAt - uploadedAt),
        switch: Math.round(animationStartedAt - drawnAt),
        incoming:
          incomingReadyAt === undefined ? null : Math.round(incomingReadyAt - animationStartedAt),
        animate: Math.round(performance.now() - animationStartedAt),
      });
    }
  } catch (error) {
    // Snapshot or GPU failure must never prevent a theme change.
    if (!cancelled && process.env.NODE_ENV === "development")
      console.warn("Theme warp fallback:", error);
  } finally {
    cancelAnimationFrame(frame);
    // Ignore any late capture completion after cancellation or unmount.
    cancelled = true;
    captureAbort.abort();
    if (cancelCurrentWarp === cancel) cancelCurrentWarp = undefined;
    renderer?.canvas.remove();
    if (renderer) releaseSnapshots(renderer);
    delete root.dataset.themeWarping;
    window.removeEventListener("resize", cancel);
    window.removeEventListener("pagehide", cancel);
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    window.removeEventListener("keydown", keys);
    document.removeEventListener("visibilitychange", visibility);
    try {
      switchOnce();
    } finally {
      running = false;
      schedulePreparation?.();
    }
  }
}

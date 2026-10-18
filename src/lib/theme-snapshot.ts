import { SITE } from "@/constants/site";

let snapshotModule: Promise<typeof import("modern-screenshot")> | undefined;
let embeddedFonts: Promise<string> | undefined;

function preloadThemeFonts() {
  embeddedFonts ??= (async () => {
    const stylesheet = document.querySelector<HTMLLinkElement>(
      'link[rel="stylesheet"][href^="https://fonts.googleapis.com/"]',
    );
    if (!stylesheet) return "";
    const response = await fetch(stylesheet.href, {
      cache: "force-cache",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return "";
    const css = await response.text();
    // The portfolio uses Latin text. Avoid embedding unused language subsets.
    const faces = Array.from(css.matchAll(/@font-face\s*\{[^}]*\}/g), ([face]) => face).filter(
      (face) => !face.includes("unicode-range") || /unicode-range:\s*U\+0000-00FF/i.test(face),
    );
    let embedded = faces.join("\n");
    const urls = [
      ...new Set(Array.from(embedded.matchAll(/url\(['"]?([^'")]+)['"]?\)/g), (match) => match[1])),
    ];
    await Promise.all(
      urls.map(async (url) => {
        const font = await fetch(url, { cache: "force-cache", signal: AbortSignal.timeout(2000) });
        if (!font.ok) throw new Error("Unable to embed theme font");
        const blob = await font.blob();
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        embedded = embedded.split(url).join(data);
      }),
    );
    return embedded;
  })().catch(() => "");
  return embeddedFonts;
}

export function preloadThemeSnapshot() {
  snapshotModule ??= import("modern-screenshot");
  void preloadThemeFonts();
  return snapshotModule;
}

/** Freeze the current video frame once, so both theme textures line up. */
export function captureCoverFrame() {
  const video = document.querySelector<HTMLVideoElement>(".hero-cover video");
  if (!video || video.readyState < 2) return SITE.coverPoster;
  const bounds = video.getBoundingClientRect();
  if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return SITE.coverPoster;
  try {
    const frame = document.createElement("canvas");
    frame.width = Math.max(1, video.clientWidth);
    frame.height = Math.max(1, video.clientHeight);
    const context = frame.getContext("2d");
    if (!context) return SITE.coverPoster;
    const ratio = Math.max(frame.width / video.videoWidth, frame.height / video.videoHeight);
    const sourceWidth = frame.width / ratio;
    const sourceHeight = frame.height / ratio;
    context.drawImage(
      video,
      (video.videoWidth - sourceWidth) / 2,
      (video.videoHeight - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      0,
      0,
      frame.width,
      frame.height,
    );
    // PNG compression of a video frame can block the click for tens of ms.
    return frame.toDataURL("image/jpeg", 0.92);
  } catch {
    return SITE.coverPoster;
  }
}

export async function prepareThemeViewport(
  width: number,
  height: number,
  scale: number,
  coverFrame: string,
) {
  const [{ domToForeignObjectSvg }, fontCssText] = await Promise.all([
    preloadThemeSnapshot(),
    preloadThemeFonts(),
  ]);
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const bodyHeight = document.body.scrollHeight;
  const omittedChildren = new WeakSet<Node>();
  const placeholders = new Map<string, DOMRect>();
  // Keep offscreen geometry without cloning hundreds of invisible cells/icons.
  document.querySelectorAll<HTMLElement>("main > section[id]").forEach((section) => {
    const bounds = section.getBoundingClientRect();
    if (bounds.bottom < -32 || bounds.top > height + 32) {
      placeholders.set(section.id, bounds);
      section.childNodes.forEach((child) => omittedChildren.add(child));
    }
  });
  return domToForeignObjectSvg(document.body, {
    width,
    height,
    scale,
    timeout: 1500,
    font: { cssText: fontCssText, preferredFormat: "woff2" },
    // Computed values already resolve variables. Copying every inherited Tailwind
    // token into every node makes these small viewport captures unnecessarily large.
    includeStyleProperties: Array.from(getComputedStyle(document.body)).filter(
      (property) => !property.startsWith("--"),
    ),
    features: { copyScrollbar: false },
    style: {
      margin: "0",
      transform: `translate(${-scrollX}px, ${-scrollY}px)`,
      transformOrigin: "top left",
    },
    filter: (node) =>
      !omittedChildren.has(node) &&
      (!(node instanceof Element) ||
        !node.matches("script, video, nextjs-portal, .theme-warp-canvas, .header-scroll-sentinel")),
    onCloneEachNode: (node) => {
      if (!(node instanceof HTMLElement)) return;
      node.style.animation = "none";
      node.style.transition = "none";
      if (
        node.matches(
          ".hero-profile > *, .hero-intro > p, .hero-primary-actions, .hero-social-links, [data-reveal].is-visible",
        )
      ) {
        node.style.opacity = "1";
        node.style.transform = "none";
        node.style.filter = "none";
      }
      const placeholder = placeholders.get(node.id);
      if (placeholder) {
        node.style.boxSizing = "border-box";
        node.style.height = node.style.minHeight = node.style.maxHeight = `${placeholder.height}px`;
        node.style.width = `${placeholder.width}px`;
      }
      // The SVG has no document scroll. Keep the sticky header where it was.
      if (node.classList.contains("site-header")) {
        node.style.position = "relative";
        node.style.top = `${scrollY}px`;
      }
      if (node.classList.contains("hero-cover")) {
        const image = document.createElement("img");
        image.dataset.themeCoverFrame = "true";
        image.src = coverFrame;
        image.style.cssText =
          "display:block;width:100%;height:100%;object-fit:cover;opacity:.82;filter:grayscale(1) contrast(1.08)";
        node.prepend(image);
      }
    },
    onCloneNode: (node) => {
      if (!(node instanceof HTMLElement)) return;
      node.style.height = `${bodyHeight}px`;
      const rules = document.createElement("style");
      rules.textContent =
        ".site-shell::before{position:absolute!important;top:0!important;bottom:0!important;height:100%!important}";
      node.append(rules);
    },
  });
}

function updateLiveNodes(prepared: SVGElement, coverFrame: string) {
  const image = prepared.querySelector<HTMLImageElement>("[data-theme-cover-frame]");
  if (image) image.src = coverFrame;
  // Keep clocks current even when the surrounding layout was prepared on idle.
  document.querySelectorAll<HTMLElement>("[data-theme-live]").forEach((source) => {
    const target = prepared.querySelector(`[data-theme-live="${source.dataset.themeLive}"]`);
    if (target && source.dataset.themeLive !== "cover") target.textContent = source.textContent;
  });
}

async function rasterize(svg: SVGElement, width: number, height: number, scale: number) {
  // The SVG already contains resolved styles, embedded images, and fonts.
  // Passing it through domToCanvas would clone it again because ordinary links
  // are detected as external SVG resources by the library.
  const raster = new Image();
  raster.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  await raster.decode();
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to rasterize theme viewport");
  context.drawImage(raster, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Rasterize a prepared viewport without walking the live document again. */
export function renderThemeViewport(
  prepared: SVGElement,
  width: number,
  height: number,
  scale: number,
  coverFrame: string,
) {
  updateLiveNodes(prepared, coverFrame);
  return rasterize(prepared, width, height, scale);
}

/** Refresh only the video and clocks on an otherwise prepared page image. */
export async function refreshThemeViewport(
  prepared: SVGElement,
  cached: HTMLCanvasElement,
  scale: number,
  coverFrame: string,
) {
  updateLiveNodes(prepared, coverFrame);
  const canvas = document.createElement("canvas");
  canvas.width = cached.width;
  canvas.height = cached.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to refresh theme viewport");
  context.drawImage(cached, 0, 0);
  await Promise.all(
    Array.from(document.querySelectorAll<HTMLElement>("[data-theme-live]"), async (source) => {
      const bounds = source.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight || !bounds.width || !bounds.height)
        return;
      const original = prepared.querySelector<HTMLElement>(
        `[data-theme-live="${source.dataset.themeLive}"]`,
      );
      if (!original) return;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", String(bounds.width));
      svg.setAttribute("height", String(bounds.height));
      prepared
        .querySelectorAll(":scope > style, :scope > defs")
        .forEach((style) => svg.append(style.cloneNode(true)));
      const region = original.cloneNode(true) as HTMLElement;
      Object.assign(region.style, {
        position: "relative",
        top: "0",
        left: "0",
        margin: "0",
        transform: "none",
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
      });
      if (source.dataset.themeLive !== "cover") region.style.display = "block";
      const foreign = document.createElementNS(svg.namespaceURI, "foreignObject");
      foreign.setAttribute("width", "100%");
      foreign.setAttribute("height", "100%");
      foreign.append(region);
      svg.append(foreign);
      const patch = await rasterize(svg, bounds.width, bounds.height, scale);
      context.clearRect(
        bounds.left * scale,
        bounds.top * scale,
        bounds.width * scale,
        bounds.height * scale,
      );
      context.fillStyle = getComputedStyle(document.body).backgroundColor;
      context.fillRect(
        bounds.left * scale,
        bounds.top * scale,
        bounds.width * scale,
        bounds.height * scale,
      );
      context.drawImage(
        patch,
        bounds.left * scale,
        bounds.top * scale,
        bounds.width * scale,
        bounds.height * scale,
      );
    }),
  );
  return canvas;
}

export async function snapshotThemeViewport(
  width: number,
  height: number,
  scale: number,
  coverFrame: string,
) {
  const prepared = await prepareThemeViewport(width, height, scale, coverFrame);
  return renderThemeViewport(prepared, width, height, scale, coverFrame);
}

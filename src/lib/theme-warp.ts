const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_origin;
uniform vec3 u_from;
uniform vec3 u_to;
uniform float u_progress;
uniform float u_time;
varying vec2 v_uv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    value += amplitude * valueNoise(p);
    p = rotate * p * 2.04 + vec2(19.1, 7.7);
    amplitude *= 0.5;
  }
  return value;
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
  float progress = easeInOutCubic(u_progress);
  vec2 center = u_origin / u_resolution;
  vec2 rel = v_uv - center;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 arel = vec2(rel.x * aspect, rel.y);
  float dist = length(arel);
  float angle = atan(arel.y, arel.x);
  float life = sin(3.14159265 * progress);

  float streak = fbm(vec2(angle * 5.0, dist * 3.0 - u_time * 4.0));
  float streak2 = fbm(vec2(angle * 11.0 + 4.0, dist * 6.0 - u_time * 7.0));
  float reach = length(vec2(aspect, 1.0)) + 0.35;
  float reveal = smoothstep(dist - 0.28, dist + 0.02, progress * reach);
  vec3 color = mix(u_from, u_to, reveal);

  float rays = pow(max(0.0, streak2), 3.0) * life * (1.0 - reveal);
  float core = exp(-dist * 4.5) * life;
  vec3 light = mix(vec3(0.72), vec3(1.0), u_to.r);
  color += rays * light * 0.92;
  color += core * light * 1.15;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

type WarpOptions = {
  originX: number;
  originY: number;
  toDark: boolean;
  onSwitch: () => void;
};

let running = false;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export async function playThemeWarp({ originX, originY, toDark, onSwitch }: WarpOptions) {
  if (running) return;
  running = true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    onSwitch();
    running = false;
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className =
    "theme-warp-canvas pointer-events-none fixed inset-0 z-2147483647 transition-opacity duration-180 ease-theme-warp";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
  });

  const finishWithoutShader = () => {
    onSwitch();
    canvas.remove();
    running = false;
  };

  if (!gl) {
    finishWithoutShader();
    return;
  }

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
    finishWithoutShader();
    return;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    finishWithoutShader();
    return;
  }

  const buffer = gl.createBuffer();
  if (!buffer) {
    finishWithoutShader();
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, "u_resolution");
  const origin = gl.getUniformLocation(program, "u_origin");
  const from = gl.getUniformLocation(program, "u_from");
  const to = gl.getUniformLocation(program, "u_to");
  const progress = gl.getUniformLocation(program, "u_progress");
  const time = gl.getUniformLocation(program, "u_time");
  const oldTone = toDark ? 1 : 0.1;
  const newTone = toDark ? 0.1 : 1;
  const duration = 820;
  const startedAt = performance.now();
  let switched = false;

  document.documentElement.dataset["themeWarping"] = "true";

  await new Promise<void>((resolve) => {
    const draw = (now: number) => {
      const elapsed = now - startedAt;
      const value = Math.min(1, elapsed / duration);
      if (!switched && value >= 0.5) {
        switched = true;
        onSwitch();
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, width, height);
      gl.uniform2f(
        origin,
        Math.min(Math.max(originX, 0), width),
        Math.min(Math.max(originY, 0), height),
      );
      gl.uniform3f(from, oldTone, oldTone, oldTone);
      gl.uniform3f(to, newTone, newTone, newTone);
      gl.uniform1f(progress, value);
      gl.uniform1f(time, elapsed / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (value > 0.86) canvas.style.opacity = String(Math.max(0, (1 - value) / 0.14));
      if (value < 1) requestAnimationFrame(draw);
      else resolve();
    };
    requestAnimationFrame(draw);
  });

  if (!switched) onSwitch();
  delete document.documentElement.dataset["themeWarping"];
  canvas.remove();
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  running = false;
}

/**
 * Hyperspace Light Warp, adapted from yix2614/animation-gallery (MIT).
 * Original shader and 1080ms duration retained without visual changes.
 * Source revision: 6fbb7726b516d3d30ae0ab9894f04d8f744b689d
 * See THIRD_PARTY_NOTICES.md for the original copyright and licence.
 */
export const HYPERSPACE_DURATION_MS = 1080;

export const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform vec2 u_resolution;
uniform vec2 u_origin;
uniform float u_progress;
uniform float u_max_distance;
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

vec2 rotate2(vec2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c) * p;
}

vec4 sampleChromatic(sampler2D tex, vec2 uv, vec2 dir, float amount) {
  vec4 color;
  color.r = texture2D(tex, clamp(uv + dir * amount, 0.0, 1.0)).r;
  color.g = texture2D(tex, clamp(uv, 0.0, 1.0)).g;
  color.b = texture2D(tex, clamp(uv - dir * amount, 0.0, 1.0)).b;
  color.a = 1.0;
  return color;
}


void main() {
  vec2 center = u_origin / u_resolution;
  vec2 rel = v_uv - center;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 arel = vec2(rel.x * aspect, rel.y);
  float dist = length(arel);
  float angle = atan(arel.y, arel.x);
  float life = sin(3.14159265 * u_progress);

  float streak = fbm(vec2(angle * 5.0, dist * 3.0 - u_time * 4.0));
  float streak2 = fbm(vec2(angle * 11.0 + 4.0, dist * 6.0 - u_time * 7.0));
  float warpAmount = (0.18 + streak * 0.5 + streak2 * 0.3) * life;
  vec2 pull = normalize(rel + 1e-4) * warpAmount * (0.25 + u_progress * 0.9);

  float reveal = smoothstep(0.0, 1.0, u_progress * 1.45 - dist * 0.85);
  float chroma = warpAmount * 7.0 / min(u_resolution.x, u_resolution.y);
  vec2 radialDir = normalize(rel + 1e-4);

  vec4 fromColor = sampleChromatic(u_from, clamp(v_uv + pull, 0.0, 1.0), radialDir, chroma);
  vec4 toColor = sampleChromatic(u_to, clamp(v_uv - pull * 0.4, 0.0, 1.0), -radialDir, chroma * 0.7);
  vec4 color = mix(fromColor, toColor, reveal);

  float lines = pow(max(0.0, streak2), 3.0) * life * (1.0 - reveal);
  float core = exp(-dist * 4.5) * life;
  color.rgb += lines * vec3(0.40, 0.55, 0.95);
  color.rgb += core * vec3(0.6, 0.7, 1.0);
  gl_FragColor = color;
}
`;

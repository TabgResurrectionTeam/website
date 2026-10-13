export interface ClickToEnterScene {
  setPointer(normalizedX: number, normalizedY: number): void
  dispose(): void
}

const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uShockPos[4];
uniform float uShockStart[4];

#define PI 3.14159265359
#define SHOCK_COUNT 4

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.1;
    amplitude *= 0.5;
  }
  return value;
}

vec3 starLayer(vec2 uv, float speed, float brightness) {
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  float n = hash3(vec3(id, speed));
  float size = mix(0.003, 0.016, n);
  float twinkle = 0.45 + 0.55 * sin(uTime * (4.0 + n * 12.0) + n * 6.28);
  float d = length(gv);
  float star = smoothstep(size, 0.0, d) * twinkle * brightness;
  float glow = smoothstep(size * 7.0, 0.0, d) * twinkle * brightness * 0.45;
  vec3 tint = mix(vec3(0.35, 1.0, 1.0), vec3(1.0, 0.25, 0.9), n);
  return tint * (star + glow);
}

vec3 hyperspeedStars(vec2 uv) {
  vec3 col = vec3(0.0);
  float t = uTime * 2.5;
  for (int i = 0; i < 5; i++) {
    float layer = float(i);
    vec2 p = uv;
    p.y += t * (0.45 + layer * 0.28);
    p.x += sin(t * 0.3 + layer) * 0.05;
    p *= 1.0 + layer * 0.85;
    col += starLayer(p * (12.0 + layer * 6.0), layer, 0.7 + layer * 0.22);
  }
  return col;
}

vec2 barrel(vec2 uv, float amount) {
  vec2 c = uv - 0.5;
  float r2 = dot(c, c);
  return 0.5 + c * (1.0 + amount * r2);
}

float shockwaves(vec2 p, vec2 aspect) {
  float total = 0.0;
  for (int i = 0; i < SHOCK_COUNT; i++) {
    float age = uTime - uShockStart[i];
    if (age > 0.0 && age < 1.35) {
      vec2 shockCenter = (uShockPos[i] - 0.5) * aspect;
      float dist = length(p - shockCenter);
      float waveFront = age * 1.05;
      float ring = abs(dist - waveFront);
      float ringGlow = smoothstep(0.07, 0.0, ring) * (1.0 - age / 1.35);
      float ripple = sin((dist - waveFront) * 48.0 - age * 12.0) * ringGlow;
      total += ringGlow * 1.15 + ripple * 0.35;
    }
  }
  return total;
}

float moirePattern(vec2 uv) {
  vec2 c = uv - 0.5;
  float a1 = atan(c.y, c.x) + uTime * 0.35;
  float a2 = atan(c.y, c.x) - uTime * 0.52;
  float g1 = pow(abs(sin(a1 * 90.0 + length(c) * 120.0)), 6.0);
  float g2 = pow(abs(sin(a2 * 94.0 - length(c) * 118.0)), 6.0);
  return (g1 * g2) * smoothstep(0.85, 0.15, length(c));
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pointer = (uPointer - 0.5) * aspect;
  float pointerDist = length(p - pointer);
  float pointerPull = exp(-pointerDist * 3.2) * 0.14;
  vec2 pointerDir = pointerDist > 0.0001 ? (p - pointer) / pointerDist : vec2(0.0);
  p += pointer * 0.08 + pointerDir * pointerPull;

  float shock = shockwaves(p, aspect);
  p += pointerDir * shock * 0.06;

  vec2 distorted = p;
  distorted.x += sin(p.y * 12.0 + uTime * 2.0) * 0.02;
  distorted.y += cos(p.x * 10.0 - uTime * 1.7) * 0.016;
  distorted += pointerDir * shock * 0.11;

  float radius = length(distorted);
  float tunnel = 1.0 / (radius + 0.35);
  vec3 nebula = vec3(0.04, 0.0, 0.09);
  nebula += vec3(0.55, 0.06, 0.9) * fbm(distorted * 2.5 + uTime * 0.1);
  nebula += vec3(0.05, 0.65, 1.0) * fbm(distorted * 4.0 - uTime * 0.14);
  nebula += vec3(1.0, 0.12, 0.55) * fbm(distorted * 1.3 + uTime * 0.05) * 0.4;
  nebula *= tunnel * 0.55 * (1.0 + 0.22 * sin(uTime * 1.4));

  vec3 stars = hyperspeedStars(distorted + vec2(sin(uTime * 0.2) * 0.1, 0.0));

  float gridY = pow(abs(sin((distorted.y + uTime * 0.55) * 18.0)), 8.0);
  float gridX = pow(abs(sin(distorted.x * 18.0 + uTime * 0.35)), 12.0);
  float grid = max(gridY, gridX * 0.75) * 0.7;
  vec3 gridCol = mix(vec3(0.15, 1.0, 1.0), vec3(1.0, 0.25, 0.9), 0.5 + 0.5 * sin(uTime * 1.7));
  gridCol *= grid;

  float rings = abs(fract(radius * 5.5 - uTime * 0.85) - 0.5);
  float ringMask = smoothstep(0.14, 0.0, rings) * exp(-radius * 1.05);
  float ringsFast = abs(fract(radius * 12.0 - uTime * 1.8) - 0.5);
  float ringFastMask = smoothstep(0.04, 0.0, ringsFast) * exp(-radius * 1.5);
  vec3 ringColor = mix(vec3(0.1, 1.0, 1.0), vec3(1.0, 0.15, 0.85), 0.5 + 0.5 * sin(uTime * 2.6 + radius * 12.0));
  vec3 ringCol = ringColor * (ringMask * 1.15 + ringFastMask * 0.85);

  float angle = atan(distorted.y, distorted.x);
  float streaks = pow(abs(sin(angle * 18.0 + sin(uTime * 0.9) * 0.6)), 20.0);
  streaks *= smoothstep(0.03, 0.45, radius) * exp(-radius * 0.45);
  vec3 streakCol = vec3(0.55, 0.95, 1.0) * streaks * 0.55;
  streakCol += vec3(1.0, 0.3, 0.85) * pow(abs(sin(angle * 9.0 - uTime * 1.4)), 30.0) * streaks;

  float corePulse = 0.55 + 0.45 * sin(uTime * 4.5);
  vec3 coreCol = vec3(0.25, 0.85, 1.0) * exp(-radius * 2.4) * corePulse * 0.42;
  coreCol += vec3(1.0, 0.15, 0.8) * exp(-radius * 1.05) * 0.16;

  float sweep = exp(-pow((fract(uv.y + uTime * 0.18) - 0.2) * 8.0, 2.0));
  vec3 sweepCol = vec3(0.3, 0.95, 1.0) * sweep * 0.22;

  float moire = moirePattern(uv) * 0.38;
  vec3 moireCol = mix(vec3(1.0, 0.2, 0.85), vec3(0.2, 1.0, 1.0), 0.5 + 0.5 * sin(uTime * 3.1)) * moire;

  vec3 shockCol = mix(vec3(0.35, 1.0, 1.0), vec3(1.0, 0.25, 0.9), shock) * shock * 0.55;

  vec3 col = nebula + stars + gridCol + ringCol + streakCol + coreCol + sweepCol + moireCol + shockCol;

  float pocket = smoothstep(0.34, 0.07, radius);
  col = mix(col, col * vec3(0.22, 0.16, 0.32), pocket);

  float vignette = smoothstep(1.55, 0.2, length(p));
  col *= mix(0.62, 1.0, vignette);

  float scan = 0.84 + 0.16 * sin(uv.y * uResolution.y * 1.5 + uTime * 8.0);
  col *= scan;

  float datamoshTick = step(0.992, hash(vec2(floor(uTime * 14.0), 7.1)));
  if (datamoshTick > 0.5) {
    vec2 block = floor(uv * vec2(24.0, 18.0));
    vec2 blockOffset = (vec2(hash(block), hash(block + 17.3)) - 0.5) * 0.035;
    col = mix(col, col * (0.6 + hash(block + 3.7)), 0.65);
    col += vec3(0.15, 0.4, 1.0) * length(blockOffset) * 4.0;
  }

  float aberration = 0.006 + 0.005 * sin(uTime * 3.2);
  vec2 ca = vec2(aberration, 0.0);
  col.r *= 1.0 + fbm(uv * 8.0 + ca + uTime) * 0.38;
  col.b *= 1.0 + fbm(uv * 8.0 - ca - uTime) * 0.38;
  col.g *= 1.0 + fbm(uv * 6.0 + uTime * 0.4) * 0.1;

  col = pow(max(col, vec3(0.0)), vec3(0.82));

  vec2 crt = barrel(uv, 0.19);
  float edge = step(0.0, crt.x) * step(crt.x, 1.0) * step(0.0, crt.y) * step(crt.y, 1.0);
  col *= edge;

  fragColor = vec4(col, 1.0);
}
`

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)
  if (shader === null) {
    throw new Error('Failed to create shader')
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown'
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${log}`)
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
  const program = gl.createProgram()
  if (program === null) {
    throw new Error('Failed to create program')
  }
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown'
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${log}`)
  }
  return program
}

export function createClickToEnterScene(canvas: HTMLCanvasElement): ClickToEnterScene {
  const glContext = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  })
  if (glContext === null) {
    throw new Error('WebGL2 is not available')
  }

  const gl: WebGL2RenderingContext = glContext

  const program = createProgram(gl)
  const positionLocation = gl.getAttribLocation(program, 'aPosition')
  const resolutionLocation = gl.getUniformLocation(program, 'uResolution')
  const timeLocation = gl.getUniformLocation(program, 'uTime')
  const pointerLocation = gl.getUniformLocation(program, 'uPointer')
  const shockPosLocation = gl.getUniformLocation(program, 'uShockPos[0]')
  const shockStartLocation = gl.getUniformLocation(program, 'uShockStart[0]')

  const quadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  )

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  let pointerX = 0.5
  let pointerY = 0.5
  let lastShockPointerX = 0.5
  let lastShockPointerY = 0.5
  let animationFrameId = 0
  const startTime = performance.now()
  const shockCount = 4
  const shockPositions = new Float32Array(shockCount * 2)
  const shockStarts = new Float32Array(shockCount)
  for (let shockIndex = 0; shockIndex < shockCount; shockIndex += 1) {
    shockStarts[shockIndex] = -1000
  }
  let nextShockSlot = 0

  function pushShockwave(normalizedX: number, normalizedY: number, elapsedSeconds: number): void {
    shockPositions[nextShockSlot * 2] = normalizedX
    shockPositions[nextShockSlot * 2 + 1] = normalizedY
    shockStarts[nextShockSlot] = elapsedSeconds
    nextShockSlot = (nextShockSlot + 1) % shockCount
  }

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.floor(canvas.clientWidth * dpr)
    const height = Math.floor(canvas.clientHeight * dpr)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  function render(now: number): void {
    animationFrameId = requestAnimationFrame(render)

    const elapsedSeconds = (now - startTime) / 1000

    resize()

    gl.useProgram(program)
    gl.bindVertexArray(vao)
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
    gl.uniform1f(timeLocation, elapsedSeconds)
    gl.uniform2f(pointerLocation, pointerX, pointerY)
    if (shockPosLocation !== null) {
      gl.uniform2fv(shockPosLocation, shockPositions)
    }
    if (shockStartLocation !== null) {
      gl.uniform1fv(shockStartLocation, shockStarts)
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)
  }

  const resizeObserver = new ResizeObserver(() => {
    resize()
  })
  resizeObserver.observe(canvas)
  resize()
  animationFrameId = requestAnimationFrame(render)

  return {
    setPointer(normalizedX: number, normalizedY: number): void {
      const deltaX = normalizedX - lastShockPointerX
      const deltaY = normalizedY - lastShockPointerY
      const movement = Math.hypot(deltaX, deltaY)
      if (movement > 0.028) {
        const elapsedSeconds = (performance.now() - startTime) / 1000
        pushShockwave(normalizedX, normalizedY, elapsedSeconds)
        lastShockPointerX = normalizedX
        lastShockPointerY = normalizedY
      }
      pointerX = normalizedX
      pointerY = normalizedY
    },
    dispose(): void {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      gl.deleteBuffer(quadBuffer)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
    },
  }
}

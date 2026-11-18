// Solmar Coast: Neon Syndicate — Custom WebGL2 3D Engine, Procedural City & Vehicle Meshes, Shaders & Follow Camera

import { COASTLINE_X, ROAD_WIDTH, ROAD_X_COORDS, ROAD_Z_COORDS } from './world.js';
import { OUTFIT_STYLES, VEHICLE_ARCHETYPES } from './entities.js';

const VERTEX_SHADER_SRC = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec4 aColor;

uniform mat4 uViewProj;
uniform mat4 uModel;

out vec3 vWorldPos;
out vec3 vNormal;
out vec4 vColor;

void main() {
  vec4 worldPos = uModel * vec4(aPosition, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = mat3(uModel) * aNormal;
  vColor = aColor;
  gl_Position = uViewProj * worldPos;
}
`;

const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;

in vec3 vWorldPos;
in vec3 vNormal;
in vec4 vColor;

uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform vec3 uFogColor;
uniform vec3 uCameraPos;
uniform float uEmissive;

out vec4 outColor;

void main() {
  vec3 N = normalize(vNormal);
  float ndl = max(dot(N, uSunDir), 0.0);
  float hemi = 0.5 + 0.5 * N.y;
  vec3 ambient = mix(uAmbientColor * 0.68, uAmbientColor * 1.18, hemi);
  vec3 viewDir = normalize(uCameraPos - vWorldPos);
  vec3 halfVec = normalize(uSunDir + viewDir);
  float spec = pow(max(dot(N, halfVec), 0.0), 28.0) * 0.22;

  vec3 lit = vColor.rgb * (ambient + uSunColor * ndl * 0.88) + uSunColor * spec;
  vec3 base = mix(lit, vColor.rgb * 1.25, clamp(uEmissive, 0.0, 1.0));

  float dist = length(vWorldPos - uCameraPos);
  float fogFactor = clamp((dist - 115.0) / 210.0, 0.0, 0.72);
  vec3 finalRgb = mix(base, uFogColor, fogFactor);

  outColor = vec4(finalRgb, vColor.a);
}
`;

export function createIdentityMat4() {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

export function createPerspectiveMat4(fovRad, aspect, near, far) {
  const f = 1.0 / Math.tan(fovRad * 0.5);
  const nf = 1.0 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function createLookAtMat4(eye, target, up = [0, 1, 0]) {
  let zx = eye[0] - target[0];
  let zy = eye[1] - target[1];
  let zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len;
  zy /= len;
  zz /= len;

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * xx;
  // Standard cross product up x z:
  xx = up[1] * zz - up[2] * zy;
  xy = up[2] * zx - up[0] * zz;
  xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz) || 1;
  xx /= len;
  xy /= len;
  xz /= len;

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const out = new Float32Array(16);
  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[3] = 0;
  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[7] = 0;
  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
  return out;
}

export function multiplyMat4(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    const b0 = b[col * 4 + 0];
    const b1 = b[col * 4 + 1];
    const b2 = b[col * 4 + 2];
    const b3 = b[col * 4 + 3];
    out[col * 4 + 0] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[col * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[col * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[col * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

export function composeModelMat4(tx, ty, tz, yaw = 0, sx = 1, sy = 1, sz = 1) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const out = new Float32Array(16);
  out[0] = c * sx;
  out[1] = 0;
  out[2] = -s * sx;
  out[3] = 0;
  out[4] = 0;
  out[5] = sy;
  out[6] = 0;
  out[7] = 0;
  out[8] = s * sz;
  out[9] = 0;
  out[10] = c * sz;
  out[11] = 0;
  out[12] = tx;
  out[13] = ty;
  out[14] = tz;
  out[15] = 1;
  return out;
}

export function projectWorldToScreen(viewProj, x, y, z, width, height) {
  const clipX = viewProj[0] * x + viewProj[4] * y + viewProj[8] * z + viewProj[12];
  const clipY = viewProj[1] * x + viewProj[5] * y + viewProj[9] * z + viewProj[13];
  const clipW = viewProj[3] * x + viewProj[7] * y + viewProj[11] * z + viewProj[15];
  if (clipW <= 0.1) return { x: -9999, y: -9999, visible: false, depth: clipW };
  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;
  return {
    x: (ndcX * 0.5 + 0.5) * width,
    y: (1.0 - (ndcY * 0.5 + 0.5)) * height,
    visible: ndcX >= -1.15 && ndcX <= 1.15 && ndcY >= -1.15 && ndcY <= 1.15,
    depth: clipW,
  };
}

class MeshBuilder {
  constructor() {
    this.data = [];
  }

  pushVertex(x, y, z, nx, ny, nz, r, g, b, a = 1.0) {
    this.data.push(x, y, z, nx, ny, nz, r, g, b, a);
  }

  addQuad(p0, p1, p2, p3, nx, ny, nz, color, alpha = 1.0) {
    const [r, g, b] = color;
    this.pushVertex(p0[0], p0[1], p0[2], nx, ny, nz, r, g, b, alpha);
    this.pushVertex(p1[0], p1[1], p1[2], nx, ny, nz, r, g, b, alpha);
    this.pushVertex(p2[0], p2[1], p2[2], nx, ny, nz, r, g, b, alpha);

    this.pushVertex(p0[0], p0[1], p0[2], nx, ny, nz, r, g, b, alpha);
    this.pushVertex(p2[0], p2[1], p2[2], nx, ny, nz, r, g, b, alpha);
    this.pushVertex(p3[0], p3[1], p3[2], nx, ny, nz, r, g, b, alpha);
  }

  addBox(cx, cy, cz, w, h, d, color, alpha = 1.0) {
    const x0 = cx - w * 0.5;
    const x1 = cx + w * 0.5;
    const y0 = cy - h * 0.5;
    const y1 = cy + h * 0.5;
    const z0 = cz - d * 0.5;
    const z1 = cz + d * 0.5;

    // Top (+Y)
    this.addQuad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], 0, 1, 0, color, alpha);
    // Bottom (-Y)
    this.addQuad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], 0, -1, 0, color, alpha);
    // Front (+Z)
    this.addQuad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], 0, 0, 1, color, alpha);
    // Back (-Z)
    this.addQuad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], 0, 0, -1, color, alpha);
    // Right (+X)
    this.addQuad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], 1, 0, 0, color, alpha);
    // Left (-X)
    this.addQuad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], -1, 0, 0, color, alpha);
  }

  addPyramidCone(cx, yTop, yBottom, cz, radiusBottom, segments, color, alpha = 1.0) {
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      const x0 = cx + Math.cos(a0) * radiusBottom;
      const z0 = cz + Math.sin(a0) * radiusBottom;
      const x1 = cx + Math.cos(a1) * radiusBottom;
      const z1 = cz + Math.sin(a1) * radiusBottom;
      const [r, g, b] = color;
      this.pushVertex(cx, yTop, cz, 0, 1, 0, r, g, b, alpha);
      this.pushVertex(x0, yBottom, z0, 0, 1, 0, r, g, b, alpha);
      this.pushVertex(x1, yBottom, z1, 0, 1, 0, r, g, b, alpha);
    }
  }
}

export function compileShaderProgram(gl, vsSource, fsSource) {
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh) || 'Shader compile error');
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl.FRAGMENT_SHADER, fsSource);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || 'Program link error');
  }
  return prog;
}

export function buildProceduralCityMeshes(gl, world) {
  const opaque = new MeshBuilder();
  const emissive = new MeshBuilder();

  // 1. Base ground terrain, beach sand & Atlantic Ocean
  opaque.addBox(-55, -0.3, 0, 355, 0.6, 480, [0.22, 0.25, 0.29]);
  // Praia Solmar boardwalk mosaic promenade
  opaque.addBox(106, 0.06, 0, 12, 0.12, 470, [0.84, 0.76, 0.68]);
  // Golden sandy beach strip
  opaque.addBox(122, -0.08, 0, 22, 0.2, 480, [0.95, 0.84, 0.62]);
  // Atlantic Ocean water plane
  opaque.addBox(235, -0.22, 0, 210, 0.2, 520, [0.06, 0.44, 0.68]);
  // Sunset ocean shimmer wave bands & marina speedboats
  for (let i = 0; i < 16; i++) {
    const wz = -210 + i * 28;
    emissive.addBox(145 + (i % 3) * 14, -0.09, wz, 14, 0.04, 2.2, [1.0, 0.68, 0.36]);
  }
  const boatCoords = [
    [138, -22],
    [152, 8],
    [144, 42],
  ];
  for (const [bx, bz] of boatCoords) {
    opaque.addBox(bx, 0.35, bz, 2.8, 0.8, 7.2, [0.95, 0.96, 0.99]);
    opaque.addBox(bx, 0.95, bz - 0.5, 2.1, 0.65, 3.2, [0.14, 0.24, 0.38]);
    emissive.addBox(bx, 0.55, bz, 2.9, 0.14, 6.4, [0.0, 0.88, 1.0]);
  }
  // Distant sunset horizon glow band & sun disc in the north/east sky
  emissive.addBox(45, 38, -255, 420, 22, 2, [1.0, 0.72, 0.44]);
  emissive.addBox(98, 52, -252, 26, 26, 2, [1.0, 0.88, 0.52]);

  // 2. Roadways, sidewalks, lane markings & zebra crosswalks
  for (const rx of ROAD_X_COORDS) {
    opaque.addBox(rx - (ROAD_WIDTH * 0.5 + 2.4), 0.08, 0, 4.8, 0.16, 460, [0.54, 0.56, 0.6]);
    opaque.addBox(rx + (ROAD_WIDTH * 0.5 + 2.4), 0.08, 0, 4.8, 0.16, 460, [0.54, 0.56, 0.6]);
    opaque.addBox(rx, 0.02, 0, ROAD_WIDTH, 0.04, 460, [0.14, 0.16, 0.2]);

    for (let z = -215; z <= 215; z += 12) {
      if (Math.abs(z % 90) < 12) continue;
      opaque.addBox(rx, 0.05, z, 0.32, 0.03, 5.2, [0.96, 0.78, 0.22]);
      opaque.addBox(rx - 4.4, 0.05, z, 0.22, 0.03, 3.6, [0.88, 0.91, 0.96]);
      opaque.addBox(rx + 4.4, 0.05, z, 0.22, 0.03, 3.6, [0.88, 0.91, 0.96]);
    }
  }

  for (const rz of ROAD_Z_COORDS) {
    opaque.addBox(-52, 0.025, rz, 344, 0.04, ROAD_WIDTH, [0.14, 0.16, 0.2]);
    for (let x = -215; x <= 102; x += 12) {
      if (Math.abs(x % 90) < 12) continue;
      opaque.addBox(x, 0.055, rz, 5.2, 0.03, 0.32, [0.96, 0.78, 0.22]);
    }
  }

  // Intersections & zebra crosswalks + traffic signal poles
  for (const inter of world.intersections) {
    for (let s = -7.5; s <= 7.5; s += 2.5) {
      opaque.addBox(inter.x + s, 0.06, inter.z - 11.2, 1.1, 0.03, 2.8, [0.92, 0.94, 0.98]);
      opaque.addBox(inter.x + s, 0.06, inter.z + 11.2, 1.1, 0.03, 2.8, [0.92, 0.94, 0.98]);
      opaque.addBox(inter.x - 11.2, 0.06, inter.z + s, 2.8, 0.03, 1.1, [0.92, 0.94, 0.98]);
      opaque.addBox(inter.x + 11.2, 0.06, inter.z + s, 2.8, 0.03, 1.1, [0.92, 0.94, 0.98]);
    }

    // Traffic signal gantry on corner
    const gx = inter.x + 10.8;
    const gz = inter.z - 10.8;
    opaque.addBox(gx, 3.6, gz, 0.36, 7.2, 0.36, [0.24, 0.27, 0.32]);
    opaque.addBox(gx - 2.6, 6.9, gz, 5.2, 0.28, 0.28, [0.24, 0.27, 0.32]);
    emissive.addBox(gx - 3.6, 6.7, gz, 0.55, 0.55, 0.55, [0.18, 0.98, 0.48]);
    emissive.addBox(gx - 2.2, 6.7, gz, 0.55, 0.55, 0.55, [1.0, 0.24, 0.32]);
  }

  // 3. Buildings, neon roof trims & 3D window grids
  for (const b of world.buildings) {
    // Ground plinth
    opaque.addBox(b.x, 1.4, b.z, b.w * 1.03, 2.8, b.d * 1.03, [
      b.baseColor[0] * 0.78,
      b.baseColor[1] * 0.78,
      b.baseColor[2] * 0.82,
    ]);
    // Main tower
    opaque.addBox(b.x, b.h * 0.5, b.z, b.w, b.h, b.d, b.baseColor);
    // Neon roof crown strip
    emissive.addBox(b.x, b.h + 0.35, b.z, b.w * 1.02, 0.65, b.d * 1.02, b.trimColor);

    if (b.hasSetbackTower) {
      const topH = b.h * 0.24;
      opaque.addBox(b.x, b.h + topH * 0.5, b.z, b.w * 0.64, topH, b.d * 0.64, b.baseColor);
      emissive.addBox(b.x, b.h + topH + 0.25, b.z, b.w * 0.66, 0.45, b.d * 0.66, b.trimColor);
    }

    // Glowing window bands along all 4 sides
    const floors = Math.min(10, Math.max(3, Math.floor(b.h / 4.8)));
    for (let f = 1; f < floors; f++) {
      const wy = f * 4.4;
      if (wy > b.h - 2.2) break;
      const litColor = (f + Math.floor(Math.abs(b.x))) % 3 === 0 ? b.trimColor : b.windowColor;
      emissive.addBox(b.x, wy, b.z, b.w + 0.16, 1.15, b.d * 0.82, litColor);
      emissive.addBox(b.x, wy, b.z, b.w * 0.82, 1.15, b.d + 0.16, litColor);
    }
  }

  // 4. Palm trees along coastal boardwalk & avenues
  for (const p of world.palms) {
    const segs = 4;
    const segH = p.height / segs;
    for (let s = 0; s < segs; s++) {
      const frac = s / segs;
      const tx = p.x + p.leanX * frac * 2.2;
      const tz = p.z + p.leanZ * frac * 2.2;
      const w = 0.48 * (1 - frac * 0.35);
      opaque.addBox(tx, (s + 0.5) * segH, tz, w, segH * 1.05, w, [0.48, 0.34, 0.22]);
    }
    const topX = p.x + p.leanX * 2.2;
    const topZ = p.z + p.leanZ * 2.2;
    const topY = p.height;
    const frondDirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [0.7, 0.7],
      [-0.7, -0.7],
    ];
    for (const [fx, fz] of frondDirs) {
      opaque.addBox(topX + fx * 1.55, topY + 0.15, topZ + fz * 1.55, 1.8, 0.26, 1.8, [0.16, 0.68, 0.34]);
      opaque.addBox(topX + fx * 2.65, topY - 0.35, topZ + fz * 2.65, 1.3, 0.2, 1.3, [0.12, 0.56, 0.28]);
    }
  }

  // 5. Streetlamps with glowing halos
  for (const lamp of world.streetlamps) {
    opaque.addBox(lamp.x, lamp.height * 0.5, lamp.z, 0.22, lamp.height, 0.22, [0.28, 0.32, 0.38]);
    emissive.addBox(lamp.x, lamp.height + 0.2, lamp.z, 0.85, 0.42, 0.85, lamp.neonColor);
  }

  // 6. Saltworks Harbor containers & gantry cranes
  for (const c of world.containers) {
    opaque.addBox(c.x, c.h * 0.5, c.z, c.w, c.h, c.d, c.color);
  }
  for (const cr of world.cranes) {
    opaque.addBox(cr.x - 4, cr.height * 0.5, cr.z, 1.2, cr.height, 1.2, cr.color);
    opaque.addBox(cr.x + 4, cr.height * 0.5, cr.z, 1.2, cr.height, 1.2, cr.color);
    opaque.addBox(cr.x + 6, cr.height - 1.2, cr.z, cr.boomLength, 1.4, 2.2, cr.color);
  }

  return {
    opaqueBuffer: uploadMeshBuilder(gl, opaque),
    emissiveBuffer: uploadMeshBuilder(gl, emissive),
  };
}

function uploadMeshBuilder(gl, builder) {
  const arr = new Float32Array(builder.data);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
  return { vbo, count: arr.length / 10 };
}

export class WebGL2CityRenderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.program = compileShaderProgram(this.gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
    this.uViewProj = this.gl.getUniformLocation(this.program, 'uViewProj');
    this.uModel = this.gl.getUniformLocation(this.program, 'uModel');
    this.uSunDir = this.gl.getUniformLocation(this.program, 'uSunDir');
    this.uSunColor = this.gl.getUniformLocation(this.program, 'uSunColor');
    this.uAmbientColor = this.gl.getUniformLocation(this.program, 'uAmbientColor');
    this.uFogColor = this.gl.getUniformLocation(this.program, 'uFogColor');
    this.uCameraPos = this.gl.getUniformLocation(this.program, 'uCameraPos');
    this.uEmissive = this.gl.getUniformLocation(this.program, 'uEmissive');

    this.cityMeshes = buildProceduralCityMeshes(this.gl, world);
    this.dynamicVbo = this.gl.createBuffer();

    this.cameraEye = [86, 6.2, 10];
    this.cameraTarget = [86, 1.8, 28];
    this.cameraYaw = 0;
    this.viewProjMatrix = createIdentityMat4();
    this.lightingPreset = 'golden';
  }

  bindVertexLayout(vbo) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const stride = 10 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 6 * 4);
  }

  drawDynamicBuilder(builder, emissiveAmount = 0.0, alphaBlend = false) {
    if (builder.data.length === 0) return;
    const gl = this.gl;
    if (alphaBlend) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
    }
    const arr = new Float32Array(builder.data);
    this.bindVertexLayout(this.dynamicVbo);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
    gl.uniform1f(this.uEmissive, emissiveAmount);
    gl.drawArrays(gl.TRIANGLES, 0, arr.length / 10);
    if (alphaBlend) {
      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }
  }
}

export function updateFollowCameraMatrix(renderer, player, cameraOverride = null, dt = 0.016) {
  if (cameraOverride) {
    renderer.cameraEye = [...cameraOverride.eye];
    renderer.cameraTarget = [...cameraOverride.target];
    renderer.cameraYaw = Math.atan2(
      renderer.cameraTarget[0] - renderer.cameraEye[0],
      renderer.cameraTarget[2] - renderer.cameraEye[2]
    );
  } else {
    const targetHeading = player.inVehicle ? player.inVehicle.heading : player.heading;
    let diff = targetHeading - renderer.cameraYaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    renderer.cameraYaw += diff * Math.min(1, dt * 6.5);

    const distBack = player.inVehicle ? 11.2 : 7.4;
    const heightUp = player.inVehicle ? 4.4 : 3.2;
    const desiredEyeX = player.x - Math.sin(renderer.cameraYaw) * distBack;
    const desiredEyeY = heightUp;
    const desiredEyeZ = player.z - Math.cos(renderer.cameraYaw) * distBack;

    renderer.cameraEye[0] += (desiredEyeX - renderer.cameraEye[0]) * Math.min(1, dt * 10);
    renderer.cameraEye[1] += (desiredEyeY - renderer.cameraEye[1]) * Math.min(1, dt * 10);
    renderer.cameraEye[2] += (desiredEyeZ - renderer.cameraEye[2]) * Math.min(1, dt * 10);

    renderer.cameraTarget[0] = player.x + Math.sin(renderer.cameraYaw) * 6.5;
    renderer.cameraTarget[1] = player.inVehicle ? 1.5 : 1.45;
    renderer.cameraTarget[2] = player.z + Math.cos(renderer.cameraYaw) * 6.5;
  }

  const aspect = (renderer.canvas.width || 1280) / (renderer.canvas.height || 800);
  const proj = createPerspectiveMat4((56 * Math.PI) / 180, aspect, 0.5, 420.0);
  const view = createLookAtMat4(renderer.cameraEye, renderer.cameraTarget, [0, 1, 0]);
  renderer.viewProjMatrix = multiplyMat4(proj, view);
  return renderer.viewProjMatrix;
}

export function buildVehicleArchetypeMeshes(opaque, emissive, trans, v) {
  const arch = VEHICLE_ARCHETYPES[v.archetype] || VEHICLE_ARCHETYPES.manta_gt;
  const c = Math.cos(v.heading);
  const s = Math.sin(v.heading);

  const toWorld = (lx, ly, lz) => [v.x + lx * c + lz * s, ly, v.z - lx * s + lz * c];

  const addLocalBox = (builder, lx, ly, lz, w, h, d, color, alpha = 1.0) => {
    const hw = w * 0.5;
    const hh = h * 0.5;
    const hd = d * 0.5;
    const corners = [
      toWorld(lx - hw, ly - hh, lz - hd),
      toWorld(lx + hw, ly - hh, lz - hd),
      toWorld(lx + hw, ly - hh, lz + hd),
      toWorld(lx - hw, ly - hh, lz + hd),
      toWorld(lx - hw, ly + hh, lz - hd),
      toWorld(lx + hw, ly + hh, lz - hd),
      toWorld(lx + hw, ly + hh, lz + hd),
      toWorld(lx - hw, ly + hh, lz + hd),
    ];
    // Top
    builder.addQuad(corners[7], corners[6], corners[5], corners[4], 0, 1, 0, color, alpha);
    // Front (+Z)
    builder.addQuad(corners[3], corners[2], corners[6], corners[7], s, 0, c, color, alpha);
    // Back (-Z)
    builder.addQuad(corners[1], corners[0], corners[4], corners[5], -s, 0, -c, color, alpha);
    // Right (+X)
    builder.addQuad(corners[2], corners[1], corners[5], corners[6], c, 0, -s, color, alpha);
    // Left (-X)
    builder.addQuad(corners[0], corners[3], corners[7], corners[4], -c, 0, s, color, alpha);
  };

  // Soft ground shadow quad
  addLocalBox(trans, 0, 0.04, 0, arch.width * 1.16, 0.02, arch.length * 1.12, [0.02, 0.03, 0.06], 0.52);

  // Lower body chassis
  const bodyH = arch.height * 0.52;
  addLocalBox(opaque, 0, 0.36 + bodyH * 0.5, 0, arch.width, bodyH, arch.length, v.color);

  // Side neon / chrome trim stripe
  addLocalBox(
    emissive,
    0,
    0.42,
    0,
    arch.width + 0.06,
    0.1,
    arch.length * 0.86,
    v.isPolice ? [0.95, 0.96, 1.0] : v.accentColor || [0.15, 0.92, 1.0]
  );

  // Cabin greenhouse
  const cabH = arch.height * 0.46;
  const cabLen = v.archetype === 'saltworks_van' ? arch.length * 0.72 : arch.length * 0.52;
  const cabZ = v.archetype === 'manta_gt' ? -0.15 : -0.1;
  addLocalBox(
    opaque,
    0,
    0.36 + bodyH + cabH * 0.5,
    cabZ,
    arch.width * 0.84,
    cabH,
    cabLen,
    v.isPolice ? [0.94, 0.96, 0.99] : v.color
  );

  // Tinted glass windshield & windows
  addLocalBox(
    opaque,
    0,
    0.36 + bodyH + cabH * 0.48,
    cabZ,
    arch.width * 0.86,
    cabH * 0.74,
    cabLen * 0.86,
    [0.1, 0.16, 0.25]
  );
  addLocalBox(
    opaque,
    0,
    0.36 + bodyH + cabH * 0.48,
    cabZ,
    arch.width * 0.78,
    cabH * 0.74,
    cabLen * 1.02,
    [0.1, 0.16, 0.25]
  );

  // Rear wing on sports cars
  if (v.archetype === 'manta_gt' || v.archetype === 'kestrel_rs') {
    addLocalBox(opaque, 0, 0.36 + bodyH + 0.24, -arch.length * 0.44, arch.width * 0.92, 0.08, 0.34, [0.12, 0.14, 0.18]);
  }

  // 4 Wheels
  const wheelX = arch.width * 0.48;
  const wheelZ = arch.length * 0.32;
  for (const wx of [-wheelX, wheelX]) {
    for (const wz of [-wheelZ, wheelZ]) {
      addLocalBox(opaque, wx, 0.32, wz, 0.32, 0.62, 0.62, [0.08, 0.09, 0.11]);
      addLocalBox(opaque, wx * 1.03, 0.32, wz, 0.34, 0.34, 0.34, [0.72, 0.76, 0.82]);
    }
  }

  // Headlights & Taillights
  addLocalBox(emissive, -arch.width * 0.34, 0.54, arch.length * 0.5, 0.36, 0.18, 0.08, [1.0, 0.96, 0.82]);
  addLocalBox(emissive, arch.width * 0.34, 0.54, arch.length * 0.5, 0.36, 0.18, 0.08, [1.0, 0.96, 0.82]);
  addLocalBox(emissive, 0, 0.56, -arch.length * 0.5, arch.width * 0.78, 0.16, 0.08, [1.0, 0.14, 0.24]);

  // Twin exhaust / nitro glow when moving fast
  if (Math.abs(v.speed) > 25 && !v.isPolice) {
    addLocalBox(emissive, -0.42, 0.28, -arch.length * 0.52, 0.18, 0.14, 0.42, [0.2, 0.88, 1.0]);
    addLocalBox(emissive, 0.42, 0.28, -arch.length * 0.52, 0.18, 0.14, 0.42, [0.2, 0.88, 1.0]);
  }

  // Police strobe lightbar & ground flash pool
  if (v.isPolice) {
    const topY = 0.36 + bodyH + cabH + 0.12;
    const redBright = Math.sin(v.sirenPhase) > 0;
    addLocalBox(
      emissive,
      -0.38,
      topY,
      cabZ,
      0.56,
      0.2,
      0.32,
      redBright ? [1.0, 0.12, 0.22] : [0.45, 0.08, 0.12]
    );
    addLocalBox(
      emissive,
      0.38,
      topY,
      cabZ,
      0.56,
      0.2,
      0.32,
      !redBright ? [0.12, 0.58, 1.0] : [0.08, 0.22, 0.48]
    );
    // Siren glow pool on asphalt
    addLocalBox(
      trans,
      0,
      0.05,
      0,
      arch.width * 2.4,
      0.02,
      arch.length * 1.6,
      redBright ? [1.0, 0.15, 0.28] : [0.15, 0.58, 1.0],
      0.22
    );
  }
}

export function buildArticulatedCharacterMesh(opaque, emissive, trans, charObj, isPlayer = false) {
  const c = Math.cos(charObj.heading);
  const s = Math.sin(charObj.heading);
  const toWorld = (lx, ly, lz) => [charObj.x + lx * c + lz * s, ly, charObj.z - lx * s + lz * c];

  const addPart = (builder, lx, ly, lz, w, h, d, color, alpha = 1.0) => {
    const hw = w * 0.5;
    const hh = h * 0.5;
    const hd = d * 0.5;
    const corners = [
      toWorld(lx - hw, ly - hh, lz - hd),
      toWorld(lx + hw, ly - hh, lz - hd),
      toWorld(lx + hw, ly - hh, lz + hd),
      toWorld(lx - hw, ly - hh, lz + hd),
      toWorld(lx - hw, ly + hh, lz - hd),
      toWorld(lx + hw, ly + hh, lz - hd),
      toWorld(lx + hw, ly + hh, lz + hd),
      toWorld(lx - hw, ly + hh, lz + hd),
    ];
    builder.addQuad(corners[7], corners[6], corners[5], corners[4], 0, 1, 0, color, alpha);
    builder.addQuad(corners[3], corners[2], corners[6], corners[7], s, 0, c, color, alpha);
    builder.addQuad(corners[1], corners[0], corners[4], corners[5], -s, 0, -c, color, alpha);
    builder.addQuad(corners[2], corners[1], corners[5], corners[6], c, 0, -s, color, alpha);
    builder.addQuad(corners[0], corners[3], corners[7], corners[4], -c, 0, s, color, alpha);
  };

  const stride = Math.sin(charObj.walkCycle || 0) * 0.18;
  const outfit = isPlayer
    ? OUTFIT_STYLES[charObj.outfitIndex % OUTFIT_STYLES.length]
    : { torso: charObj.shirtColor || [0.9, 0.3, 0.5], legs: charObj.pantsColor || [0.16, 0.18, 0.24] };

  // Shadow
  addPart(trans, 0, 0.04, 0, 0.95, 0.02, 0.95, [0.02, 0.03, 0.06], 0.48);
  // Legs
  addPart(opaque, -0.16, 0.42, stride, 0.22, 0.78, 0.24, outfit.legs);
  addPart(opaque, 0.16, 0.42, -stride, 0.22, 0.78, 0.24, outfit.legs);
  // Torso jacket
  addPart(opaque, 0, 1.08, 0, 0.56, 0.68, 0.34, outfit.torso);
  // Head & hair
  addPart(opaque, 0, 1.62, 0, 0.36, 0.36, 0.36, [0.88, 0.68, 0.54]);
  addPart(opaque, 0, 1.78, -0.02, 0.38, 0.14, 0.38, [0.12, 0.1, 0.14]);
  // Arms & weapon
  addPart(opaque, 0.32, 1.16, 0.22, 0.18, 0.22, 0.52, outfit.torso);
  if (isPlayer || charObj.isHostile || charObj.isPoliceOfficer) {
    addPart(opaque, 0.28, 1.18, 0.58, 0.12, 0.16, 0.58, [0.18, 0.2, 0.24]);
  }
  if ((charObj.muzzleFlashTimer || 0) > 0) {
    addPart(emissive, 0.28, 1.2, 1.05, 0.48, 0.48, 0.48, [1.0, 0.86, 0.28]);
  }
}

export function render3DOpenWorldScene(
  renderer,
  world,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector,
  projectiles,
  particles,
  gpsRoute
) {
  const gl = renderer.gl;
  gl.viewport(0, 0, renderer.canvas.width, renderer.canvas.height);

  const isDuskPursuit = renderer.lightingPreset === 'dusk';
  if (isDuskPursuit) {
    gl.clearColor(0.11, 0.14, 0.28, 1.0);
  } else {
    gl.clearColor(0.96, 0.56, 0.44, 1.0);
  }
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(renderer.program);
  gl.uniformMatrix4fv(renderer.uViewProj, false, renderer.viewProjMatrix);
  gl.uniformMatrix4fv(renderer.uModel, false, createIdentityMat4());
  gl.uniform3f(renderer.uCameraPos, renderer.cameraEye[0], renderer.cameraEye[1], renderer.cameraEye[2]);

  if (isDuskPursuit) {
    gl.uniform3f(renderer.uSunDir, 0.52, 0.42, -0.35);
    gl.uniform3f(renderer.uSunColor, 0.92, 0.56, 0.78);
    gl.uniform3f(renderer.uAmbientColor, 0.38, 0.44, 0.68);
    gl.uniform3f(renderer.uFogColor, 0.16, 0.19, 0.36);
  } else {
    gl.uniform3f(renderer.uSunDir, 0.64, 0.52, 0.25);
    gl.uniform3f(renderer.uSunColor, 1.0, 0.84, 0.64);
    gl.uniform3f(renderer.uAmbientColor, 0.56, 0.58, 0.68);
    gl.uniform3f(renderer.uFogColor, 0.96, 0.64, 0.52);
  }

  // 1. Static Opaque City Geometry
  renderer.bindVertexLayout(renderer.cityMeshes.opaqueBuffer.vbo);
  gl.uniform1f(renderer.uEmissive, 0.0);
  gl.drawArrays(gl.TRIANGLES, 0, renderer.cityMeshes.opaqueBuffer.count);

  // 2. Static Emissive Windows, Neon & Ocean Shimmer
  renderer.bindVertexLayout(renderer.cityMeshes.emissiveBuffer.vbo);
  gl.uniform1f(renderer.uEmissive, 0.92);
  gl.drawArrays(gl.TRIANGLES, 0, renderer.cityMeshes.emissiveBuffer.count);

  // 3. Build Dynamic Frame Geometry (Vehicles, Characters, Chopper, Tracers, Beacons)
  const dynOpaque = new MeshBuilder();
  const dynEmissive = new MeshBuilder();
  const dynTrans = new MeshBuilder();

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.hp <= 0) continue;
    buildVehicleArchetypeMeshes(dynOpaque, dynEmissive, dynTrans, v);
  }

  if (!player.inVehicle) {
    buildArticulatedCharacterMesh(dynOpaque, dynEmissive, dynTrans, player, true);
  }

  for (let i = 0; i < pedestrians.length; i++) {
    const p = pedestrians[i];
    if (p.hp <= 0) continue;
    buildArticulatedCharacterMesh(dynOpaque, dynEmissive, dynTrans, p, false);
  }

  // Police Chopper & Volumetric Spotlight Cone
  if (police.chopper.active) {
    const ch = police.chopper;
    dynOpaque.addBox(ch.x, ch.y, ch.z, 2.4, 1.8, 4.8, [0.12, 0.16, 0.28]);
    dynOpaque.addBox(ch.x, ch.y + 0.2, ch.z - 3.6, 0.65, 0.65, 3.8, [0.16, 0.2, 0.34]);
    dynEmissive.addBox(ch.x, ch.y - 0.85, ch.z + 1.2, 0.9, 0.35, 0.9, [0.88, 0.96, 1.0]);
    // Spinning rotor blades
    const rCos = Math.cos(ch.rotorAngle) * 4.8;
    const rSin = Math.sin(ch.rotorAngle) * 4.8;
    dynOpaque.addBox(ch.x, ch.y + 1.15, ch.z, Math.abs(rCos) + 0.6, 0.1, Math.abs(rSin) + 0.6, [0.82, 0.86, 0.92]);
    // Volumetric spotlight cone from chopper to ground
    dynTrans.addPyramidCone(ch.spotX, ch.y - 1.0, 0.08, ch.spotZ, 8.2, 12, [0.78, 0.94, 1.0], 0.2);
    dynTrans.addBox(ch.spotX, 0.07, ch.spotZ, 13.5, 0.04, 13.5, [0.65, 0.92, 1.0], 0.28);
  }

  // Active Mission 3D Waypoint Beacon & GPS Route Chevrons
  const m = missionDirector.activeMission;
  if (m) {
    dynTrans.addPyramidCone(m.targetX, 16.0, 0.1, m.targetZ, 3.2, 10, [1.0, 0.82, 0.18], 0.34);
    dynEmissive.addBox(m.targetX, 0.12, m.targetZ, 4.6, 0.12, 4.6, [1.0, 0.78, 0.15]);
  }

  if (gpsRoute && gpsRoute.length >= 2) {
    for (let i = 0; i < gpsRoute.length - 1; i++) {
      const a = gpsRoute[i];
      const b = gpsRoute[i + 1];
      const segLen = Math.hypot(b.x - a.x, b.z - a.z);
      const steps = Math.min(18, Math.floor(segLen / 9));
      for (let s = 1; s <= steps; s++) {
        const t = s / (steps + 1);
        const gx = a.x + (b.x - a.x) * t;
        const gz = a.z + (b.z - a.z) * t;
        dynEmissive.addBox(gx, 0.08, gz, 1.35, 0.05, 1.35, [1.0, 0.24, 0.74]);
      }
    }
  }

  // Interactive POI Beacons
  for (const poi of world.pois) {
    dynEmissive.addBox(poi.x, 0.12, poi.z, 3.2, 0.12, 3.2, poi.color);
    dynTrans.addPyramidCone(poi.x, 7.5, 0.2, poi.z, 1.8, 8, poi.color, 0.28);
  }

  // Projectiles (3D Bullet Tracer Beams) & Explosion Particles
  for (let i = 0; i < projectiles.length; i++) {
    const pr = projectiles[i];
    const mx = (pr.x + pr.prevX) * 0.5;
    const my = (pr.y + pr.prevY) * 0.5;
    const mz = (pr.z + pr.prevZ) * 0.5;
    dynEmissive.addBox(mx, my, mz, 0.24, 0.24, 1.65, pr.color);
    dynEmissive.addBox(pr.x, pr.y, pr.z, 0.34, 0.34, 0.34, [1.0, 0.96, 0.78]);
  }

  for (let i = 0; i < particles.length; i++) {
    const pt = particles[i];
    dynEmissive.addBox(pt.x, Math.max(0.1, pt.y), pt.z, pt.size, pt.size, pt.size, pt.color);
  }

  renderer.drawDynamicBuilder(dynOpaque, 0.0, false);
  renderer.drawDynamicBuilder(dynEmissive, 0.95, false);
  renderer.drawDynamicBuilder(dynTrans, 0.65, true);
}

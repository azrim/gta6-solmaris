// Solmar Coast: Neon Syndicate — 3D Open-World Districts, Road Grid, Buildings, POIs & Collision AABBs

export const SOLMAR_DISTRICTS = [
  {
    id: 'praia',
    name: 'Praia Solmar',
    subtitle: 'Sunlit Boardwalk & Neon Resort Strip',
    bounds: { minX: 15, maxX: 220, minZ: -240, maxZ: 240 },
    themeColor: '#ff6b9d',
    accentColor: '#38ef7d',
    skyTint: [1.0, 0.72, 0.54],
  },
  {
    id: 'glassline',
    name: 'Downtown Glassline',
    subtitle: 'Financial High-Rises & Syndicate Towers',
    bounds: { minX: -120, maxX: 15, minZ: -240, maxZ: 25 },
    themeColor: '#00e5ff',
    accentColor: '#7c4dff',
    skyTint: [0.55, 0.78, 1.0],
  },
  {
    id: 'saltworks',
    name: 'Saltworks Harbor',
    subtitle: 'Container Docks, Cranes & Smuggler Piers',
    bounds: { minX: -240, maxX: 15, minZ: 25, maxZ: 240 },
    themeColor: '#ffb300',
    accentColor: '#ff5252',
    skyTint: [0.95, 0.68, 0.42],
  },
  {
    id: 'cerro',
    name: 'Cerro Alto',
    subtitle: 'Hillside Terraces, Radio Array & Overlook',
    bounds: { minX: -240, maxX: -120, minZ: -240, maxZ: 25 },
    themeColor: '#69f0ae',
    accentColor: '#ffd740',
    skyTint: [0.68, 0.88, 0.78],
  },
];

export const ROAD_X_COORDS = [-180, -90, 0, 90];
export const ROAD_Z_COORDS = [-180, -90, 0, 90, 180];
export const ROAD_WIDTH = 20;
export const SIDEWALK_WIDTH = 4.5;
export const COASTLINE_X = 118;

export function createSeededRandom(seed = 1) {
  let state = (seed >>> 0) || 1;
  return function nextRand() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleDistrictAt(x, z) {
  if (x >= 15) return SOLMAR_DISTRICTS[0];
  if (z >= 25) return SOLMAR_DISTRICTS[2];
  if (x < -120) return SOLMAR_DISTRICTS[3];
  return SOLMAR_DISTRICTS[1];
}

export function isPointOnRoad(x, z, margin = 0) {
  const half = ROAD_WIDTH * 0.5 + margin;
  for (let i = 0; i < ROAD_X_COORDS.length; i++) {
    if (Math.abs(x - ROAD_X_COORDS[i]) <= half && z >= -225 && z <= 225) return true;
  }
  for (let j = 0; j < ROAD_Z_COORDS.length; j++) {
    if (Math.abs(z - ROAD_Z_COORDS[j]) <= half && x >= -225 && x <= COASTLINE_X - 4) return true;
  }
  return false;
}

export function buildSolmarCityWorld(seed = 101) {
  const rand = createSeededRandom(seed);
  const buildings = [];
  const palms = [];
  const streetlamps = [];
  const intersections = [];
  const containers = [];
  const cranes = [];
  const cctvCameras = [];

  for (const rx of ROAD_X_COORDS) {
    for (const rz of ROAD_Z_COORDS) {
      intersections.push({
        x: rx,
        z: rz,
        phaseOffset: ((rx + rz) * 0.017) % 12,
        nsGreen: true,
        yellow: false,
      });

      const lampOffsets = [
        [-12.5, -12.5],
        [12.5, -12.5],
        [-12.5, 12.5],
        [12.5, 12.5],
      ];
      for (const [ox, oz] of lampOffsets) {
        if (rx + ox > COASTLINE_X - 2) continue;
        streetlamps.push({
          x: rx + ox,
          z: rz + oz,
          height: 8.5,
          neonColor: rx >= 90 ? [1.0, 0.38, 0.72] : [1.0, 0.85, 0.58],
        });
      }
    }
  }

  const blockRangesX = [
    [-228, -194],
    [-166, -104],
    [-76, -14],
    [14, 76],
  ];
  const blockRangesZ = [
    [-228, -194],
    [-166, -104],
    [-76, -14],
    [14, 76],
    [104, 166],
    [194, 228],
  ];

  const facades = {
    praia: [
      { base: [0.96, 0.84, 0.78], trim: [1.0, 0.32, 0.66], window: [0.35, 0.92, 0.98] },
      { base: [0.84, 0.94, 0.92], trim: [0.18, 0.95, 0.76], window: [1.0, 0.78, 0.42] },
      { base: [0.95, 0.78, 0.88], trim: [0.98, 0.72, 0.22], window: [0.42, 0.95, 1.0] },
      { base: [0.92, 0.89, 0.76], trim: [0.32, 0.82, 1.0], window: [1.0, 0.52, 0.78] },
    ],
    glassline: [
      { base: [0.14, 0.22, 0.36], trim: [0.0, 0.88, 1.0], window: [0.48, 0.86, 1.0] },
      { base: [0.18, 0.19, 0.32], trim: [0.68, 0.36, 1.0], window: [0.82, 0.68, 1.0] },
      { base: [0.12, 0.27, 0.38], trim: [0.18, 0.96, 0.78], window: [0.55, 0.95, 0.92] },
    ],
    saltworks: [
      { base: [0.36, 0.34, 0.33], trim: [1.0, 0.62, 0.14], window: [0.98, 0.76, 0.35] },
      { base: [0.28, 0.33, 0.38], trim: [0.92, 0.32, 0.24], window: [0.85, 0.88, 0.92] },
    ],
    cerro: [
      { base: [0.78, 0.64, 0.48], trim: [0.32, 0.92, 0.62], window: [1.0, 0.84, 0.48] },
      { base: [0.68, 0.76, 0.62], trim: [1.0, 0.74, 0.28], window: [0.96, 0.88, 0.64] },
    ],
  };

  for (const [bx0, bx1] of blockRangesX) {
    for (const [bz0, bz1] of blockRangesZ) {
      const cx = (bx0 + bx1) * 0.5;
      const cz = (bz0 + bz1) * 0.5;
      const district = sampleDistrictAt(cx, cz);
      const spanX = bx1 - bx0;
      const spanZ = bz1 - bz0;

      const subCols = spanX > 45 ? 2 : 1;
      const subRows = spanZ > 45 ? 2 : 1;
      const cellW = spanX / subCols;
      const cellD = spanZ / subRows;

      for (let ix = 0; ix < subCols; ix++) {
        for (let iz = 0; iz < subRows; iz++) {
          const px = bx0 + (ix + 0.5) * cellW;
          const pz = bz0 + (iz + 0.5) * cellD;
          const bw = cellW * (0.68 + rand() * 0.18);
          const bd = cellD * (0.68 + rand() * 0.18);

          let bh = 18 + rand() * 22;
          if (district.id === 'glassline') {
            bh = 34 + rand() * 48;
          } else if (district.id === 'praia') {
            bh = 16 + rand() * 24;
          } else if (district.id === 'saltworks') {
            bh = 11 + rand() * 14;
          } else if (district.id === 'cerro') {
            bh = 14 + rand() * 20;
          }

          const paletteList = facades[district.id] || facades.praia;
          const palette = paletteList[Math.floor(rand() * paletteList.length)];

          buildings.push({
            id: `bldg_${buildings.length}`,
            x: px,
            z: pz,
            w: bw,
            d: bd,
            h: bh,
            districtId: district.id,
            baseColor: palette.base,
            trimColor: palette.trim,
            windowColor: palette.window,
            hasSetbackTower: bh > 28 && rand() > 0.3,
            hasRooftopHelipad: bh > 46 && rand() > 0.5,
          });
        }
      }
    }
  }

  // Add iconic coastal hotel towers along Praia Solmar strip (west side of Ocean Drive)
  const landmarkTowers = [
    { x: 56, z: -48, w: 22, d: 22, h: 44, base: [0.96, 0.86, 0.82], trim: [1.0, 0.28, 0.68], win: [0.25, 0.94, 1.0] },
    { x: 56, z: 36, w: 22, d: 24, h: 48, base: [0.86, 0.95, 0.94], trim: [0.0, 0.92, 0.82], win: [1.0, 0.78, 0.36] },
    { x: -34, z: -44, w: 24, d: 24, h: 68, base: [0.12, 0.2, 0.34], trim: [0.0, 0.88, 1.0], win: [0.46, 0.88, 1.0] },
    { x: -34, z: 42, w: 24, d: 22, h: 58, base: [0.16, 0.18, 0.32], trim: [0.85, 0.32, 1.0], win: [0.76, 0.65, 1.0] },
  ];
  for (const lt of landmarkTowers) {
    // Replace overlapping auto building so landmarks stand cleanly
    for (let i = buildings.length - 1; i >= 0; i--) {
      const b = buildings[i];
      if (Math.abs(b.x - lt.x) < 18 && Math.abs(b.z - lt.z) < 18) {
        buildings.splice(i, 1);
      }
    }
    buildings.push({
      id: `landmark_${buildings.length}`,
      x: lt.x,
      z: lt.z,
      w: lt.w,
      d: lt.d,
      h: lt.h,
      districtId: lt.x > 15 ? 'praia' : 'glassline',
      baseColor: lt.base,
      trimColor: lt.trim,
      windowColor: lt.win,
      hasSetbackTower: true,
      hasRooftopHelipad: true,
    });
  }

  // Palm trees along Praia Solmar beachfront boardwalk and central boulevards
  for (let z = -210; z <= 210; z += 14) {
    if (Math.abs(z % 90) < 13) continue;
    palms.push({
      x: 104.5,
      z,
      height: 8.5 + (Math.abs(z * 13) % 5) * 0.6,
      leanX: 0.35,
      leanZ: ((z % 28) - 14) * 0.015,
    });
    palms.push({
      x: 76.5,
      z: z + 4,
      height: 7.8 + (Math.abs(z * 7) % 4) * 0.5,
      leanX: -0.22,
      leanZ: 0.12,
    });
  }

  for (let x = -160; x <= 70; x += 22) {
    if (Math.abs(x % 90) < 14) continue;
    palms.push({
      x,
      z: -12.5,
      height: 7.5,
      leanX: 0.15,
      leanZ: -0.18,
    });
    palms.push({
      x,
      z: 12.5,
      height: 7.5,
      leanX: -0.15,
      leanZ: 0.18,
    });
  }

  // Harbor cranes & cargo containers in Saltworks Harbor
  const containerColors = [
    [0.92, 0.28, 0.22],
    [0.18, 0.56, 0.88],
    [0.95, 0.68, 0.14],
    [0.2, 0.74, 0.52],
  ];
  for (let i = 0; i < 18; i++) {
    const cx = -155 + (i % 6) * 16;
    const cz = 118 + Math.floor(i / 6) * 18;
    if (isPointOnRoad(cx, cz, 8)) continue;
    containers.push({
      x: cx,
      z: cz,
      w: 11,
      d: 4.8,
      h: 4.2 + (i % 2) * 3.8,
      color: containerColors[i % containerColors.length],
    });
  }

  cranes.push(
    { x: -145, z: 156, height: 34, boomLength: 28, color: [1.0, 0.64, 0.12] },
    { x: -115, z: 156, height: 34, boomLength: 28, color: [0.95, 0.36, 0.18] }
  );

  // CCTV security nodes across key intersections
  const cctvCoords = [
    [0, 0],
    [90, 0],
    [0, -90],
    [-90, 90],
    [90, -90],
  ];
  for (let i = 0; i < cctvCoords.length; i++) {
    const [cx, cz] = cctvCoords[i];
    cctvCameras.push({
      id: `cctv_${i}`,
      x: cx + 11,
      z: cz + 11,
      disabledUntil: 0,
    });
  }

  const pois = [
    {
      id: 'safehouse_praia',
      type: 'safehouse',
      name: 'Villa Solmar Safehouse',
      prompt: '[E] SAVE GAME + SWAP OUTFIT (CLEAR OUTFIT HEAT)',
      x: 72,
      z: -24,
      color: [0.22, 0.96, 0.68],
      icon: 'H',
    },
    {
      id: 'customs_neon',
      type: 'customs',
      name: 'Neon Customs Respray',
      prompt: '[E] RESPRAY CAR & SWAP PLATES ($500 • CLEAR CAR HEAT)',
      x: 18,
      z: 68,
      color: [0.0, 0.88, 1.0],
      icon: 'C',
    },
    {
      id: 'armory_caldera',
      type: 'armory',
      name: 'Caldera Tactics Armory',
      prompt: '[E] REFILL AMMO & HEAVY KEVLAR ($350)',
      x: -68,
      z: -22,
      color: [1.0, 0.68, 0.2],
      icon: 'A',
    },
    {
      id: 'cctv_hub',
      type: 'cctv_terminal',
      name: 'Glassline CCTV Uplink',
      prompt: '[E] SCRUB SYNDICATE CCTV LOGS (CLEAR CCTV & FACE HEAT)',
      x: -18,
      z: -68,
      color: [0.85, 0.38, 1.0],
      icon: 'T',
    },
  ];

  return {
    buildings,
    palms,
    streetlamps,
    intersections,
    containers,
    cranes,
    cctvCameras,
    pois,
    bounds: { minX: -225, maxX: 112, minZ: -225, maxZ: 225 },
  };
}

export function updateTrafficSignalPhase(world, elapsedSec) {
  const cycle = 14.0;
  for (let i = 0; i < world.intersections.length; i++) {
    const inter = world.intersections[i];
    const t = (elapsedSec + inter.phaseOffset) % cycle;
    inter.nsGreen = t < cycle * 0.5;
    inter.yellow = (t > cycle * 0.42 && t < cycle * 0.5) || t > cycle * 0.92;
  }
}

export function getNearestIntersectionSignal(world, x, z) {
  let best = null;
  let bestDistSq = Infinity;
  for (let i = 0; i < world.intersections.length; i++) {
    const inter = world.intersections[i];
    const dx = inter.x - x;
    const dz = inter.z - z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      best = inter;
    }
  }
  return { intersection: best, dist: Math.sqrt(bestDistSq) };
}

export function resolveWorldCollisionAABB(world, x, z, radius = 1.6) {
  let nx = Math.max(world.bounds.minX, Math.min(world.bounds.maxX, x));
  let nz = Math.max(world.bounds.minZ, Math.min(world.bounds.maxZ, z));
  let collided = nx !== x || nz !== z;

  const checkBox = (bx, bz, halfW, halfD) => {
    const dx = nx - bx;
    const dz = nz - bz;
    const ox = halfW + radius - Math.abs(dx);
    const oz = halfD + radius - Math.abs(dz);
    if (ox > 0 && oz > 0) {
      collided = true;
      if (ox < oz) {
        nx += dx >= 0 ? ox : -ox;
      } else {
        nz += dz >= 0 ? oz : -oz;
      }
    }
  };

  for (let i = 0; i < world.buildings.length; i++) {
    const b = world.buildings[i];
    if (Math.abs(nx - b.x) > b.w + 6 || Math.abs(nz - b.z) > b.d + 6) continue;
    checkBox(b.x, b.z, b.w * 0.5, b.d * 0.5);
  }

  for (let i = 0; i < world.containers.length; i++) {
    const c = world.containers[i];
    if (Math.abs(nx - c.x) > c.w + 5 || Math.abs(nz - c.z) > c.d + 5) continue;
    checkBox(c.x, c.z, c.w * 0.5, c.d * 0.5);
  }

  return { x: nx, z: nz, collided };
}

export function computeGpsRouteWaypoints(startX, startZ, targetX, targetZ) {
  const nearestRoadVal = (val, arr) => {
    let best = arr[0];
    let bestDiff = Math.abs(val - best);
    for (let i = 1; i < arr.length; i++) {
      const d = Math.abs(val - arr[i]);
      if (d < bestDiff) {
        bestDiff = d;
        best = arr[i];
      }
    }
    return best;
  };

  const rxStart = nearestRoadVal(startX, ROAD_X_COORDS);
  const rzStart = nearestRoadVal(startZ, ROAD_Z_COORDS);
  const rxEnd = nearestRoadVal(targetX, ROAD_X_COORDS);
  const rzEnd = nearestRoadVal(targetZ, ROAD_Z_COORDS);

  const points = [{ x: startX, z: startZ }];
  points.push({ x: rxStart, z: startZ });
  points.push({ x: rxStart, z: rzEnd });
  if (Math.abs(rxEnd - rxStart) > 4) {
    points.push({ x: rxEnd, z: rzEnd });
  }
  points.push({ x: targetX, z: targetZ });
  return points;
}

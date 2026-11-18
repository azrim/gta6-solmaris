// Solmar Coast: Neon Syndicate — Vehicles, Traffic AI, Pedestrians,Hijacking & Weapon Combat

import {
  ROAD_X_COORDS,
  ROAD_Z_COORDS,
  createSeededRandom,
  getNearestIntersectionSignal,
  resolveWorldCollisionAABB,
} from './world.js';

export const VEHICLE_ARCHETYPES = {
  manta_gt: {
    id: 'manta_gt',
    name: 'Manta GT Coupe',
    maxSpeed: 48,
    accel: 30,
    turnRate: 2.35,
    length: 4.5,
    width: 2.05,
    height: 1.28,
    maxHp: 140,
    colors: [
      [0.05, 0.88, 0.98],
      [1.0, 0.22, 0.62],
      [0.98, 0.78, 0.12],
    ],
  },
  valkyrie_v8: {
    id: 'valkyrie_v8',
    name: 'Valkyrie V8 Muscle',
    maxSpeed: 45,
    accel: 28,
    turnRate: 2.15,
    length: 4.7,
    width: 2.1,
    height: 1.38,
    maxHp: 165,
    colors: [
      [1.0, 0.68, 0.12],
      [0.92, 0.18, 0.24],
      [0.22, 0.94, 0.58],
    ],
  },
  kestrel_rs: {
    id: 'kestrel_rs',
    name: 'Kestrel RS Turbo',
    maxSpeed: 43,
    accel: 27,
    turnRate: 2.45,
    length: 4.2,
    width: 1.95,
    height: 1.42,
    maxHp: 135,
    colors: [
      [0.58, 0.32, 1.0],
      [0.18, 0.78, 1.0],
      [0.95, 0.42, 0.18],
    ],
  },
  solmar_pd: {
    id: 'solmar_pd',
    name: 'Solmar PD Interceptor',
    maxSpeed: 47,
    accel: 29,
    turnRate: 2.3,
    length: 4.65,
    width: 2.08,
    height: 1.45,
    maxHp: 180,
    colors: [[0.12, 0.16, 0.26]],
  },
  saltworks_van: {
    id: 'saltworks_van',
    name: 'Saltworks Armored Van',
    maxSpeed: 35,
    accel: 19,
    turnRate: 1.75,
    length: 5.2,
    width: 2.25,
    height: 2.15,
    maxHp: 240,
    colors: [
      [0.24, 0.28, 0.34],
      [0.86, 0.58, 0.16],
    ],
  },
  marina_moto: {
    id: 'marina_moto',
    name: 'Pulse 900 Street Moto',
    maxSpeed: 50,
    accel: 34,
    turnRate: 2.85,
    length: 2.4,
    width: 0.95,
    height: 1.18,
    maxHp: 90,
    colors: [
      [0.12, 0.98, 0.78],
      [1.0, 0.28, 0.72],
    ],
  },
};

export const WEAPON_ARSENAL = [
  {
    id: 'pistol',
    slot: 1,
    name: 'Vesper 9mm',
    fireInterval: 0.24,
    damage: 28,
    speed: 92,
    pellets: 1,
    spread: 0.02,
    range: 75,
    color: [1.0, 0.88, 0.42],
    ammoPerClip: 15,
  },
  {
    id: 'smg',
    slot: 2,
    name: 'Solmar Viper SMG',
    fireInterval: 0.095,
    damage: 18,
    speed: 96,
    pellets: 1,
    spread: 0.055,
    range: 68,
    color: [0.25, 0.94, 1.0],
    ammoPerClip: 32,
  },
  {
    id: 'carbine',
    slot: 3,
    name: 'Caldera TAC-45 Carbine',
    fireInterval: 0.12,
    damage: 34,
    speed: 112,
    pellets: 1,
    spread: 0.025,
    range: 95,
    color: [1.0, 0.56, 0.18],
    ammoPerClip: 30,
  },
  {
    id: 'shotgun',
    slot: 4,
    name: 'Breacher 12G Shotgun',
    fireInterval: 0.58,
    damage: 22,
    speed: 82,
    pellets: 6,
    spread: 0.14,
    range: 42,
    color: [1.0, 0.36, 0.28],
    ammoPerClip: 8,
  },
  {
    id: 'grenade',
    slot: 5,
    name: 'Pulse Frag Launcher',
    fireInterval: 0.95,
    damage: 115,
    speed: 46,
    pellets: 1,
    spread: 0.01,
    range: 52,
    explosiveRadius: 9.5,
    color: [1.0, 0.22, 0.65],
    ammoPerClip: 6,
  },
];

export const OUTFIT_STYLES = [
  { name: 'Praia Neon Jacket', torso: [0.08, 0.82, 0.95], legs: [0.14, 0.16, 0.24] },
  { name: 'Glassline Executive Suit', torso: [0.88, 0.22, 0.56], legs: [0.12, 0.12, 0.18] },
  { name: 'Saltworks Tactical Rig', torso: [0.96, 0.68, 0.16], legs: [0.18, 0.22, 0.26] },
  { name: 'Cerro Shadow Hoodie', torso: [0.22, 0.92, 0.62], legs: [0.15, 0.18, 0.22] },
];

export function createPlayerProtagonist() {
  return {
    name: 'Mateo Reyes',
    x: 86,
    y: 0,
    z: 22,
    vx: 0,
    vz: 0,
    heading: 0,
    aimYaw: 0,
    health: 100,
    maxHealth: 100,
    armor: 85,
    maxArmor: 100,
    cash: 48500,
    syndicateRep: 340,
    outfitIndex: 0,
    weaponIndex: 2,
    ammo: {
      pistol: 120,
      smg: 240,
      carbine: 180,
      shotgun: 64,
      grenade: 14,
    },
    fireCooldown: 0,
    muzzleFlashTimer: 0,
    inVehicle: null,
    walkCycle: 0,
    stamina: 100,
  };
}

export function spawnCityTrafficAndPedestrians(world, seed = 202) {
  const rand = createSeededRandom(seed);
  const vehicles = [];
  const pedestrians = [];

  const civTypes = ['manta_gt', 'valkyrie_v8', 'kestrel_rs', 'saltworks_van', 'marina_moto'];

  // Spawn active traffic along N-S roads
  for (let i = 0; i < ROAD_X_COORDS.length; i++) {
    const rx = ROAD_X_COORDS[i];
    for (let k = 0; k < 5; k++) {
      const dir = k % 2 === 0 ? 1 : -1;
      const laneOffset = dir > 0 ? 4.2 : -4.2;
      const archKey = civTypes[(i + k) % civTypes.length];
      const arch = VEHICLE_ARCHETYPES[archKey];
      const palette = arch.colors[(i + k) % arch.colors.length];
      const zPos = -165 + k * 78 + (rand() - 0.5) * 16;

      vehicles.push({
        id: `veh_${vehicles.length}`,
        archetype: archKey,
        name: arch.name,
        x: rx + laneOffset,
        z: zPos,
        vx: 0,
        vz: 0,
        speed: 14 + rand() * 6,
        heading: dir > 0 ? 0 : Math.PI,
        steerAngle: 0,
        wheelSpin: 0,
        color: [...palette],
        accentColor: [1.0, 0.92, 0.78],
        hp: arch.maxHp,
        maxHp: arch.maxHp,
        isPolice: false,
        isParked: false,
        axis: 'ns',
        dir,
        roadCoord: rx,
        plateId: `SLM-${100 + vehicles.length}`,
        sirenPhase: rand() * 6.28,
        driftIntensity: 0,
      });
    }
  }

  // Spawn active traffic along E-W roads
  for (let j = 0; j < ROAD_Z_COORDS.length; j++) {
    const rz = ROAD_Z_COORDS[j];
    for (let k = 0; k < 3; k++) {
      const dir = k % 2 === 0 ? 1 : -1;
      const laneOffset = dir > 0 ? -4.2 : 4.2;
      const archKey = civTypes[(j + k + 2) % civTypes.length];
      const arch = VEHICLE_ARCHETYPES[archKey];
      const palette = arch.colors[(j + k) % arch.colors.length];
      const xPos = -140 + k * 85 + (rand() - 0.5) * 14;

      vehicles.push({
        id: `veh_${vehicles.length}`,
        archetype: archKey,
        name: arch.name,
        x: xPos,
        z: rz + laneOffset,
        vx: 0,
        vz: 0,
        speed: 13 + rand() * 6,
        heading: dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5,
        steerAngle: 0,
        wheelSpin: 0,
        color: [...palette],
        accentColor: [0.2, 0.95, 1.0],
        hp: arch.maxHp,
        maxHp: arch.maxHp,
        isPolice: false,
        isParked: false,
        axis: 'ew',
        dir,
        roadCoord: rz,
        plateId: `SLM-${200 + vehicles.length}`,
        sirenPhase: 0,
        driftIntensity: 0,
      });
    }
  }

  // Spawn signature parked hijackable sports cars at key hotspots
  const parkedSpots = [
    { x: 82, z: 18, heading: 0, type: 'manta_gt', color: [0.04, 0.9, 1.0] },
    { x: 64, z: -18, heading: Math.PI * 0.5, type: 'valkyrie_v8', color: [1.0, 0.72, 0.14] },
    { x: -12, z: -18, heading: 0, type: 'manta_gt', color: [1.0, 0.22, 0.64] },
    { x: -82, z: 76, heading: 0, type: 'saltworks_van', color: [0.24, 0.28, 0.36] },
    { x: 12, z: 62, heading: -Math.PI * 0.5, type: 'marina_moto', color: [0.15, 0.98, 0.78] },
  ];
  for (const spot of parkedSpots) {
    const arch = VEHICLE_ARCHETYPES[spot.type];
    vehicles.push({
      id: `veh_parked_${vehicles.length}`,
      archetype: spot.type,
      name: arch.name,
      x: spot.x,
      z: spot.z,
      vx: 0,
      vz: 0,
      speed: 0,
      heading: spot.heading,
      steerAngle: 0,
      wheelSpin: 0,
      color: [...spot.color],
      accentColor: [1.0, 0.3, 0.7],
      hp: arch.maxHp,
      maxHp: arch.maxHp,
      isPolice: false,
      isParked: true,
      axis: 'ns',
      dir: 1,
      roadCoord: spot.x,
      plateId: `VIP-${vehicles.length}`,
      sirenPhase: 0,
      driftIntensity: 0,
    });
  }

  // Spawn pedestrians along boardwalk and city sidewalks
  const pedShirtColors = [
    [1.0, 0.36, 0.62],
    [0.18, 0.88, 0.96],
    [0.98, 0.78, 0.24],
    [0.42, 0.94, 0.62],
    [0.76, 0.48, 1.0],
  ];

  for (let i = 0; i < 42; i++) {
    const onBoardwalk = i < 16;
    const roadX = onBoardwalk ? 90 : ROAD_X_COORDS[i % ROAD_X_COORDS.length];
    const sideOffset = onBoardwalk ? (i % 2 === 0 ? 13.0 : -12.2) : i % 2 === 0 ? 11.8 : -11.8;
    const zPos = -180 + ((i * 29) % 360);

    pedestrians.push({
      id: `ped_${i}`,
      x: roadX + sideOffset,
      z: zPos,
      vx: 0,
      vz: 0,
      heading: i % 2 === 0 ? 0 : Math.PI,
      walkSpeed: 2.2 + (i % 3) * 0.45,
      walkCycle: rand() * 6.28,
      shirtColor: pedShirtColors[i % pedShirtColors.length],
      pantsColor: [0.16, 0.2, 0.28],
      hp: 45,
      maxHp: 45,
      isHostile: false,
      isPoliceOfficer: false,
      fleeTimer: 0,
      fireCooldown: 0.8 + rand() * 0.8,
      muzzleFlashTimer: 0,
    });
  }

  return { vehicles, pedestrians };
}

export function findNearestHijackableVehicle(player, vehicles, maxDist = 6.2) {
  if (player.inVehicle) return null;
  let nearest = null;
  let bestDistSq = maxDist * maxDist;
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.hp <= 0) continue;
    const dx = v.x - player.x;
    const dz = v.z - player.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      nearest = v;
    }
  }
  return nearest;
}

export function attemptHijackOrExitVehicle(player, vehicles, policeSystem, audio) {
  if (player.inVehicle) {
    const v = player.inVehicle;
    const exitX = v.x - Math.cos(v.heading) * 2.4;
    const exitZ = v.z + Math.sin(v.heading) * 2.4;
    player.x = exitX;
    player.z = exitZ;
    player.heading = v.heading;
    v.isParked = true;
    v.speed *= 0.25;
    player.inVehicle = null;
    if (audio) audio.playDoorLatchSfx();
    return { action: 'exited', vehicle: v };
  }

  const target = findNearestHijackableVehicle(player, vehicles, 6.5);
  if (!target) return null;

  const wasMovingTraffic = !target.isParked;
  target.isParked = false;
  player.inVehicle = target;
  player.x = target.x;
  player.z = target.z;
  player.heading = target.heading;

  if (policeSystem && (wasMovingTraffic || target.isPolice)) {
    policeSystem.reportCrime('grand_theft_auto', target.isPolice ? 2 : 1, target);
  }
  if (audio) audio.playDoorLatchSfx();
  return { action: 'hijacked', vehicle: target };
}

export function updateTrafficVehiclesAI(vehicles, world, player, skidMarks, dt) {
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.hp <= 0) continue;

    if (player.inVehicle === v) {
      player.x = v.x;
      player.z = v.z;
      player.heading = v.heading;
      continue;
    }

    if (v.isPolice) continue;

    if (v.isParked) {
      v.speed *= Math.max(0, 1 - dt * 5);
      v.x += Math.sin(v.heading) * v.speed * dt;
      v.z += Math.cos(v.heading) * v.speed * dt;
      continue;
    }

    const arch = VEHICLE_ARCHETYPES[v.archetype] || VEHICLE_ARCHETYPES.manta_gt;
    let desiredSpeed = arch.maxSpeed * 0.42;

    // Check traffic signal ahead
    const { intersection, dist } = getNearestIntersectionSignal(world, v.x, v.z);
    if (intersection && dist > 9 && dist < 24) {
      const toInterX = intersection.x - v.x;
      const toInterZ = intersection.z - v.z;
      const forwardDot = toInterX * Math.sin(v.heading) + toInterZ * Math.cos(v.heading);
      if (forwardDot > 6) {
        const redForMe = v.axis === 'ns' ? !intersection.nsGreen : intersection.nsGreen;
        if (redForMe || intersection.yellow) {
          desiredSpeed = 0;
        }
      }
    }

    // Check vehicle ahead spacing
    for (let j = 0; j < vehicles.length; j++) {
      if (i === j) continue;
      const other = vehicles[j];
      const dx = other.x - v.x;
      const dz = other.z - v.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 144) {
        const d = Math.sqrt(d2) || 0.001;
        const dot = (dx * Math.sin(v.heading) + dz * Math.cos(v.heading)) / d;
        if (dot > 0.78 && d < 11.5) {
          desiredSpeed = 0;
          break;
        }
      }
    }

    if (v.speed < desiredSpeed) {
      v.speed = Math.min(desiredSpeed, v.speed + arch.accel * 0.55 * dt);
    } else {
      v.speed = Math.max(desiredSpeed, v.speed - arch.accel * 0.9 * dt);
    }

    const fx = Math.sin(v.heading);
    const fz = Math.cos(v.heading);
    v.x += fx * v.speed * dt;
    v.z += fz * v.speed * dt;
    v.wheelSpin = (v.wheelSpin + v.speed * dt * 1.6) % 6.28;

    // Keep lane alignment & wrap at city borders
    if (v.axis === 'ns') {
      const targetX = v.roadCoord + (v.dir > 0 ? 4.2 : -4.2);
      v.x += (targetX - v.x) * Math.min(1, dt * 4);
      v.heading = v.dir > 0 ? 0 : Math.PI;
      if (v.z > 218) v.z = -218;
      if (v.z < -218) v.z = 218;
    } else {
      const targetZ = v.roadCoord + (v.dir > 0 ? -4.2 : 4.2);
      v.z += (targetZ - v.z) * Math.min(1, dt * 4);
      v.heading = v.dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      if (v.x > 106) {
        v.dir = -1;
        v.heading = -Math.PI * 0.5;
      } else if (v.x < -218) {
        v.dir = 1;
        v.heading = Math.PI * 0.5;
      }
    }
  }
}

export function updatePedestrianCrowdsAI(pedestrians, world, player, projectiles, particles, audio, dt) {
  for (let i = pedestrians.length - 1; i >= 0; i--) {
    const p = pedestrians[i];
    if (p.hp <= 0) continue;

    if (p.muzzleFlashTimer > 0) p.muzzleFlashTimer = Math.max(0, p.muzzleFlashTimer - dt);

    const dx = player.x - p.x;
    const dz = player.z - p.z;
    const distSq = dx * dx + dz * dz;
    const dist = Math.sqrt(distSq) || 0.001;

    // High-speed car impact check if player is driving fast
    if (player.inVehicle && Math.abs(player.inVehicle.speed) > 10 && dist < 2.35) {
      p.hp = 0;
      player.cash += 120;
      for (let k = 0; k < 8; k++) {
        particles.push({
          x: p.x,
          y: 1.0,
          z: p.z,
          vx: (Math.random() - 0.5) * 8,
          vy: 2 + Math.random() * 4,
          vz: (Math.random() - 0.5) * 8,
          color: [1.0, 0.35, 0.25],
          size: 0.24,
          life: 0.45,
          maxLife: 0.45,
        });
      }
      continue;
    }

    if (p.isHostile || p.isPoliceOfficer) {
      p.heading = Math.atan2(dx, dz);
      if (dist > 14 && dist < 55) {
        p.x += (dx / dist) * p.walkSpeed * 1.25 * dt;
        p.z += (dz / dist) * p.walkSpeed * 1.25 * dt;
        p.walkCycle += dt * 7.5;
      }
      p.fireCooldown -= dt;
      if (dist < 42 && p.fireCooldown <= 0) {
        p.fireCooldown = p.isPoliceOfficer ? 0.65 : 0.55;
        p.muzzleFlashTimer = 0.09;
        const aimAngle = p.heading + (Math.random() - 0.5) * 0.08;
        const dirX = Math.sin(aimAngle);
        const dirZ = Math.cos(aimAngle);
        projectiles.push({
          x: p.x + dirX * 0.8,
          y: 1.35,
          z: p.z + dirZ * 0.8,
           prevX: p.x,
          prevY: 1.35,
          prevZ: p.z,
          vx: dirX * 68,
          vy: 0,
          vz: dirZ * 68,
          damage: p.isPoliceOfficer ? 7 : 6,
          fromPlayer: false,
          color: p.isPoliceOfficer ? [0.35, 0.85, 1.0] : [1.0, 0.42, 0.22],
          life: 0.7,
        });
      }
      continue;
    }

    // Civilian behavior
    if (p.fleeTimer > 0) {
      p.fleeTimer = Math.max(0, p.fleeTimer - dt);
      p.heading = Math.atan2(-dx, -dz);
      const speed = p.walkSpeed * 2.1;
      p.x += Math.sin(p.heading) * speed * dt;
      p.z += Math.cos(p.heading) * speed * dt;
      p.walkCycle += dt * 11;
    } else {
      p.x += Math.sin(p.heading) * p.walkSpeed * dt;
      p.z += Math.cos(p.heading) * p.walkSpeed * dt;
      p.walkCycle += dt * 5.2;
      if (p.z > 210) p.heading = Math.PI;
      if (p.z < -210) p.heading = 0;
    }

    const col = resolveWorldCollisionAABB(world, p.x, p.z, 0.55);
    if (col.collided) {
      p.x = col.x;
      p.z = col.z;
      p.heading += Math.PI * 0.5;
    }
  }
}

export function fireEquippedWeapon(player, aimYaw, projectiles, particles, pedestrians, policeSystem, audio) {
  const weapon = WEAPON_ARSENAL[player.weaponIndex] || WEAPON_ARSENAL[0];
  if (player.fireCooldown > 0) return false;
  if ((player.ammo[weapon.id] ?? 0) <= 0) return false;

  player.ammo[weapon.id]--;
  player.fireCooldown = weapon.fireInterval;
  player.muzzleFlashTimer = 0.09;
  player.heading = aimYaw;

  const originX = player.x + Math.sin(aimYaw) * 0.95;
  const originZ = player.z + Math.cos(aimYaw) * 0.95;
  const originY = player.inVehicle ? 1.45 : 1.38;

  for (let i = 0; i < weapon.pellets; i++) {
    const spreadYaw = aimYaw + (Math.random() - 0.5) * weapon.spread;
    const dx = Math.sin(spreadYaw);
    const dz = Math.cos(spreadYaw);
    projectiles.push({
      x: originX,
      y: originY,
      z: originZ,
      prevX: originX - dx * 1.4,
      prevY: originY,
      prevZ: originZ - dz * 1.4,
      vx: dx * weapon.speed,
      vy: weapon.explosiveRadius ? 3.5 : 0,
      vz: dz * weapon.speed,
      damage: weapon.damage,
      explosiveRadius: weapon.explosiveRadius || 0,
      fromPlayer: true,
      color: weapon.color,
      life: weapon.range / weapon.speed,
    });
  }

  // Alert nearby civilians to flee
  for (let i = 0; i < pedestrians.length; i++) {
    const p = pedestrians[i];
    if (!p.isHostile && !p.isPoliceOfficer) {
      const d2 = (p.x - player.x) ** 2 + (p.z - player.z) ** 2;
      if (d2 < 1600) p.fleeTimer = 5.0;
    }
  }

  if (policeSystem) {
    policeSystem.reportCrime('weapons_discharge', 1, player.inVehicle);
  }
  if (audio) {
    audio.playWeaponFireSfx(weapon.id);
  }
  return true;
}

export function triggerExplosionAt(x, z, radius, damage, player, vehicles, pedestrians, particles, audio) {
  if (audio) audio.playExplosionSfx();

  for (let i = 0; i < 26; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 3 + Math.random() * 14;
    particles.push({
      x,
      y: 0.8 + Math.random() * 1.5,
      z,
      vx: Math.cos(angle) * spd,
      vy: 3 + Math.random() * 9,
      vz: Math.sin(angle) * spd,
      color: i % 2 === 0 ? [1.0, 0.55, 0.12] : [1.0, 0.24, 0.18],
      size: 0.55 + Math.random() * 0.45,
      life: 0.65 + Math.random() * 0.35,
      maxLife: 1.0,
    });
  }

  for (let i = 0; i < pedestrians.length; i++) {
    const p = pedestrians[i];
    if (p.hp <= 0) continue;
    const d = Math.hypot(p.x - x, p.z - z);
    if (d <= radius) {
      p.hp -= damage * (1 - d / (radius + 1));
      if (p.hp <= 0) {
        player.cash += p.isHostile ? 450 : 100;
        if (p.isHostile) player.syndicateRep += 15;
      }
    }
  }

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.hp <= 0) continue;
    const d = Math.hypot(v.x - x, v.z - z);
    if (d <= radius) {
      v.hp -= damage * (1 - d / (radius + 2));
    }
  }
}

export function updateProjectilesAndExplosions(
  projectiles,
  particles,
  player,
  vehicles,
  pedestrians,
  policeSystem,
  world,
  audio,
  dt
) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.prevX = proj.x;
    proj.prevY = proj.y;
    proj.prevZ = proj.z;

    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.z += proj.vz * dt;
    if (proj.explosiveRadius > 0) {
      proj.vy -= 9.8 * dt;
    }
    proj.life -= dt;

    let hit = false;

    if (proj.fromPlayer) {
      for (let j = 0; j < pedestrians.length; j++) {
        const p = pedestrians[j];
        if (p.hp <= 0) continue;
        const d2 = (p.x - proj.x) ** 2 + (p.z - proj.z) ** 2;
        if (d2 < 1.35) {
          p.hp -= proj.damage;
          hit = true;
          if (p.hp <= 0) {
            player.cash += p.isHostile ? 400 : 90;
            if (p.isHostile) player.syndicateRep += 20;
            if (p.isPoliceOfficer && policeSystem) {
              policeSystem.reportCrime('officer_down', 2, player.inVehicle);
            }
          }
          break;
        }
      }

      if (!hit) {
        for (let j = 0; j < vehicles.length; j++) {
          const v = vehicles[j];
          if (v === player.inVehicle || v.hp <= 0) continue;
          const d2 = (v.x - proj.x) ** 2 + (v.z - proj.z) ** 2;
          if (d2 < 4.2) {
            v.hp -= proj.damage;
            hit = true;
            if (v.hp <= 0) {
              triggerExplosionAt(v.x, v.z, 8.5, 95, player, vehicles, pedestrians, particles, audio);
            }
            break;
          }
        }
      }
    } else {
      const d2 = (player.x - proj.x) ** 2 + (player.z - proj.z) ** 2;
      if (d2 < 1.8) {
        hit = true;
        if (player.inVehicle) {
          player.inVehicle.hp = Math.max(25, player.inVehicle.hp - proj.damage * 0.45);
        } else if (player.armor > 0) {
          const absorb = Math.min(player.armor, proj.damage * 0.75);
          player.armor = Math.max(0, player.armor - absorb);
          player.health = Math.max(18, player.health - (proj.damage - absorb));
        } else {
          player.health = Math.max(18, player.health - proj.damage);
        }
      }
    }

    if (!hit) {
      const col = resolveWorldCollisionAABB(world, proj.x, proj.z, 0.25);
      if (col.collided || proj.y <= 0.1) {
        hit = true;
      }
    }

    if (hit || proj.life <= 0) {
      if (proj.explosiveRadius > 0) {
        triggerExplosionAt(
          proj.x,
          proj.z,
          proj.explosiveRadius,
          proj.damage,
          player,
          vehicles,
          pedestrians,
          particles,
          audio
        );
      } else if (hit) {
        for (let k = 0; k < 4; k++) {
          particles.push({
            x: proj.x,
            y: Math.max(0.4, proj.y),
            z: proj.z,
            vx: (Math.random() - 0.5) * 6,
            vy: 1.5 + Math.random() * 3.5,
            vz: (Math.random() - 0.5) * 6,
            color: proj.color,
            size: 0.18,
            life: 0.25,
            maxLife: 0.25,
          });
        }
      }
      projectiles.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.z += pt.vz * dt;
    pt.vy -= 6.5 * dt;
    pt.life -= dt;
    if (pt.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

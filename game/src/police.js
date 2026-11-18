// Solmar Coast: Neon Syndicate — 5-Star Wanted System, Line-of-Sight Evasion, Cruisers, Chopper & Heat Telemetry

import { VEHICLE_ARCHETYPES } from './entities.js';
import { resolveWorldCollisionAABB } from './world.js';

export class PolicePursuitDirector {
  constructor() {
    this.wantedStars = 0;
    this.crimeScore = 0;
    this.inSight = false;
    this.evasionTimer = 0;
    this.evasionDuration = 18;
    this.lastCrimeLabel = 'NONE';
    this.faceHeat = 12;
    this.outfitHeat = 18;
    this.carHeat = 10;
    this.cctvAlert = false;
    this.cctvTimer = 0;
    this.spawnTimer = 0;

    this.chopper = {
      active: false,
      x: 70,
      y: 34,
      z: 0,
      heading: 0,
      rotorAngle: 0,
      spotX: 80,
      spotZ: 15,
      orbitAngle: 0,
    };
  }

  reportCrime(crimeCode, starWeight = 1, activeVehicle = null) {
    this.crimeScore += starWeight * 35;
    this.lastCrimeLabel = crimeCode.replace(/_/g, ' ').toUpperCase();
    this.inSight = true;

    if (this.wantedStars === 0) {
      this.wantedStars = Math.min(5, Math.max(1, starWeight));
    } else if (this.crimeScore > this.wantedStars * 65) {
      this.wantedStars = Math.min(5, this.wantedStars + 1);
    }

    this.evasionDuration = 14 + this.wantedStars * 5;
    this.evasionTimer = this.evasionDuration;

    this.faceHeat = Math.min(100, this.faceHeat + 14 * starWeight);
    this.outfitHeat = Math.min(100, this.outfitHeat + 18 * starWeight);
    if (activeVehicle) {
      this.carHeat = Math.min(100, this.carHeat + 26 * starWeight);
    }
  }
}

export function escalateWantedStars(police, stars, label = 'SYNDICATE ALERT') {
  police.wantedStars = Math.max(0, Math.min(5, stars));
  police.crimeScore = police.wantedStars * 65;
  police.lastCrimeLabel = label;
  if (police.wantedStars > 0) {
    police.inSight = true;
    police.evasionDuration = 14 + police.wantedStars * 5;
    police.evasionTimer = police.evasionDuration;
    police.faceHeat = Math.max(police.faceHeat, 35 + police.wantedStars * 12);
    police.outfitHeat = Math.max(police.outfitHeat, 45 + police.wantedStars * 11);
    police.carHeat = Math.max(police.carHeat, 50 + police.wantedStars * 10);
  } else {
    police.inSight = false;
    police.evasionTimer = 0;
    police.chopper.active = false;
  }
}

export function resprayVehicleClearCarHeat(police, player) {
  police.carHeat = 5;
  if (player.inVehicle) {
    const palette = [
      [0.05, 0.92, 0.98],
      [1.0, 0.25, 0.68],
      [0.24, 0.96, 0.58],
      [1.0, 0.76, 0.14],
    ];
    player.inVehicle.color = palette[Math.floor(Math.random() * palette.length)];
    player.inVehicle.hp = player.inVehicle.maxHp;
  }
  if (!police.inSight && police.wantedStars > 0) {
    police.wantedStars = Math.max(0, police.wantedStars - 2);
    police.evasionTimer = Math.min(police.evasionTimer, 4.0);
  }
}

export function swapWardrobeClearOutfitHeat(police, player, outfitCount = 4) {
  player.outfitIndex = (player.outfitIndex + 1) % outfitCount;
  police.outfitHeat = 8;
  police.faceHeat = Math.max(10, police.faceHeat - 30);
  if (police.wantedStars > 0) {
    police.wantedStars = Math.max(0, police.wantedStars - 1);
  }
}

export function updatePoliceLineOfSightAndHeat(police, player, vehicles, world, dt) {
  // Check CCTV proximity
  let nearCctv = false;
  for (let i = 0; i < world.cctvCameras.length; i++) {
    const cam = world.cctvCameras[i];
    const d2 = (cam.x - player.x) ** 2 + (cam.z - player.z) ** 2;
    if (d2 < 780) {
      nearCctv = true;
      break;
    }
  }
  police.cctvAlert = nearCctv && police.wantedStars > 0;

  if (police.wantedStars <= 0) {
    police.inSight = false;
    police.chopper.active = false;
    police.faceHeat = Math.max(5, police.faceHeat - dt * 1.2);
    police.outfitHeat = Math.max(8, police.outfitHeat - dt * 0.9);
    police.carHeat = Math.max(5, police.carHeat - dt * 1.1);
    return;
  }

  let seenByUnit = false;
  const detectionRadius = 46 + (police.carHeat + police.outfitHeat) * 0.18;

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!v.isPolice || v.hp <= 0) continue;
    const dist = Math.hypot(v.x - player.x, v.z - player.z);
    if (dist < detectionRadius) {
      seenByUnit = true;
      break;
    }
  }

  if (police.chopper.active) {
    const spotDist = Math.hypot(police.chopper.spotX - player.x, police.chopper.spotZ - player.z);
    if (spotDist < 28) {
      seenByUnit = true;
    }
  }

  police.inSight = seenByUnit || police.cctvAlert;

  if (police.inSight) {
    police.evasionTimer = police.evasionDuration;
  } else {
    const heatFactor = 1.35 - (police.carHeat + police.outfitHeat) * 0.003;
    police.evasionTimer = Math.max(0, police.evasionTimer - dt * Math.max(0.65, heatFactor));
    if (police.evasionTimer <= 0) {
      police.wantedStars = 0;
      police.crimeScore = 0;
      police.chopper.active = false;
    }
  }
}

export function updatePoliceCruisersAndChopper(police, player, vehicles, pedestrians, world, particles, dt) {
  const desiredCruisers = police.wantedStars === 0 ? 0 : Math.min(4, police.wantedStars);
  let activeCruisers = 0;
  for (let i = 0; i < vehicles.length; i++) {
    if (vehicles[i].isPolice && vehicles[i].hp > 0) activeCruisers++;
  }

  police.spawnTimer -= dt;
  if (activeCruisers < desiredCruisers && police.spawnTimer <= 0) {
    police.spawnTimer = 3.2;
    const arch = VEHICLE_ARCHETYPES.solmar_pd;
    const angle = player.heading + (activeCruisers % 2 === 0 ? 0.55 : -0.55);
    const spawnDist = 42 + activeCruisers * 10;
    const sx = Math.max(-210, Math.min(104, player.x - Math.sin(angle) * spawnDist));
    const sz = Math.max(-210, Math.min(210, player.z - Math.cos(angle) * spawnDist));

    vehicles.push({
      id: `police_${Date.now()}_${activeCruisers}`,
      archetype: 'solmar_pd',
      name: arch.name,
      x: sx,
      z: sz,
      vx: 0,
      vz: 0,
      speed: 24,
      heading: Math.atan2(player.x - sx, player.z - sz),
      steerAngle: 0,
      wheelSpin: 0,
      color: [0.11, 0.15, 0.25],
      accentColor: [0.95, 0.97, 1.0],
      hp: arch.maxHp,
      maxHp: arch.maxHp,
      isPolice: true,
      isParked: false,
      axis: 'ns',
      dir: 1,
      roadCoord: 0,
      plateId: `SPD-${900 + activeCruisers}`,
      sirenPhase: activeCruisers * 1.7,
      driftIntensity: 0,
    });
  }

  // Update active police cruisers
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!v.isPolice || v.hp <= 0 || player.inVehicle === v) continue;

    v.sirenPhase = (v.sirenPhase + dt * 9.5) % 6.283;

    if (police.wantedStars <= 0) {
      v.speed = Math.max(12, v.speed - 10 * dt);
      v.x += Math.sin(v.heading) * v.speed * dt;
      v.z += Math.cos(v.heading) * v.speed * dt;
      continue;
    }

    const leadX = player.x + Math.sin(player.heading) * 4.5;
    const leadZ = player.z + Math.cos(player.heading) * 4.5;
    const dx = leadX - v.x;
    const dz = leadZ - v.z;
    const dist = Math.hypot(dx, dz) || 0.001;

    const targetHeading = Math.atan2(dx, dz);
    let diff = targetHeading - v.heading;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    v.steerAngle = Math.max(-0.55, Math.min(0.55, diff * 1.8));
    v.heading += Math.max(-2.4 * dt, Math.min(2.4 * dt, diff * 2.2 * dt));

    const targetSpeed = dist > 8 ? 36 + police.wantedStars * 2.2 : 18;
    if (v.speed < targetSpeed) {
      v.speed = Math.min(targetSpeed, v.speed + 26 * dt);
    } else {
      v.speed = Math.max(targetSpeed, v.speed - 22 * dt);
    }

    v.x += Math.sin(v.heading) * v.speed * dt;
    v.z += Math.cos(v.heading) * v.speed * dt;
    v.wheelSpin = (v.wheelSpin + v.speed * dt * 1.8) % 6.28;

    const col = resolveWorldCollisionAABB(world, v.x, v.z, 1.5);
    if (col.collided) {
      v.x = col.x;
      v.z = col.z;
      v.speed *= 0.65;
    }

    // Check tactical PIT/ram against player vehicle
    const pDist = Math.hypot(player.x - v.x, player.z - v.z);
    if (player.inVehicle && pDist < 3.6) {
      const pushX = (player.x - v.x) / (pDist || 1);
      const pushZ = (player.z - v.z) / (pDist || 1);
      player.inVehicle.x += pushX * 0.45;
      player.inVehicle.z += pushZ * 0.45;
      player.inVehicle.hp = Math.max(30, player.inVehicle.hp - 6 * dt);
      for (let k = 0; k < 2; k++) {
        particles.push({
          x: (player.x + v.x) * 0.5,
          y: 0.75,
          z: (player.z + v.z) * 0.5,
          vx: (Math.random() - 0.5) * 9,
          vy: 2 + Math.random() * 4,
          vz: (Math.random() - 0.5) * 9,
          color: [1.0, 0.78, 0.25],
          size: 0.22,
          life: 0.28,
          maxLife: 0.28,
        });
      }
    }
  }

  // Update overhead police chopper (active at 3+ stars)
  if (police.wantedStars >= 3) {
    police.chopper.active = true;
    police.chopper.orbitAngle = (police.chopper.orbitAngle + dt * 0.55) % (Math.PI * 2);
    police.chopper.rotorAngle = (police.chopper.rotorAngle + dt * 28.0) % (Math.PI * 2);

    const desiredX = player.x + Math.cos(police.chopper.orbitAngle) * 16;
    const desiredZ = player.z + Math.sin(police.chopper.orbitAngle) * 16 - 8;
    police.chopper.x += (desiredX - police.chopper.x) * Math.min(1, dt * 2.5);
    police.chopper.z += (desiredZ - police.chopper.z) * Math.min(1, dt * 2.5);
    police.chopper.y = 31 + Math.sin(police.chopper.orbitAngle * 2) * 1.5;
    police.chopper.heading = Math.atan2(player.x - police.chopper.x, player.z - police.chopper.z);

    police.chopper.spotX += (player.x - police.chopper.spotX) * Math.min(1, dt * 3.8);
    police.chopper.spotZ += (player.z - police.chopper.spotZ) * Math.min(1, dt * 3.8);
  } else {
    police.chopper.active = false;
  }
}

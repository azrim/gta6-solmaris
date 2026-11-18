// Solmar Coast: Neon Syndicate — Deterministic Screenshot & Demo Scene Staging (?shot=start|play|pursuit|mission)

import { VEHICLE_ARCHETYPES } from './entities.js';
import { selectMissionFromMenu } from './missions.js';
import { escalateWantedStars } from './police.js';

export function applyDeterministicScreenshotStage(
  shotName,
  renderer,
  world,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector,
  projectiles,
  particles,
  uiState
) {
  if (!shotName) return null;
  const mode = shotName.toLowerCase();

  if (mode === 'start') {
    return stageHeroStartPursuitScene(
      renderer,
      player,
      vehicles,
      pedestrians,
      police,
      missionDirector,
      projectiles,
      particles,
      uiState
    );
  }
  if (mode === 'play') {
    return stageCoastalTitleAndPlayScene(
      renderer,
      player,
      vehicles,
      pedestrians,
      police,
      missionDirector,
      projectiles,
      particles,
      uiState
    );
  }
  if (mode === 'pursuit') {
    return stageNightChopperPursuitScene(
      renderer,
      player,
      vehicles,
      pedestrians,
      police,
      missionDirector,
      projectiles,
      particles,
      uiState
    );
  }
  if (mode === 'mission') {
    return stageDowntownCombatMissionScene(
      renderer,
      player,
      vehicles,
      pedestrians,
      police,
      missionDirector,
      projectiles,
      particles,
      uiState
    );
  }
  return null;
}

export function stageHeroStartPursuitScene(
  renderer,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector,
  projectiles,
  particles,
  uiState
) {
  renderer.lightingPreset = 'golden';
  uiState.showStartOverlay = true;
  uiState.showMissionMenu = false;

  selectMissionFromMenu(missionDirector, 0, player, vehicles, pedestrians, police);
  escalateWantedStars(police, 3, 'HIGH SPEED PURSUIT');
  police.inSight = true;
  police.faceHeat = 54;
  police.outfitHeat = 68;
  police.carHeat = 86;
  police.cctvAlert = true;

  // Player in hero Manta GT Coupe on Praia Solmar Ocean Drive (x=90) looking NNW with ocean on right & skyline ahead
  const heroCar = vehicles[0];
  heroCar.archetype = 'manta_gt';
  heroCar.name = VEHICLE_ARCHETYPES.manta_gt.name;
  heroCar.color = [0.04, 0.92, 1.0];
  heroCar.accentColor = [1.0, 0.25, 0.72];
  heroCar.x = 89.5;
  heroCar.z = 22.0;
  heroCar.heading = 3.02;
  heroCar.speed = 39.5; // 142 KM/H
  heroCar.isPolice = false;
  heroCar.isParked = false;

  player.inVehicle = heroCar;
  player.x = heroCar.x;
  player.z = heroCar.z;
  player.heading = heroCar.heading;
  player.cash = 48500;
  player.syndicateRep = 340;

  // Place police interceptor right on our tail/flank with flashing lightbar
  const cop1 = vehicles[1];
  cop1.archetype = 'solmar_pd';
  cop1.name = 'Solmar PD Interceptor';
  cop1.isPolice = true;
  cop1.color = [0.11, 0.15, 0.26];
  cop1.x = 94.4;
  cop1.z = 14.5;
  cop1.heading = 2.92;
  cop1.speed = 38.0;
  cop1.sirenPhase = 0.8;
  cop1.plateId = 'SPD-904';

  // Ahead sports & muscle traffic on Ocean Drive
  const traf1 = vehicles[2];
  traf1.archetype = 'valkyrie_v8';
  traf1.name = 'Valkyrie V8 Muscle';
  traf1.isPolice = false;
  traf1.color = [1.0, 0.68, 0.14];
  traf1.x = 85.4;
  traf1.z = 4.0;
  traf1.heading = Math.PI;
  traf1.speed = 24;

  const traf2 = vehicles[3];
  traf2.archetype = 'kestrel_rs';
  traf2.name = 'Kestrel RS Turbo';
  traf2.isPolice = false;
  traf2.color = [1.0, 0.24, 0.65];
  traf2.x = 93.6;
  traf2.z = -8.0;
  traf2.heading = 0;
  traf2.speed = 22;

  // Overhead Falcon Police Chopper + Spotlight Cone
  police.chopper.active = true;
  police.chopper.x = 96.0;
  police.chopper.y = 20.5;
  police.chopper.z = -12.0;
  police.chopper.rotorAngle = 0.75;
  police.chopper.spotX = 91.0;
  police.chopper.spotZ = 7.5;

  return {
    eye: [92.2, 5.4, 33.2],
    target: [87.5, 2.2, 2.0],
  };
}

export function stageCoastalTitleAndPlayScene(
  renderer,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector,
  projectiles,
  particles,
  uiState
) {
  renderer.lightingPreset = 'golden';
  uiState.showStartOverlay = false;
  uiState.showMissionMenu = false;

  selectMissionFromMenu(missionDirector, 1, player, vehicles, pedestrians, police);
  escalateWantedStars(police, 1, 'RECKLESS SPEEDING');
  police.inSight = false;
  police.evasionTimer = 9.4;
  police.faceHeat = 22;
  police.outfitHeat = 30;
  police.carHeat = 48;
  police.cctvAlert = false;

  const muscleCar = vehicles[0];
  muscleCar.archetype = 'valkyrie_v8';
  muscleCar.name = 'Valkyrie V8 Muscle';
  muscleCar.color = [1.0, 0.72, 0.12];
  muscleCar.accentColor = [1.0, 0.25, 0.55];
  muscleCar.x = 3.6;
  muscleCar.z = 19.5;
  muscleCar.heading = 3.06;
  muscleCar.speed = 46.7; // 168 KM/H
  muscleCar.isPolice = false;

  player.inVehicle = muscleCar;
  player.x = muscleCar.x;
  player.z = muscleCar.z;
  player.heading = muscleCar.heading;
  player.cash = 62400;
  player.syndicateRep = 415;

  // Dense crossroads traffic at (0, 0)
  const v1 = vehicles[1];
  v1.archetype = 'manta_gt';
  v1.name = 'Manta GT Coupe';
  v1.isPolice = false;
  v1.color = [0.05, 0.9, 0.98];
  v1.x = -4.2;
  v1.z = 5.5;
  v1.heading = Math.PI;
  v1.speed = 26;

  const v2 = vehicles[2];
  v2.archetype = 'marina_moto';
  v2.name = 'Pulse 900 Street Moto';
  v2.isPolice = false;
  v2.color = [0.18, 0.98, 0.76];
  v2.x = 7.2;
  v2.z = 3.2;
  v2.heading = -Math.PI * 0.5;
  v2.speed = 28;

  const v3 = vehicles[3];
  v3.archetype = 'saltworks_van';
  v3.name = 'Saltworks Armored Van';
  v3.isPolice = false;
  v3.color = [0.26, 0.32, 0.4];
  v3.x = -12.5;
  v3.z = -4.2;
  v3.heading = Math.PI * 0.5;
  v3.speed = 18;

  police.chopper.active = false;

  return {
    eye: [5.2, 5.2, 30.8],
    target: [0.5, 2.0, -6.0],
  };
}

export function stageNightChopperPursuitScene(
  renderer,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector,
  projectiles,
  particles,
  uiState
) {
  renderer.lightingPreset = 'dusk';
  uiState.showStartOverlay = false;
  uiState.showMissionMenu = false;

  selectMissionFromMenu(missionDirector, 2, player, vehicles, pedestrians, police);
  escalateWantedStars(police, 4, 'SYNDICATE PURSUIT');
  police.inSight = true;
  police.faceHeat = 74;
  police.outfitHeat = 82;
  police.carHeat = 94;
  police.cctvAlert = true;

  const tuner = vehicles[0];
  tuner.archetype = 'kestrel_rs';
  tuner.name = 'Kestrel RS Turbo';
  tuner.color = [0.64, 0.32, 1.0];
  tuner.accentColor = [0.0, 0.94, 1.0];
  tuner.x = 1.8;
  tuner.z = 58.0;
  tuner.heading = 2.98;
  tuner.speed = 48.9; // 176 KM/H
  tuner.isPolice = false;

  player.inVehicle = tuner;
  player.x = tuner.x;
  player.z = tuner.z;
  player.heading = tuner.heading;
  player.cash = 76900;
  player.syndicateRep = 510;

  // 3 Police Interceptor Cruisers boxing in with red/blue strobes
  const c1 = vehicles[1];
  c1.archetype = 'solmar_pd';
  c1.name = 'Solmar PD Interceptor';
  c1.isPolice = true;
  c1.color = [0.11, 0.15, 0.26];
  c1.x = -2.8;
  c1.z = 49.5;
  c1.heading = 2.85;
  c1.speed = 45;
  c1.sirenPhase = 0.6;
  c1.plateId = 'SPD-901';

  const c2 = vehicles[2];
  c2.archetype = 'solmar_pd';
  c2.name = 'Solmar PD Interceptor';
  c2.isPolice = true;
  c2.color = [0.11, 0.15, 0.26];
  c2.x = 6.2;
  c2.z = 44.0;
  c2.heading = 3.35;
  c2.speed = 44;
  c2.sirenPhase = 3.8;
  c2.plateId = 'SPD-902';

  const c3 = vehicles[3];
  c3.archetype = 'solmar_pd';
  c3.name = 'Solmar PD Interceptor';
  c3.isPolice = true;
  c3.color = [0.11, 0.15, 0.26];
  c3.x = -5.4;
  c3.z = 36.0;
  c3.heading = 0.45;
  c3.speed = 32;
  c3.sirenPhase = 1.2;
  c3.plateId = 'SPD-903';

  // Overhead Falcon Chopper + Volumetric Spotlight Cone
  police.chopper.active = true;
  police.chopper.x = 2.5;
  police.chopper.y = 21.0;
  police.chopper.z = 28.0;
  police.chopper.rotorAngle = 1.1;
  police.chopper.spotX = 1.2;
  police.chopper.spotZ = 45.5;

  // Collision & bullet sparks
  particles.length = 0;
  for (let i = 0; i < 14; i++) {
    particles.push({
      x: -0.6 + (i % 4) * 0.45,
      y: 0.7 + (i % 3) * 0.35,
      z: 52.5 - i * 0.3,
      vx: 0,
      vy: 0,
      vz: 0,
      color: i % 2 === 0 ? [1.0, 0.78, 0.22] : [1.0, 0.32, 0.24],
      size: 0.28,
      life: 1,
      maxLife: 1,
    });
  }

  return {
    eye: [4.6, 5.5, 69.5],
    target: [0.2, 2.2, 36.0],
  };
}

export function stageDowntownCombatMissionScene(
  renderer,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector,
  projectiles,
  particles,
  uiState
) {
  renderer.lightingPreset = 'golden';
  uiState.showStartOverlay = false;
  uiState.showMissionMenu = false;

  selectMissionFromMenu(missionDirector, 3, player, vehicles, pedestrians, police);
  missionDirector.enforcersEliminated = 3;
  escalateWantedStars(police, 2, 'ARMED SYNDICATE CLASH');
  police.inSight = true;
  police.faceHeat = 62;
  police.outfitHeat = 58;
  police.carHeat = 35;

  // Player Mateo Reyes on foot in Downtown Glassline Plaza firing Caldera TAC-45 Carbine
  player.inVehicle = null;
  player.x = -1.8;
  player.z = -12.0;
  player.heading = 3.04;
  player.weaponIndex = 2; // Caldera TAC-45 Carbine
  player.muzzleFlashTimer = 0.09;
  player.walkCycle = 0.8;
  player.cash = 94200;
  player.syndicateRep = 630;

  // Nearby exotic Manta GT Coupe ready to hijack with [F] prompt
  const escapeCoupe = vehicles[0];
  escapeCoupe.archetype = 'manta_gt';
  escapeCoupe.name = 'Manta GT Coupe';
  escapeCoupe.isPolice = false;
  escapeCoupe.isParked = true;
  escapeCoupe.color = [0.04, 0.92, 1.0];
  escapeCoupe.accentColor = [1.0, 0.25, 0.72];
  escapeCoupe.x = 2.6;
  escapeCoupe.z = -16.2;
  escapeCoupe.heading = 2.65;
  escapeCoupe.speed = 0;

  // Move any other vehicles further away so escapeCoupe is the closest [F] hijack target
  for (let i = 2; i < vehicles.length; i++) {
    if (Math.hypot(vehicles[i].x - player.x, vehicles[i].z - player.z) < 16) {
      vehicles[i].z -= 35;
    }
  }

  // Syndicate Enforcer SUV cover car
  const suv = vehicles[1];
  suv.archetype = 'saltworks_van';
  suv.name = 'Krow Syndicate Van';
  suv.isPolice = false;
  suv.isParked = true;
  suv.color = [0.22, 0.24, 0.3];
  suv.x = -5.8;
  suv.z = -31.0;
  suv.heading = 1.15;
  suv.speed = 0;

  // Position hostile Krow Syndicate Enforcers cleanly across the plaza ahead
  const hostiles = pedestrians.filter((p) => p.isHostile);
  const coords = [
    { x: -6.4, z: -24.5, hp: 58 },
    { x: -2.8, z: -26.5, hp: 38 },
    { x: 0.8, z: -28.5, hp: 65 },
    { x: -4.8, z: -33.5, hp: 48 },
    { x: 2.6, z: -32.0, hp: 72 },
  ];
  for (let i = 0; i < Math.min(hostiles.length, coords.length); i++) {
    hostiles[i].x = coords[i].x;
    hostiles[i].z = coords[i].z;
    hostiles[i].hp = coords[i].hp;
    hostiles[i].heading = 0.1;
    hostiles[i].muzzleFlashTimer = 0.08;
  }

  // Active 3D bullet tracers & hit sparks
  projectiles.length = 0;
  projectiles.push(
    {
      x: -2.3,
      y: 1.38,
      z: -18.5,
      prevX: -2.0,
      prevY: 1.38,
      prevZ: -15.5,
      vx: 0,
      vy: 0,
      vz: -90,
      damage: 34,
      fromPlayer: true,
      color: [1.0, 0.65, 0.18],
      life: 0.5,
    },
    {
      x: -2.9,
      y: 1.36,
      z: -23.5,
      prevX: -2.6,
      prevY: 1.36,
      prevZ: -20.5,
      vx: 0,
      vy: 0,
      vz: -90,
      damage: 34,
      fromPlayer: true,
      color: [1.0, 0.65, 0.18],
      life: 0.5,
    },
    {
      x: -0.4,
      y: 1.35,
      z: -21.0,
      prevX: 0.2,
      prevY: 1.35,
      prevZ: -24.0,
      vx: 0,
      vy: 0,
      vz: 70,
      damage: 8,
      fromPlayer: false,
      color: [1.0, 0.28, 0.36],
      life: 0.5,
    }
  );

  particles.length = 0;
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: -3.2 + (i % 3) * 0.35,
      y: 1.1 + (i % 4) * 0.25,
      z: -25.2,
      vx: 0,
      vy: 0,
      vz: 0,
      color: [1.0, 0.72, 0.22],
      size: 0.26,
      life: 1,
      maxLife: 1,
    });
  }

  police.chopper.active = false;

  return {
    eye: [-0.8, 3.6, -4.2],
    target: [-1.4, 1.3, -26.0],
  };
}

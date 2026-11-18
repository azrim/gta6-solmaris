// Solmar Coast: Neon Syndicate — Main Game Loop, Input Controller, Driving/Foot Physics & Save System

import {
  buildSolmarCityWorld,
  computeGpsRouteWaypoints,
  resolveWorldCollisionAABB,
  updateTrafficSignalPhase,
} from './world.js';
import {
  VEHICLE_ARCHETYPES,
  WEAPON_ARSENAL,
  attemptHijackOrExitVehicle,
  createPlayerProtagonist,
  fireEquippedWeapon,
  spawnCityTrafficAndPedestrians,
  updatePedestrianCrowdsAI,
  updateProjectilesAndExplosions,
  updateTrafficVehiclesAI,
} from './entities.js';
import {
  PolicePursuitDirector,
  updatePoliceCruisersAndChopper,
  updatePoliceLineOfSightAndHeat,
} from './police.js';
import {
  MissionStoryDirector,
  advanceMissionObjectives,
  selectMissionFromMenu,
  triggerInteractiveShopOrSafehouse,
} from './missions.js';
import {
  SolmarAudioSynthesizer,
  cycleRadioStation,
  updateEngineAndSirenSynth,
} from './audio.js';
import {
  WebGL2CityRenderer,
  render3DOpenWorldScene,
  updateFollowCameraMatrix,
} from './render3d.js';
import {
  SolmarHudRenderer,
  renderCircularGpsMinimap,
  renderDistrictRadioAndClock,
  renderMissionDialogueAndBanner,
  renderSpeedometerArcDial,
  renderStartAndPauseOverlays,
  renderWantedAndHeatBadges,
  renderWorldSpaceCallouts,
} from './hud.js';
import { applyDeterministicScreenshotStage } from './shots.js';

const SAVE_STORAGE_KEY = 'solmar_coast_neon_syndicate_save_v1';

export function saveGameProgress(player, missionDirector, police) {
  try {
    const payload = {
      cash: player.cash,
      syndicateRep: player.syndicateRep,
      outfitIndex: player.outfitIndex,
      weaponIndex: player.weaponIndex,
      ammo: player.ammo,
      x: player.x,
      z: player.z,
      missionIndex: missionDirector.currentMissionIndex,
      completedMissions: missionDirector.completedMissions,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    const m = missionDirector.activeMission;
    missionDirector.lastSavedTimestamp = `DAY ${m ? m.day : 1} • SAVED`;
    missionDirector.bannerText = 'PROGRESSION SAVED TO LOCALSTORAGE';
    missionDirector.bannerTimer = 3.0;
    return true;
  } catch {
    return false;
  }
}

export function loadGameProgress(player, missionDirector, vehicles, pedestrians, police) {
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (typeof data.cash === 'number') player.cash = data.cash;
    if (typeof data.syndicateRep === 'number') player.syndicateRep = data.syndicateRep;
    if (typeof data.outfitIndex === 'number') player.outfitIndex = data.outfitIndex;
    if (typeof data.weaponIndex === 'number') player.weaponIndex = data.weaponIndex;
    if (data.ammo && typeof data.ammo === 'object') {
      player.ammo = { ...player.ammo, ...data.ammo };
    }
    if (typeof data.missionIndex === 'number') {
      selectMissionFromMenu(missionDirector, data.missionIndex, player, vehicles, pedestrians, police);
    }
    missionDirector.bannerText = 'SAVED GAME LOADED FROM LOCALSTORAGE';
    missionDirector.bannerTimer = 3.0;
    return true;
  } catch {
    return false;
  }
}

export function updatePlayerMovementAndDriving(player, world, keys, mouseState, particles, dt) {
  if (player.fireCooldown > 0) player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  if (player.muzzleFlashTimer > 0) player.muzzleFlashTimer = Math.max(0, player.muzzleFlashTimer - dt);

  const forward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  const turn = (keys.KeyA || keys.ArrowLeft ? 1 : 0) - (keys.KeyD || keys.ArrowRight ? 1 : 0);
  const handbrake = Boolean(keys.Space);

  if (player.inVehicle) {
    const v = player.inVehicle;
    const arch = VEHICLE_ARCHETYPES[v.archetype] || VEHICLE_ARCHETYPES.manta_gt;

    if (forward > 0) {
      v.speed = Math.min(arch.maxSpeed, v.speed + arch.accel * dt);
    } else if (forward < 0) {
      v.speed = Math.max(-arch.maxSpeed * 0.42, v.speed - arch.accel * 1.15 * dt);
    } else {
      v.speed *= Math.max(0, 1 - dt * 1.8);
    }

    if (handbrake) {
      v.speed *= Math.max(0, 1 - dt * 3.2);
      v.driftIntensity = Math.min(1, v.driftIntensity + dt * 4);
      if (Math.abs(v.speed) > 12) {
        particles.push({
          x: v.x - Math.sin(v.heading) * 1.8,
          y: 0.18,
          z: v.z - Math.cos(v.heading) * 1.8,
          vx: (Math.random() - 0.5) * 2.5,
          vy: 0.6 + Math.random() * 0.8,
          vz: (Math.random() - 0.5) * 2.5,
          color: [0.85, 0.88, 0.94],
          size: 0.28,
          life: 0.32,
          maxLife: 0.32,
        });
      }
    } else {
      v.driftIntensity = Math.max(0, v.driftIntensity - dt * 3);
    }

    const speedFactor = Math.min(1, Math.abs(v.speed) / 8);
    const dirSign = v.speed >= -0.2 ? 1 : -1;
    const turnMultiplier = handbrake ? 1.38 : 1.0;
    v.steerAngle = turn * 0.45;
    v.heading += turn * arch.turnRate * speedFactor * dirSign * turnMultiplier * dt;

    v.x += Math.sin(v.heading) * v.speed * dt;
    v.z += Math.cos(v.heading) * v.speed * dt;
    v.wheelSpin = (v.wheelSpin + v.speed * dt * 1.8) % 6.28;

    const col = resolveWorldCollisionAABB(world, v.x, v.z, 1.65);
    if (col.collided) {
      v.x = col.x;
      v.z = col.z;
      v.speed *= -0.35;
    }

    player.x = v.x;
    player.z = v.z;
    player.heading = v.heading;
  } else {
    const moveSpeed = handbrake ? 10.8 : 7.2;
    if (forward !== 0 || turn !== 0) {
      player.heading += turn * 2.8 * dt;
      const moveX = Math.sin(player.heading) * forward * moveSpeed;
      const moveZ = Math.cos(player.heading) * forward * moveSpeed;
      player.x += moveX * dt;
      player.z += moveZ * dt;
      player.walkCycle += dt * (handbrake ? 11.5 : 8.0);
    }
    const col = resolveWorldCollisionAABB(world, player.x, player.z, 0.65);
    player.x = col.x;
    player.z = col.z;
  }
}

export function bootSolmarCoastGame() {
  const canvas3d = document.getElementById('world3d');
  const canvas2d = document.getElementById('hud2d');

  const syncViewportSize = () => {
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 800;
    canvas3d.width = w;
    canvas3d.height = h;
    canvas2d.width = w;
    canvas2d.height = h;
  };
  syncViewportSize();
  window.addEventListener('resize', syncViewportSize);

  const world = buildSolmarCityWorld(101);
  const renderer = new WebGL2CityRenderer(canvas3d, world);
  const hud = new SolmarHudRenderer(canvas2d);
  const player = createPlayerProtagonist();
  const { vehicles, pedestrians } = spawnCityTrafficAndPedestrians(world, 202);
  const police = new PolicePursuitDirector();
  const missionDirector = new MissionStoryDirector();
  const audio = new SolmarAudioSynthesizer();

  const projectiles = [];
  const particles = [];
  const skidMarks = [];
  const keys = {};
  const mouseState = { x: canvas2d.width * 0.5, y: canvas2d.height * 0.5, down: false };
  const uiState = {
    showStartOverlay: true,
    showMissionMenu: false,
  };

  // Start player inside the signature cyan Manta GT Coupe on Praia Solmar Ocean Drive
  player.inVehicle = vehicles[0];
  vehicles[0].archetype = 'manta_gt';
  vehicles[0].name = VEHICLE_ARCHETYPES.manta_gt.name;
  vehicles[0].color = [0.04, 0.92, 1.0];
  vehicles[0].x = 89.5;
  vehicles[0].z = 22.0;
  vehicles[0].heading = 3.02;
  vehicles[0].speed = 24;
  player.x = vehicles[0].x;
  player.z = vehicles[0].z;
  player.heading = vehicles[0].heading;

  selectMissionFromMenu(missionDirector, 0, player, vehicles, pedestrians, police);

  const params = new URLSearchParams(window.location.search);
  const shotParam = params.get('shot');
  let cameraOverride = null;
  if (shotParam) {
    cameraOverride = applyDeterministicScreenshotStage(
      shotParam,
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
    );
  }

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    audio.ensureContext();

    if (e.code === 'Enter') {
      uiState.showStartOverlay = false;
      uiState.showMissionMenu = false;
      cameraOverride = null;
    } else if (e.code === 'Escape' || e.code === 'Tab') {
      e.preventDefault();
      uiState.showStartOverlay = !uiState.showStartOverlay;
    } else if (e.code === 'KeyF') {
      attemptHijackOrExitVehicle(player, vehicles, police, audio);
      cameraOverride = null;
    } else if (e.code === 'KeyR') {
      cycleRadioStation(audio);
    } else if (e.code === 'KeyE') {
      const usedPoi = triggerInteractiveShopOrSafehouse(
        missionDirector,
        player,
        police,
        world,
        () => saveGameProgress(player, missionDirector, police),
        audio
      );
      if (!usedPoi) {
        player.weaponIndex = (player.weaponIndex + 1) % WEAPON_ARSENAL.length;
      }
    } else if (e.code === 'KeyQ') {
      player.weaponIndex = (player.weaponIndex + WEAPON_ARSENAL.length - 1) % WEAPON_ARSENAL.length;
    } else if (e.code === 'KeyM') {
      uiState.showMissionMenu = !uiState.showMissionMenu;
    } else if (e.code === 'F5') {
      e.preventDefault();
      saveGameProgress(player, missionDirector, police);
    } else if (e.code === 'F9') {
      e.preventDefault();
      loadGameProgress(player, missionDirector, vehicles, pedestrians, police);
    } else if (e.code.startsWith('Digit')) {
      const num = Number(e.code.replace('Digit', ''));
      if (uiState.showMissionMenu && num >= 1 && num <= 9) {
        selectMissionFromMenu(missionDirector, num - 1, player, vehicles, pedestrians, police);
        uiState.showMissionMenu = false;
      } else if (num >= 1 && num <= WEAPON_ARSENAL.length) {
        player.weaponIndex = num - 1;
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  canvas2d.addEventListener('mousemove', (e) => {
    mouseState.x = e.clientX;
    mouseState.y = e.clientY;
  });

  canvas2d.addEventListener('mousedown', (e) => {
    audio.ensureContext();
    if (uiState.showStartOverlay) {
      if (e.clientX > 375 || (e.clientX >= 34 && e.clientX <= 348 && e.clientY >= 194 && e.clientY <= 228)) {
        uiState.showStartOverlay = false;
        cameraOverride = null;
        return;
      }
    }
    mouseState.down = true;
    const dx = e.clientX - canvas2d.width * 0.5;
    const aimOffset = (dx / (canvas2d.width * 0.5)) * 0.55;
    fireEquippedWeapon(
      player,
      renderer.cameraYaw + aimOffset,
      projectiles,
      particles,
      pedestrians,
      police,
      audio
    );
  });

  window.addEventListener('mouseup', () => {
    mouseState.down = false;
  });

  let lastTime = performance.now();
  let elapsedSec = 0;
  let clockMinutes = 18 * 60 + 42; // 18:42 Golden Hour

  const runFrameLoop = (now) => {
    const rawDt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    if (!shotParam) {
      elapsedSec += rawDt;
      clockMinutes = (clockMinutes + rawDt * 0.8) % 1440;
      updateTrafficSignalPhase(world, elapsedSec);
      updatePlayerMovementAndDriving(player, world, keys, mouseState, particles, rawDt);
      updateTrafficVehiclesAI(vehicles, world, player, skidMarks, rawDt);
      updatePedestrianCrowdsAI(pedestrians, world, player, projectiles, particles, audio, rawDt);
      updateProjectilesAndExplosions(
        projectiles,
        particles,
        player,
        vehicles,
        pedestrians,
        police,
        world,
        audio,
        rawDt
      );
      updatePoliceLineOfSightAndHeat(police, player, vehicles, world, rawDt);
      updatePoliceCruisersAndChopper(police, player, vehicles, pedestrians, world, particles, rawDt);
      advanceMissionObjectives(missionDirector, player, vehicles, pedestrians, police, world, audio, rawDt);
      updateEngineAndSirenSynth(audio, player, police, rawDt);
    }

    const activeMission = missionDirector.activeMission;
    const gpsRoute = activeMission
      ? computeGpsRouteWaypoints(player.x, player.z, activeMission.targetX, activeMission.targetZ)
      : [];

    const viewProj = updateFollowCameraMatrix(renderer, player, cameraOverride, rawDt);

    render3DOpenWorldScene(
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
    );

    const ctx = hud.ctx;
    const w = canvas2d.width;
    const h = canvas2d.height;
    ctx.clearRect(0, 0, w, h);

    renderWorldSpaceCallouts(
      ctx,
      viewProj,
      w,
      h,
      world,
      player,
      vehicles,
      pedestrians,
      police,
      missionDirector
    );
    renderDistrictRadioAndClock(ctx, player, world, missionDirector, audio, clockMinutes);
    renderWantedAndHeatBadges(ctx, w, player, police);
    renderCircularGpsMinimap(
      ctx,
      h,
      world,
      player,
      vehicles,
      pedestrians,
      police,
      missionDirector,
      gpsRoute,
      renderer.cameraYaw
    );
    renderSpeedometerArcDial(ctx, w, h, player);
    renderMissionDialogueAndBanner(ctx, w, h, missionDirector);
    renderStartAndPauseOverlays(ctx, w, h, uiState, missionDirector);

    window.__SOLMAR_READY = true;
    requestAnimationFrame(runFrameLoop);
  };

  requestAnimationFrame(runFrameLoop);
}

bootSolmarCoastGame();

// Solmar Coast: Neon Syndicate — 12-Mission 3-Day Storyline, Dialogues, Shops, Safehouses & Save Progression

import { escalateWantedStars, resprayVehicleClearCarHeat, swapWardrobeClearOutfitHeat } from './police.js';

export const SYNDICATE_MISSIONS = [
  {
    id: 'praia_drop',
    index: 1,
    day: 1,
    title: 'SUNLIT DROPOFF',
    district: 'Praia Solmar',
    objective: 'DRIVE THE MANTA GT COUPE ALONG OCEAN DRIVE TO CAMILA AT PALM PIER',
    speaker: 'Camila Vega',
    dialogue: 'Krow Syndicate scouts are on Ocean Drive—bring the Manta GT to Palm Pier fast!',
    targetX: 88,
    targetZ: -64,
    rewardCash: 8500,
    rewardRep: 60,
    combatCount: 0,
    wantedLevel: 2,
  },
  {
    id: 'crossroads_run',
    index: 2,
    day: 1,
    title: 'CROSSROADS COURIER',
    district: 'Downtown Glassline',
    objective: 'DELIVER SYNDICATE CONTRABAND ACROSS GRAND SOLMAR CROSSROADS TO SALTWORKS PIER',
    speaker: 'Camila Vega',
    dialogue: 'Thread the Valkyrie V8 through the Grand Crossroads before the port gates lock!',
    targetX: -84,
    targetZ: 88,
    rewardCash: 11000,
    rewardRep: 75,
    combatCount: 0,
    wantedLevel: 1,
  },
  {
    id: 'neon_heat',
    index: 3,
    day: 1,
    title: 'NEON CUSTOMS HEAT',
    district: 'Praia Solmar',
    objective: 'EVADE THE 4-STAR SOLMAR PD CHOPPER SPOTLIGHT & REACH NEON CUSTOMS GARAGE',
    speaker: 'Rico Salazar',
    dialogue: 'Falcon PD chopper is locked on us! Break the spotlight and respray at Neon Customs!',
    targetX: 18,
    targetZ: 68,
    rewardCash: 14500,
    rewardRep: 95,
    combatCount: 0,
    wantedLevel: 4,
  },
  {
    id: 'vault_breach',
    index: 4,
    day: 1,
    title: 'GLASSLINE VAULT BREACH',
    district: 'Downtown Glassline',
    objective: 'ELIMINATE KROW SYNDICATE ENFORCERS (3/5) & HIJACK THE ESCAPE COUPE [F]',
    speaker: 'Rico Salazar',
    dialogue: 'Krow guards pinned us at Glassline Plaza! Clear them with the Carbine and boost that Coupe!',
    targetX: -6,
    targetZ: -28,
    rewardCash: 18000,
    rewardRep: 120,
    combatCount: 5,
    wantedLevel: 2,
  },
  {
    id: 'harbor_heist',
    index: 5,
    day: 2,
    title: 'SALTWORKS CONTAINER HEIST',
    district: 'Saltworks Harbor',
    objective: 'SECURE THE SMUGGLER CRATES BENEATH THE SALTWORKS HARBOR CRANES',
    speaker: 'Camila Vega',
    dialogue: 'The turbine shipment just docked under Crane 2. Neutralize the dock mercenaries and claim the van.',
    targetX: -125,
    targetZ: 138,
    rewardCash: 19500,
    rewardRep: 130,
    combatCount: 4,
    wantedLevel: 2,
  },
  {
    id: 'cctv_blackout',
    index: 6,
    day: 2,
    title: 'SIGNAL BLACKOUT',
    district: 'Downtown Glassline',
    objective: 'HACK THE GLASSLINE CCTV UPLINK TO SCRUB SYNDICATE BIOMETRIC LOGS',
    speaker: 'Camila Vega',
    dialogue: 'Inspector Vane linked the city cameras to facial recognition. Hit the Glassline Uplink terminal to wipe our heat.',
    targetX: -18,
    targetZ: -68,
    rewardCash: 16000,
    rewardRep: 110,
    combatCount: 0,
    wantedLevel: 3,
  },
  {
    id: 'cerro_convoy',
    index: 7,
    day: 2,
    title: 'CERRO ALTO CONVOY',
    district: 'Cerro Alto',
    objective: 'INTERCEPT THE ARMORED TRANSPORT CLIMBING CERRO ALTO OVERLOOK',
    speaker: 'Rico Salazar',
    dialogue: 'Krow is moving bullion up the Cerro Alto switchbacks. Cut them off at the terrace intersection!',
    targetX: -165,
    targetZ: -85,
    rewardCash: 22000,
    rewardRep: 140,
    combatCount: 3,
    wantedLevel: 2,
  },
  {
    id: 'boardwalk_duel',
    index: 8,
    day: 2,
    title: 'BOARDWALK SHOWDOWN',
    district: 'Praia Solmar',
    objective: 'DEFEND VILLA SOLMAR SAFEHOUSE FROM THE RIVAL HIT SQUAD',
    speaker: 'Camila Vega',
    dialogue: 'Enforcers spotted you near Villa Solmar! Clear the boardwalk and swap your outfit inside the safehouse.',
    targetX: 72,
    targetZ: -24,
    rewardCash: 24000,
    rewardRep: 150,
    combatCount: 4,
    wantedLevel: 2,
  },
  {
    id: 'chopper_evade',
    index: 9,
    day: 3,
    title: 'HELICOPTER SPOTLIGHT RUN',
    district: 'Saltworks Harbor',
    objective: 'OUTRUN THE SOLMAR PD INTERCEPTOR PACK ACROSS THE HARBOR VIADUCT',
    speaker: 'Rico Salazar',
    dialogue: 'Four stars on the board and roadblocks ahead—use the Valkyrie V8 torque to smash through to the docks!',
    targetX: -88,
    targetZ: 165,
    rewardCash: 26500,
    rewardRep: 165,
    combatCount: 0,
    wantedLevel: 4,
  },
  {
    id: 'armory_raid',
    index: 10,
    day: 3,
    title: 'CALDERA ARMORY RAID',
    district: 'Downtown Glassline',
    objective: 'RESUPPLY HEAVY WEAPONS AT CALDERA TACTICS ARMORY',
    speaker: 'Rico Salazar',
    dialogue: 'Stock up on Carbine magazines and Pulse Frag charges at Caldera Tactics before we hit Krow Tower.',
    targetX: -68,
    targetZ: -22,
    rewardCash: 21000,
    rewardRep: 135,
    combatCount: 0,
    wantedLevel: 1,
  },
  {
    id: 'penthouse_siege',
    index: 11,
    day: 3,
    title: 'GLASSLINE PENTHOUSE ASSAULT',
    district: 'Downtown Glassline',
    objective: 'DEFEAT DANTE KROW ELITE GUARDS AT GLASSLINE SKYBRIDGE PLAZA',
    speaker: 'Camila Vega',
    dialogue: 'This is it, Mateo. Take down Krow’s command squad in front of the central tower!',
    targetX: -28,
    targetZ: -38,
    rewardCash: 35000,
    rewardRep: 220,
    combatCount: 6,
    wantedLevel: 3,
  },
  {
    id: 'solmar_finale',
    index: 12,
    day: 3,
    title: 'SOLMAR HORIZON FINALE',
    district: 'Praia Solmar',
    objective: 'RACE TO PRAIA SOLMAR MARINA PIER WITH THE SYNDICATE VAULT KEY',
    speaker: 'Camila Vega',
    dialogue: 'Solmar Coast belongs to us now! Floor it down Ocean Drive to the marina speedboat!',
    targetX: 94,
    targetZ: 112,
    rewardCash: 50000,
    rewardRep: 300,
    combatCount: 0,
    wantedLevel: 5,
  },
];

export class MissionStoryDirector {
  constructor() {
    this.currentMissionIndex = 0;
    this.completedMissions = 0;
    this.enforcersEliminated = 0;
    this.enforcersRequired = 0;
    this.bannerText = '';
    this.bannerTimer = 0;
    this.nearbyPoi = null;
    this.lastSavedTimestamp = 'DAY 1 • 18:42';
  }

  get activeMission() {
    return SYNDICATE_MISSIONS[this.currentMissionIndex % SYNDICATE_MISSIONS.length];
  }
}

export function selectMissionFromMenu(director, missionIndex, player, vehicles, pedestrians, police) {
  const idx = Math.max(0, Math.min(SYNDICATE_MISSIONS.length - 1, missionIndex));
  director.currentMissionIndex = idx;
  const m = director.activeMission;
  director.enforcersEliminated = 0;
  director.enforcersRequired = m.combatCount;
  director.bannerText = `MISSION ${m.index}/12 STARTED: ${m.title}`;
  director.bannerTimer = 3.5;

  // Clear old hostile enforcers and spawn mission enforcers if required
  for (let i = pedestrians.length - 1; i >= 0; i--) {
    if (pedestrians[i].isHostile) pedestrians.splice(i, 1);
  }

  if (m.combatCount > 0) {
    for (let k = 0; k < m.combatCount; k++) {
      const angle = (k / m.combatCount) * Math.PI * 2;
      pedestrians.push({
        id: `enforcer_${idx}_${k}`,
        name: 'Krow Enforcer',
        x: m.targetX + Math.cos(angle) * 7.5,
        z: m.targetZ + Math.sin(angle) * 7.5,
        vx: 0,
        vz: 0,
        heading: angle + Math.PI,
        walkSpeed: 2.8,
        walkCycle: k * 1.1,
        shirtColor: [0.92, 0.18, 0.28],
        pantsColor: [0.1, 0.12, 0.16],
        hp: 75,
        maxHp: 75,
        isHostile: true,
        isPoliceOfficer: false,
        fleeTimer: 0,
        fireCooldown: 0.4 + k * 0.25,
        muzzleFlashTimer: 0,
      });
    }
  }

  if (police) {
    escalateWantedStars(police, m.wantedLevel, m.title);
  }
}

export function advanceMissionObjectives(director, player, vehicles, pedestrians, police, world, audio, dt) {
  if (director.bannerTimer > 0) {
    director.bannerTimer = Math.max(0, director.bannerTimer - dt);
  }

  // Check nearby interactive POI (Safehouse, Neon Customs, Armory, CCTV Terminal)
  director.nearbyPoi = null;
  for (let i = 0; i < world.pois.length; i++) {
    const poi = world.pois[i];
    const d = Math.hypot(poi.x - player.x, poi.z - player.z);
    if (d < 9.5) {
      director.nearbyPoi = poi;
      break;
    }
  }

  const m = director.activeMission;
  if (!m) return;

  // Count remaining hostile enforcers if this is a combat mission
  if (m.combatCount > 0) {
    let aliveHostiles = 0;
    for (let i = 0; i < pedestrians.length; i++) {
      if (pedestrians[i].isHostile && pedestrians[i].hp > 0) aliveHostiles++;
    }
    director.enforcersEliminated = Math.max(0, m.combatCount - aliveHostiles);
  }

  const distToWaypoint = Math.hypot(player.x - m.targetX, player.z - m.targetZ);
  const combatDone = m.combatCount === 0 || director.enforcersEliminated >= m.combatCount;

  if (distToWaypoint < 10.5 && combatDone) {
    player.cash += m.rewardCash;
    player.syndicateRep += m.rewardRep;
    director.completedMissions++;
    director.bannerText = `MISSION COMPLETE! +$${m.rewardCash.toLocaleString()} • +${m.rewardRep} REP`;
    director.bannerTimer = 4.2;
    if (audio) audio.playMissionChimeSfx();

    const nextIdx = (director.currentMissionIndex + 1) % SYNDICATE_MISSIONS.length;
    selectMissionFromMenu(director, nextIdx, player, vehicles, pedestrians, police);
  }
}

export function triggerInteractiveShopOrSafehouse(director, player, police, world, saveCallback, audio) {
  const poi = director.nearbyPoi;
  if (!poi) return false;

  if (poi.type === 'safehouse') {
    player.health = player.maxHealth;
    swapWardrobeClearOutfitHeat(police, player);
    if (saveCallback) saveCallback();
    director.bannerText = 'GAME SAVED AT VILLA SOLMAR • OUTFIT SWAPPED (HEAT CLEARED)';
    director.bannerTimer = 3.8;
    if (audio) audio.playMissionChimeSfx();
    return true;
  }

  if (poi.type === 'customs') {
    if (player.cash >= 500) {
      player.cash -= 500;
      resprayVehicleClearCarHeat(police, player);
      director.bannerText = 'NEON CUSTOMS: VEHICLE RESPRAYED & PLATES SWAPPED (-$500)';
      director.bannerTimer = 3.5;
      if (audio) audio.playMissionChimeSfx();
      return true;
    }
  }

  if (poi.type === 'armory') {
    if (player.cash >= 350) {
      player.cash -= 350;
      player.armor = player.maxArmor;
      player.ammo.pistol = 150;
      player.ammo.smg = 300;
      player.ammo.carbine = 240;
      player.ammo.shotgun = 80;
      player.ammo.grenade = 16;
      director.bannerText = 'CALDERA ARMORY: FULL AMMO & KEVLAR EQUIPPED (-$350)';
      director.bannerTimer = 3.5;
      if (audio) audio.playMissionChimeSfx();
      return true;
    }
  }

  if (poi.type === 'cctv_terminal') {
    police.cctvAlert = false;
    police.faceHeat = 8;
    if (police.wantedStars > 0) police.wantedStars = Math.max(0, police.wantedStars - 1);
    director.bannerText = 'CCTV UPLINK HACKED: BIOMETRIC & CAMERA HEAT SCRUBBED';
    director.bannerTimer = 3.5;
    if (audio) audio.playMissionChimeSfx();
    return true;
  }

  return false;
}

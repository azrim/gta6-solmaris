// Solmar Coast: Neon Syndicate — Canvas2D HUD, Circular GPS Minimap, Speedometer, Heat Badges & Menus

import { COASTLINE_X, ROAD_X_COORDS, ROAD_Z_COORDS, sampleDistrictAt } from './world.js';
import { OUTFIT_STYLES, WEAPON_ARSENAL, findNearestHijackableVehicle } from './entities.js';
import { SYNDICATE_MISSIONS } from './missions.js';
import { projectWorldToScreen } from './render3d.js';

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export class SolmarHudRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
}

export function renderWorldSpaceCallouts(
  ctx,
  viewProj,
  width,
  height,
  world,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector
) {
  ctx.save();

  // 1. Hijackable vehicle floating prompt when on foot (or nearest exotic car)
  const hijackTarget = findNearestHijackableVehicle(player, vehicles, 14.0);
  if (hijackTarget) {
    const proj = projectWorldToScreen(viewProj, hijackTarget.x, 2.25, hijackTarget.z, width, height);
    if (proj.visible && proj.depth < 65) {
      const label = `[F] HIJACK ${hijackTarget.name.toUpperCase()}`;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      const tw = ctx.measureText(label).width + 20;
      const bx = proj.x - tw * 0.5;
      const by = proj.y - 28;

      drawRoundedRect(ctx, bx, by, tw, 24, 6);
      ctx.fillStyle = 'rgba(8, 14, 28, 0.88)';
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#00e5ff';
      ctx.stroke();

      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'center';
      ctx.fillText(label, proj.x, by + 16);
    }
  }

  // 2. Hostile Syndicate Enforcers health bars & tags (with vertical de-overlap)
  const placedEnforcerBoxes = [];
  for (let i = 0; i < pedestrians.length; i++) {
    const p = pedestrians[i];
    if (!p.isHostile || p.hp <= 0) continue;
    const proj = projectWorldToScreen(viewProj, p.x, 2.15, p.z, width, height);
    if (proj.visible && proj.depth < 75) {
      const bw = 64;
      const bx = proj.x - bw * 0.5;
      let by = proj.y - 22;
      for (const prev of placedEnforcerBoxes) {
        if (Math.abs(bx - prev.x) < 68 && Math.abs(by - prev.y) < 24) {
          by = prev.y - 26;
        }
      }
      placedEnforcerBoxes.push({ x: bx, y: by });

      ctx.fillStyle = 'rgba(10, 12, 20, 0.85)';
      ctx.fillRect(bx - 2, by - 14, bw + 4, 22);
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KROW ENFORCER', proj.x, by - 3);

      ctx.fillStyle = '#2a1215';
      ctx.fillRect(bx, by, bw, 5);
      ctx.fillStyle = '#ff334b';
      ctx.fillRect(bx, by, bw * Math.max(0, p.hp / p.maxHp), 5);
    }
  }

  // On-foot tactical aiming reticle
  if (!player.inVehicle) {
    const rx = width * 0.48;
    const ry = height * 0.43;
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(rx, ry, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - 17, ry);
    ctx.lineTo(rx - 6, ry);
    ctx.moveTo(rx + 6, ry);
    ctx.lineTo(rx + 17, ry);
    ctx.moveTo(rx, ry - 17);
    ctx.lineTo(rx, ry - 6);
    ctx.moveTo(rx, ry + 6);
    ctx.lineTo(rx, ry + 17);
    ctx.stroke();
  }

  // 3. Police Cruisers & Chopper Tactical Callouts
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!v.isPolice || v.hp <= 0) continue;
    const proj = projectWorldToScreen(viewProj, v.x, 2.1, v.z, width, height);
    if (proj.visible && proj.depth < 70) {
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      const label = `SOLMAR PD • ${v.plateId}`;
      const tw = ctx.measureText(label).width + 14;
      drawRoundedRect(ctx, proj.x - tw * 0.5, proj.y - 18, tw, 18, 4);
      ctx.fillStyle = 'rgba(12, 18, 38, 0.84)';
      ctx.fill();
      ctx.strokeStyle = Math.sin(v.sirenPhase) > 0 ? '#ff3355' : '#29b6f6';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#e8f4ff';
      ctx.textAlign = 'center';
      ctx.fillText(label, proj.x, proj.y - 5);
    }
  }

  if (police.chopper.active) {
    const ch = police.chopper;
    const proj = projectWorldToScreen(viewProj, ch.x, ch.y + 2.2, ch.z, width, height);
    if (proj.visible) {
      const label = 'FALCON PD CHOPPER • SPOTLIGHT LOCK';
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      const tw = ctx.measureText(label).width + 18;
      drawRoundedRect(ctx, proj.x - tw * 0.5, proj.y - 16, tw, 20, 5);
      ctx.fillStyle = 'rgba(10, 18, 36, 0.86)';
      ctx.fill();
      ctx.strokeStyle = '#38ef7d';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = '#76ff03';
      ctx.textAlign = 'center';
      ctx.fillText(label, proj.x, proj.y - 2);
    }
  }

  // 4. Active Mission 3D Waypoint Marker
  const m = missionDirector.activeMission;
  if (m) {
    const dist = Math.round(Math.hypot(m.targetX - player.x, m.targetZ - player.z));
    const proj = projectWorldToScreen(viewProj, m.targetX, 4.5, m.targetZ, width, height);
    if (proj.visible && proj.depth < 180) {
      const label = `★ ${m.title} (${dist}m)`;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      const tw = ctx.measureText(label).width + 20;
      drawRoundedRect(ctx, proj.x - tw * 0.5, proj.y - 22, tw, 23, 6);
      ctx.fillStyle = 'rgba(20, 16, 8, 0.88)';
      ctx.fill();
      ctx.strokeStyle = '#ffd740';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fillStyle = '#ffd740';
      ctx.textAlign = 'center';
      ctx.fillText(label, proj.x, proj.y - 6);
    }
  }

  // 5. World POIs (Safehouse, Neon Customs, Armory, CCTV)
  for (const poi of world.pois) {
    const dist = Math.hypot(poi.x - player.x, poi.z - player.z);
    if (dist > 95) continue;
    const proj = projectWorldToScreen(viewProj, poi.x, 3.2, poi.z, width, height);
    if (proj.visible) {
      const label = `[${poi.icon}] ${poi.name.toUpperCase()}`;
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      const tw = ctx.measureText(label).width + 14;
      drawRoundedRect(ctx, proj.x - tw * 0.5, proj.y - 16, tw, 18, 4);
      ctx.fillStyle = 'rgba(10, 16, 28, 0.82)';
      ctx.fill();
      ctx.strokeStyle = '#ff6b9d';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(label, proj.x, proj.y - 4);
    }
  }

  ctx.restore();
}

export function renderDistrictRadioAndClock(ctx, player, world, missionDirector, audio, clockMinutes) {
  ctx.save();
  const district = sampleDistrictAt(player.x, player.z);
  const m = missionDirector.activeMission;
  const hrs = Math.floor(clockMinutes / 60) % 24;
  const mins = Math.floor(clockMinutes % 60);
  const timeStr = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  drawRoundedRect(ctx, 20, 18, 342, 82, 10);
  ctx.fillStyle = 'rgba(9, 14, 26, 0.84)';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = district.themeColor;
  ctx.stroke();

  // Left accent bar
  ctx.fillStyle = district.themeColor;
  ctx.fillRect(26, 26, 4, 66);

  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(district.name.toUpperCase(), 38, 40);

  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffd740';
  ctx.fillText(`DAY ${m ? m.day : 1} • ${timeStr}   |   REP ${player.syndicateRep}`, 38, 59);

  const station = audio.currentStation;
  ctx.font = '12px "Segoe UI", sans-serif';
  ctx.fillStyle = '#64ffda';
  ctx.fillText(`♫ ${station.name} — ${station.track} [R]`, 38, 79);

  const outfit = OUTFIT_STYLES[player.outfitIndex % OUTFIT_STYLES.length];
  ctx.font = '11px "Segoe UI", sans-serif';
  ctx.fillStyle = '#b0bec5';
  ctx.fillText(`OUTFIT: ${outfit.name.toUpperCase()}`, 38, 94);

  ctx.restore();
}

export function renderWantedAndHeatBadges(ctx, width, player, police) {
  ctx.save();
  const panelW = 356;
  const panelX = width - panelW - 20;
  const panelY = 18;

  drawRoundedRect(ctx, panelX, panelY, panelW, 134, 10);
  ctx.fillStyle = 'rgba(9, 14, 26, 0.86)';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = police.wantedStars > 0 ? '#ff3355' : '#00e5ff';
  ctx.stroke();

  // 1. Wanted Stars + IN SIGHT / COOLDOWN pill
  ctx.font = 'bold 21px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  for (let s = 0; s < 5; s++) {
    const active = s < police.wantedStars;
    ctx.fillStyle = active ? (s % 2 === 0 ? '#ff3355' : '#29b6f6') : 'rgba(255,255,255,0.22)';
    ctx.fillText('★', panelX + 14 + s * 25, panelY + 28);
  }

  // Status badge
  const badgeX = panelX + 148;
  const badgeY = panelY + 10;
  drawRoundedRect(ctx, badgeX, badgeY, 194, 24, 6);
  if (police.wantedStars > 0 && police.inSight) {
    ctx.fillStyle = 'rgba(255, 38, 75, 0.28)';
    ctx.fill();
    ctx.strokeStyle = '#ff3355';
    ctx.stroke();
    ctx.fillStyle = '#ff6b81';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`WANTED • IN SIGHT (${police.lastCrimeLabel.slice(0, 12)})`, badgeX + 97, badgeY + 16);
  } else if (police.wantedStars > 0) {
    ctx.fillStyle = 'rgba(255, 193, 7, 0.24)';
    ctx.fill();
    ctx.strokeStyle = '#ffc107';
    ctx.stroke();
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`EVADING • COOLDOWN ${police.evasionTimer.toFixed(1)}s`, badgeX + 97, badgeY + 16);
  } else {
    ctx.fillStyle = 'rgba(0, 229, 255, 0.16)';
    ctx.fill();
    ctx.strokeStyle = '#00e5ff';
    ctx.stroke();
    ctx.fillStyle = '#80deea';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLEAR • PATROL SCANNING', badgeX + 97, badgeY + 16);
  }

  // 2. Four Heat Telemetry Badges: FACE / OUTFIT / CAR / CCTV
  const heatItems = [
    { label: `FACE ${Math.round(police.faceHeat)}%`, hot: police.faceHeat > 50 },
    { label: `OUTFIT ${Math.round(police.outfitHeat)}%`, hot: police.outfitHeat > 50 },
    { label: `CAR ${Math.round(police.carHeat)}%`, hot: police.carHeat > 50 },
    { label: police.cctvAlert ? 'CCTV ALERT' : 'CCTV CLEAR', hot: police.cctvAlert },
  ];
  for (let i = 0; i < heatItems.length; i++) {
    const hx = panelX + 14 + i * 83;
    const hy = panelY + 40;
    drawRoundedRect(ctx, hx, hy, 78, 20, 4);
    ctx.fillStyle = heatItems[i].hot ? 'rgba(255, 82, 82, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = heatItems[i].hot ? '#ff5252' : 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = heatItems[i].hot ? '#ff8a80' : '#cfd8dc';
    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(heatItems[i].label, hx + 39, hy + 14);
  }

  // 3. Cash, Health & Armor Bars
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillStyle = '#38ef7d';
  ctx.fillText(`$${player.cash.toLocaleString()}`, panelX + 14, panelY + 84);

  // Health Bar
  const barX = panelX + 128;
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(barX, panelY + 69, 102, 8);
  ctx.fillStyle = '#ff4081';
  ctx.fillRect(barX, panelY + 69, 102 * Math.max(0, player.health / player.maxHealth), 8);

  // Armor Bar
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(barX + 110, panelY + 69, 102, 8);
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(barX + 110, panelY + 69, 102 * Math.max(0, player.armor / player.maxArmor), 8);

  ctx.font = 'bold 10px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ff80ab';
  ctx.fillText(`HP ${Math.round(player.health)}`, barX, panelY + 88);
  ctx.fillStyle = '#80d8ff';
  ctx.fillText(`ARMOR ${Math.round(player.armor)}`, barX + 110, panelY + 88);

  // 4. Weapon Arsenal Strip
  const weapon = WEAPON_ARSENAL[player.weaponIndex] || WEAPON_ARSENAL[0];
  const ammoCount = player.ammo[weapon.id] ?? 0;
  drawRoundedRect(ctx, panelX + 14, panelY + 98, panelW - 28, 26, 5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.fillStyle = '#ffd740';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`[1-5] ${weapon.name.toUpperCase()}`, panelX + 22, panelY + 115, 195);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${ammoCount} RDS • [LMB] FIRE`, panelX + panelW - 22, panelY + 115);

  ctx.restore();
}

export function renderCircularGpsMinimap(
  ctx,
  height,
  world,
  player,
  vehicles,
  pedestrians,
  police,
  missionDirector,
  gpsRoute,
  cameraYaw
) {
  ctx.save();
  const cx = 112;
  const cy = height - 124;
  const radius = 84;
  const scale = 0.62;

  // Outer bezel shadow & ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(7, 11, 22, 0.92)';
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = police.wantedStars > 0 ? '#ff3355' : '#00e5ff';
  ctx.stroke();

  // Clip inside radar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.translate(cx, cy);
  ctx.rotate(cameraYaw);

  const toMapX = (wx) => (wx - player.x) * scale;
  const toMapY = (wz) => -(wz - player.z) * scale;

  // Background city land
  ctx.fillStyle = '#101829';
  ctx.fillRect(-radius * 2, -radius * 2, radius * 4, radius * 4);

  // Atlantic ocean east of COASTLINE_X
  const oceanX = toMapX(COASTLINE_X);
  ctx.fillStyle = '#093b5e';
  ctx.fillRect(oceanX, -radius * 2, radius * 4, radius * 4);
  ctx.fillStyle = '#e0be78';
  ctx.fillRect(oceanX - 6, -radius * 2, 6, radius * 4);

  // Roads on minimap
  ctx.fillStyle = '#2c3548';
  for (const rx of ROAD_X_COORDS) {
    ctx.fillRect(toMapX(rx) - 6, toMapY(230), 12, 460 * scale);
  }
  for (const rz of ROAD_Z_COORDS) {
    ctx.fillRect(toMapX(-230), toMapY(rz) - 6, 350 * scale, 12);
  }

  // GPS Pink Route Line
  if (gpsRoute && gpsRoute.length >= 2) {
    ctx.beginPath();
    for (let i = 0; i < gpsRoute.length; i++) {
      const gx = toMapX(gpsRoute[i].x);
      const gy = toMapY(gpsRoute[i].z);
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.strokeStyle = '#ff2a85';
    ctx.lineWidth = 3.2;
    ctx.stroke();
  }

  // POI Blips
  for (const poi of world.pois) {
    const px = toMapX(poi.x);
    const py = toMapY(poi.z);
    ctx.fillStyle = '#38ef7d';
    ctx.beginPath();
    ctx.arc(px, py, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Traffic & Police Blips
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.hp <= 0 || v === player.inVehicle) continue;
    const vx = toMapX(v.x);
    const vy = toMapY(v.z);
    if (v.isPolice) {
      ctx.fillStyle = Math.sin(v.sirenPhase) > 0 ? '#ff3355' : '#29b6f6';
      ctx.beginPath();
      ctx.arc(vx, vy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(vx - 1.5, vy - 1.5, 3, 3);
    }
  }

  // Hostile Enforcers
  for (let i = 0; i < pedestrians.length; i++) {
    const p = pedestrians[i];
    if (!p.isHostile || p.hp <= 0) continue;
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.arc(toMapX(p.x), toMapY(p.z), 3.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Active Mission Target Blip
  const m = missionDirector.activeMission;
  if (m) {
    const mx = Math.max(-radius + 10, Math.min(radius - 10, toMapX(m.targetX)));
    const my = Math.max(-radius + 10, Math.min(radius - 10, toMapY(m.targetZ)));
    ctx.fillStyle = '#ffd740';
    ctx.beginPath();
    ctx.arc(mx, my, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();

  // Player center arrow
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(6, 7);
  ctx.lineTo(0, 4);
  ctx.lineTo(-6, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // North badge on rim
  const northAngle = -Math.PI * 0.5 + cameraYaw;
  const nx = cx + Math.cos(northAngle) * (radius - 2);
  const ny = cy + Math.sin(northAngle) * (radius - 2);
  ctx.fillStyle = '#070b16';
  ctx.beginPath();
  ctx.arc(nx, ny, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', nx, ny + 4);

  // GPS distance pill below radar
  if (m) {
    const dist = Math.round(Math.hypot(m.targetX - player.x, m.targetZ - player.z));
    drawRoundedRect(ctx, cx - 78, cy + radius + 9, 156, 20, 5);
    ctx.fillStyle = 'rgba(9, 14, 26, 0.88)';
    ctx.fill();
    ctx.fillStyle = '#ff6b9d';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`GPS ROUTE • ${dist}m`, cx, cy + radius + 23);
  }

  ctx.restore();
}

export function renderSpeedometerArcDial(ctx, width, height, player) {
  ctx.save();
  const cx = width - 118;
  const cy = height - 102;
  const r = 74;

  drawRoundedRect(ctx, width - 224, height - 192, 204, 174, 12);
  ctx.fillStyle = 'rgba(9, 14, 26, 0.85)';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = player.inVehicle ? '#ff6b9d' : '#00e5ff';
  ctx.stroke();

  if (player.inVehicle) {
    const v = player.inVehicle;
    const kmh = Math.round(Math.abs(v.speed) * 3.6);
    const maxKmh = 200;
    const frac = Math.min(1, kmh / maxKmh);

    // Background arc
    const startAng = Math.PI * 0.78;
    const endAng = Math.PI * 2.22;
    ctx.beginPath();
    ctx.arc(cx, cy + 8, r - 12, startAng, endAng);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Active neon speed arc
    ctx.beginPath();
    ctx.arc(cx, cy + 8, r - 12, startAng, startAng + (endAng - startAng) * frac);
    ctx.strokeStyle = frac > 0.7 ? '#ff2a85' : '#00e5ff';
    ctx.lineWidth = 9;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 30px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${kmh}`, cx, cy + 12);

    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`KM/H • GEAR ${Math.max(1, Math.min(6, Math.ceil(kmh / 32)))}`, cx, cy + 28);

    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffd740';
    ctx.fillText(v.name.toUpperCase(), cx, cy + 52);

    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#b0bec5';
    ctx.fillText('[F] EXIT CAR • [SPACE] DRIFT', cx, cy + 68);
  } else {
    // On-Foot Combat & Arsenal Card
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('ON-FOOT COMBAT RIG', cx, height - 168);

    for (let i = 0; i < WEAPON_ARSENAL.length; i++) {
      const w = WEAPON_ARSENAL[i];
      const active = i === player.weaponIndex;
      const wy = height - 152 + i * 24;
      drawRoundedRect(ctx, width - 210, wy, 176, 20, 4);
      ctx.fillStyle = active ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.font = active ? 'bold 11px "Segoe UI", sans-serif' : '11px "Segoe UI", sans-serif';
      ctx.fillStyle = active ? '#ffd740' : '#cfd8dc';
      ctx.fillText(`[${w.slot}] ${w.name}`, width - 202, wy + 14);
      ctx.textAlign = 'right';
      ctx.fillText(`${player.ammo[w.id] ?? 0}`, width - 42, wy + 14);
    }

    ctx.textAlign = 'center';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ff6b9d';
    ctx.fillText('[F] HIJACK CAR • [LMB] FIRE', cx, height - 22);
  }

  ctx.restore();
}

export function renderMissionDialogueAndBanner(ctx, width, height, missionDirector) {
  ctx.save();
  const m = missionDirector.activeMission;
  if (!m) {
    ctx.restore();
    return;
  }

  const boxW = 610;
  const boxX = 222;
  const boxY = height - 94;

  // Story dialogue & objective container
  drawRoundedRect(ctx, boxX, boxY, boxW, 76, 10);
  ctx.fillStyle = 'rgba(8, 13, 25, 0.9)';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#ffd740';
  ctx.stroke();

  // Speaker tag pill
  drawRoundedRect(ctx, boxX + 12, boxY + 10, 122, 22, 5);
  ctx.fillStyle = '#ff2a85';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(m.speaker.toUpperCase(), boxX + 73, boxY + 25);

  // Spoken dialogue line
  ctx.textAlign = 'left';
  ctx.font = '12px "Segoe UI", sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(`"${m.dialogue}"`, boxX + 144, boxY + 25, boxW - 156);

  // Divider
  ctx.fillStyle = 'rgba(255, 215, 64, 0.25)';
  ctx.fillRect(boxX + 12, boxY + 38, boxW - 24, 1);

  // Gold Mission Objective Bar
  let objText = `MISSION ${m.index}/12 (${m.title}): ${m.objective}`;
  if (m.combatCount > 0) {
    objText = `MISSION ${m.index}/12: ${m.title} — ELIMINATE ENFORCERS (${missionDirector.enforcersEliminated}/${m.combatCount}) & HIJACK COUPE`;
  }
  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffd740';
  ctx.fillText(objText, boxX + 12, boxY + 58, boxW - 24);

  // Interactive POI prompt or completion banner
  const centerBannerX = boxX + boxW * 0.5;
  if (missionDirector.nearbyPoi) {
    drawRoundedRect(ctx, boxX + 60, boxY - 34, boxW - 120, 28, 6);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.92)';
    ctx.fill();
    ctx.fillStyle = '#070b14';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(missionDirector.nearbyPoi.prompt, centerBannerX, boxY - 16, boxW - 136);
  } else if (missionDirector.bannerTimer > 0 && missionDirector.bannerText) {
    drawRoundedRect(ctx, boxX + 60, boxY - 34, boxW - 120, 28, 6);
    ctx.fillStyle = 'rgba(56, 239, 125, 0.92)';
    ctx.fill();
    ctx.fillStyle = '#070b14';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(missionDirector.bannerText, centerBannerX, boxY - 16, boxW - 136);
  }

  ctx.restore();
}

export function renderStartAndPauseOverlays(ctx, width, height, uiState, missionDirector) {
  if (!uiState.showStartOverlay && !uiState.showMissionMenu) return;

  ctx.save();

  if (uiState.showStartOverlay) {
    // Sleek left-docked Start / Save / Controls Command Card so the live 3D open world remains 100% visible!
    const cardX = 20;
    const cardY = 112;
    const cardW = 342;
    const cardH = 424;

    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 12);
    ctx.fillStyle = 'rgba(8, 13, 26, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff2a85';
    ctx.stroke();

    // Header badge
    drawRoundedRect(ctx, cardX + 14, cardY + 14, cardW - 28, 56, 8);
    ctx.fillStyle = 'rgba(255, 42, 133, 0.18)';
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SOLMAR COAST', cardX + 24, cardY + 38);

    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('NEON SYNDICATE • 3D WEBGL2 OPEN WORLD', cardX + 24, cardY + 58);

    const buttons = [
      { key: '[ENTER / CLICK]', label: 'PLAY / RESUME LIVE WORLD', color: '#38ef7d' },
      { key: '[F5]', label: `QUICK SAVE (${missionDirector.lastSavedTimestamp})`, color: '#00e5ff' },
      { key: '[F9]', label: 'LOAD SAVED PROGRESSION', color: '#ffd740' },
      { key: '[M]', label: 'MISSION SELECT (12 MISSIONS)', color: '#ff6b9d' },
    ];

    for (let i = 0; i < buttons.length; i++) {
      const by = cardY + 82 + i * 40;
      drawRoundedRect(ctx, cardX + 14, by, cardW - 28, 33, 6);
      ctx.fillStyle = i === 0 ? 'rgba(56, 239, 125, 0.2)' : 'rgba(255, 255, 255, 0.07)';
      ctx.fill();
      ctx.strokeStyle = buttons[i].color;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.fillStyle = buttons[i].color;
      ctx.fillText(buttons[i].key, cardX + 24, by + 21);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(buttons[i].label, cardX + 124, by + 21);
    }

    // Controls Reference Box
    const ctrlY = cardY + 250;
    drawRoundedRect(ctx, cardX + 14, ctrlY, cardW - 28, 160, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();

    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffd740';
    ctx.fillText('OPEN-WORLD CONTROLS & SYSTEMS', cardX + 24, ctrlY + 20);

    const controls = [
      ['WASD / ARROWS', 'Drive Vehicle / Walk & Strafe'],
      ['F KEY', 'Hijack Any Car / Exit Vehicle'],
      ['MOUSE + LMB', 'Aim Crosshair & Fire Weapon'],
      ['1-5 / Q, E', 'Switch Pistol, SMG, Carbine, Shotgun'],
      ['SPACEBAR', 'Handbrake Power-Drift / Sprint'],
      ['E KEY / R KEY', 'Safehouse & Shops / Synth Radio'],
    ];
    ctx.font = '11px "Segoe UI", sans-serif';
    for (let i = 0; i < controls.length; i++) {
      const ry = ctrlY + 42 + i * 20;
      ctx.fillStyle = '#00e5ff';
      ctx.fillText(controls[i][0], cardX + 24, ry);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(controls[i][1], cardX + 132, ry);
    }
  }

  if (uiState.showMissionMenu) {
    const mw = 540;
    const mh = 430;
    const mx = (width - mw) * 0.5;
    const my = (height - mh) * 0.5;

    drawRoundedRect(ctx, mx, my, mw, mh, 12);
    ctx.fillStyle = 'rgba(7, 11, 22, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYNDICATE OF SOLMAR — 12-MISSION CAMPAIGN SELECT [M TO CLOSE]', width * 0.5, my + 32);

    ctx.textAlign = 'left';
    for (let i = 0; i < SYNDICATE_MISSIONS.length; i++) {
      const m = SYNDICATE_MISSIONS[i];
      const ry = my + 52 + i * 30;
      const active = i === missionDirector.currentMissionIndex;
      drawRoundedRect(ctx, mx + 18, ry, mw - 36, 25, 5);
      ctx.fillStyle = active ? 'rgba(255, 42, 133, 0.28)' : 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.fillStyle = active ? '#ffd740' : '#00e5ff';
      ctx.fillText(`[${i + 1}] DAY ${m.day} • ${m.title} (${m.district})`, mx + 28, ry + 16);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#38ef7d';
      ctx.fillText(`$${m.rewardCash.toLocaleString()}`, mx + mw - 28, ry + 16);
      ctx.textAlign = 'left';
    }
  }

  ctx.restore();
}

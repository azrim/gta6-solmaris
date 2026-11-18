# Solmar Coast: Neon Syndicate

[![Make GTA 6](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/azrim/gta6-solmaris/rank.svg)](https://make.fun/bounty/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/azrim/gta6-solmaris/reward.svg)](https://make.fun/bounty/gta6-01)

An original custom WebGL2 3D open-world crime game built for the [Make GTA 6 (`gta6-01`) bounty on make.fun](https://make.fun/bounty/gta6-01).

## Overview

Explore the sun-drenched coastal metropolis of **Solmar Coast** across four distinct districts (**Praia Solmar**, **Downtown Glassline**, **Saltworks Harbor**, and **Cerro Alto**):

- **Custom WebGL2 3D Engine (`game/src/render3d.js`)**: Real-time third-person perspective follow camera, directional golden-hour lighting, ground shadow quads, reflective ocean water with sunset shimmer, palm-lined coastal boardwalks, glass high-rises with emissive windows, harbor cranes, traffic signal intersections, and articulated 3D vehicles, helicopters, and characters.
- **Vehicles & Traffic (`game/src/entities.js`)**: 6 distinct 3D vehicle classes (Sports Coupe, Police Cruiser with animated red/blue strobe lightbar, Muscle Car, Harbor Van, Street Moto, and Police Helicopter with volumetric ground spotlight), intersection traffic AI, pedestrians, and instant `[F]` vehicle hijacking/exit.
- **5-Star Wanted & Heat System (`game/src/police.js`)**: Line-of-sight (`IN SIGHT`) detection vs cooldown evasion timer, tactical police intercepts, 3+ star overhead chopper spotlight tracking, and `FACE` / `OUTFIT` / `CAR` / `CCTV` heat counters with safehouse wardrobe and mod-shop respray evasion.
- **3-Day Storyline (`game/src/missions.js`)**: 12 syndicate missions across Solmar Coast with branching dialogues, GPS route guidance, syndicate reputation, weapon shops, safehouses, and `localStorage` save/load + mission selector.
- **Procedural WebAudio (`game/src/audio.js`)**: Real-time engine RPM synthesizer, tire screech, police sirens, weapon fire, and 3 procedural synth radio stations (`Solmar FM`, `Glassline Synth`, `Harbor Bass`).

## Run Locally

```bash
node serve.ts
```

Build the output dossier:

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---
Built for [make.fun](https://make.fun/bounty/gta6-01?ref=05xv4825) (`ref=05xv4825`).

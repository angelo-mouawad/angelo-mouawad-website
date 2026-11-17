# Credits

Every third party asset used in the room, with its author, source and licence.
All files in `public/models`, `public/textures` and `public/hdri` are compressed copies made by `scripts/assets.mjs`.

## Models from Poly Haven (CC0)

Poly Haven assets are public domain ([CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)). No attribution is required, it is given here anyway.

| File | Asset | Author | Source |
|---|---|---|---|
| `binder_notebook.glb` | Binder Notebook | DaDrood | https://polyhaven.com/a/binder_notebook |
| `office_notepads.glb` | Office Notepads | Ulan Cabanilla | https://polyhaven.com/a/office_notepads |
| `book_encyclopedia_set_01.glb` | Book Encyclopedia Set 01 | John Malcolm | https://polyhaven.com/a/book_encyclopedia_set_01 |
| `desk_lamp_arm_01.glb` | Desk Lamp Arm 01 | Yann Kervran, Kuutti Siitonen | https://polyhaven.com/a/desk_lamp_arm_01 |
| `modern_wooden_cabinet.glb` | Modern Wooden Cabinet | Patrik Pangerl | https://polyhaven.com/a/modern_wooden_cabinet |
| `potted_plant_01.glb` | Potted Plant 01 | Rico Cilliers | https://polyhaven.com/a/potted_plant_01 |
| `potted_plant_02.glb` | Potted Plant 02 | Rico Cilliers | https://polyhaven.com/a/potted_plant_02 |
| `potted_plant_04.glb` | Potted Plant 04 | James Ray Cock | https://polyhaven.com/a/potted_plant_04 |
| `wall_clock.glb` | Wall Clock | PierreB3D | https://polyhaven.com/a/wall_clock |
| `camera_01.glb` | Camera 01 | Rajil Jose Macatangay | https://polyhaven.com/a/Camera_01 |
| `gamepad.glb` | Gamepad | Josh Dean | https://polyhaven.com/a/gamepad |
| `football.glb` | Football | Amal Kumar | https://polyhaven.com/a/football |

## Models from Sketchfab (CC BY 4.0)

Reused from the previous version of the site. Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), which requires this attribution. Each model was recompressed and its textures resized.

| File | Asset | Author | Source |
|---|---|---|---|
| `gaming_chair.glb` | Gaming Chair | [9arts](https://sketchfab.com/9arts) | https://sketchfab.com/3d-models/gaming-chair-6ca81f60846648609b4208c9e7f31b14 |
| `gaming_mouse.glb` | Gaming Mouse | [attix84work](https://sketchfab.com/attix84work) | https://sketchfab.com/3d-models/gaming-mouse-5847669dfe3d4ba8b59e69dc64bc09c1 |
| `classic_ps5.glb` | classic ps5 | [jei3323](https://sketchfab.com/jei3323) | https://sketchfab.com/3d-models/classic-ps5-cb2aa3e4390047aeac70253960bbc7b3 |
| `cameraman_backpack.glb` | Cameraman Backpack | [QuickDriftVR](https://sketchfab.com/QuickDriftVR) | https://sketchfab.com/3d-models/cameraman-backpack-64a48b2f2e3445a0a13cfea3560fbc6c |

## Model from Poly Pizza (CC BY 3.0)

Licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), which requires this attribution. The glass and the red parts were given new materials in code.

| Model | Author | Source |
|---|---|---|
| Gaming Computer | Alex Safayan | [poly.pizza/m/5cN7W4ufoII](https://poly.pizza/m/5cN7W4ufoII) |

## Textures from Poly Haven (CC0)

| Files | Asset | Author | Source |
|---|---|---|---|
| `herringbone_parquet_*.webp` | Herringbone Parquet | Jenelle van Heerden, Sergej Majboroda | https://polyhaven.com/a/herringbone_parquet |
| `painted_plaster_wall_*.webp` | Painted Plaster Wall | Amal Kumar | https://polyhaven.com/a/painted_plaster_wall |
| `walnut_veneer_*.webp` | Walnut Veneer | Jenelle van Heerden | https://polyhaven.com/a/walnut_veneer |
| `brown_leather_*.webp` | Brown Leather | Rob Tuytel | https://polyhaven.com/a/brown_leather |
| `cotton_jersey_*.webp` | Cotton Jersey | colormass, Rico Cilliers | https://polyhaven.com/a/cotton_jersey |

## Environment lighting from Poly Haven (CC0)

| File | Asset | Author | Source |
|---|---|---|---|
| `shanghai_bund_1k.hdr` | Shanghai Bund | Greg Zaal | https://polyhaven.com/a/shanghai_bund |

## Made in code

The desk, monitor, keyboard, PC tower, mini fridge, mug, shelves, window, blinds, Bible and its stand, poster, TV, corner light, rug pattern and the city outside the window are built in code and have no external source.

## Not carried over from the old site

- `banana_plant.glb` is under the Sketchfab Standard licence, not a Creative Commons one, so it was left out.
- `desk_lamp.glb`, `plant.glb`, `ceiling_light_round.glb` and `low_poly_cartoon_football_ball_free.glb` were replaced by Poly Haven models.
- `gaming_pc.glb` and `mini_fridge.glb` were replaced by versions built in code.

## Fonts

Archivo, Sora, Inter and JetBrains Mono, all under the SIL Open Font License, loaded through `next/font`.

## Bible text

King James Version, public domain. The JSON files in `public/bible-data/kjv` come from the Lamp project, built from [thiagobodruk/bible](https://github.com/thiagobodruk/bible).

## Components

| Used in | Component | Source |
|---|---|---|
| Monitor scene | Contribution skyline | Supplied by Angelo in `imported_components/git_contributions.tsx` |
| Monitor scene | Scroll velocity marquee | [React Bits](https://reactbits.dev) |
| /websites | Laptop that opens on scroll | Aceternity UI, supplied in `imported_components/macbook-scroll.tsx` |
| /websites | Interactive slat background | Supplied in `imported_components/micro_slats.tsx` |
| /notes | Glass folder cards | Supplied in `imported_components/folder_cards.tsx` |
| Docks | Magnifying dock | Rebuilt for this site after Aceternity UI's floating dock |

Icons are from [Lucide](https://lucide.dev) and [Tabler Icons](https://tabler.io/icons). The GitHub and LinkedIn marks are drawn from the brands' own logos.

## Data

GitHub contribution counts are fetched by `scripts/contributions.mjs` from the public [github-contributions-api](https://github.com/grubersjoe/github-contributions-api).

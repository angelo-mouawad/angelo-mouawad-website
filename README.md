# Angelo Mouawad Personal Portfolio

A cinematic, scroll-driven portfolio website built with Three.js. The experience opens inside a photorealistic 3D bedroom workspace at night, dollies toward the desk as you scroll, and dives *through* the monitor screen into a digital world where the portfolio content lives.

**Live site:** [angelomouawad.com](https://angelomouawad.com)

---

## Overview

The site is a single continuous camera move split into two acts, driven entirely by scroll position.

**Act I The Room.** A physically lit night scene: a desk setup with monitor, PC, keyboard, mouse and speakers, a window with venetian blinds looking onto a blurred city skyline, a wall-mounted TV running a console interface, shelves, plants, a mini fridge and a PS5. Warm LED strips and a ceiling fixture light the room while a spotlight casts real blind-striped shadows across the floor. As the camera approaches, the desk chair swivels and docks itself at the desk.

**Act II The Digital World.** After passing through the monitor glass, the camera flies through a particle tunnel past holographic project capsules, a pulsing network-node field, the socials section, and a final pull-back shot.

## Features

- Scroll-scrubbed camera on a Catmull-Rom spline with eased momentum
- Seamless screen-dive transition, the monitor renders the same hero layout you land on, so the scene swap is invisible
- Real-time lighting: PMREM environment reflections, shadow-casting spotlight through the window, volumetric light shafts, animated candle and TV flicker
- 12 GLB props auto-normalized at load (scaled, centered, seated on their surface)
- Procedurally generated textures, the city skyline, screen UIs, chalk-drawn code, wood, rug and posters are all drawn to canvas at runtime, no image files needed
- Mouse parallax; the football on the rug spins to follow the cursor
- Optional ambient room tone (filtered brown noise, generated with the Web Audio API)
- Mobile fallback: reduced particle counts, shadows and antialiasing disabled, lower pixel ratio
- Respects `prefers-reduced-motion`

## Tech Stack

| | |
|---|---|
| **3D** | Three.js r128, GLTFLoader |
| **Animation** | GSAP 3.12.5 + ScrollTrigger |
| **Typography** | Archivo, Archivo Black, JetBrains Mono |
| **Audio** | Web Audio API |
| **Hosting** | GitHub Pages |

No build step, no bundler, no framework. The site is plain HTML, CSS and JavaScript.

## Project Structure

```
.
├── index.html      # entire site, markup, styles, scene code
├── CNAME           # custom domain for GitHub Pages
└── objects/        # GLB models loaded at runtime
    ├── gaming_chair.glb
    ├── gaming_pc.glb
    ├── gaming_mouse.glb
    ├── gaming_laptop.glb
    ├── desk_lamp.glb
    ├── mini_fridge.glb
    ├── classic_ps5.glb
    ├── cameraman_backpack.glb
    ├── ceiling_light_round.glb
    ├── plant.glb
    ├── banana_plant.glb
    └── low_poly_cartoon_football_ball_free.glb
```

## Running Locally

The models are fetched at runtime, so the page needs to be served over HTTP — opening `index.html` directly from the filesystem will load the page but not the props.

```bash
git clone https://github.com/angelo-mouawad/angelo-mouawad-website.git
cd angelo-mouawad-website
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Any static server works, `npx serve`, VS Code's Live Server extension, etc.

## How It Works

### Scroll Timeline

A tall spacer element (`#scrollSpace`, 1500vh) provides scroll distance. ScrollTrigger maps the page's scroll position to a normalized progress value `0 → 1`, which is smoothed each frame for momentum. Every animation reads from that single value:

| Progress | Section |
|---|---|
| `0.00 – 0.30` | The Room, camera dollies toward the desk |
| `0.30` | Screen dive, flash transition, scene swap |
| `0.33 – 0.46` | Hero |
| `0.45 – 0.53` | Tunnel dive |
| `0.53 – 0.79` | Projects (Alpha, Beta, Gamma) |
| `0.79 – 0.85` | Network transition |
| `0.85 – 0.93` | Socials |
| `0.93 – 1.00` | Ending |

The two acts are separate `THREE.Scene` objects sharing one camera. Only one renders per frame, so the off-screen act costs nothing.

### Loading Models

Props are declared in a filename map and placed with a single helper:

```js
placeGLB('gaming_chair', { pos: [-.46, 0, -.98], height: 1.46, rotY: .35 });
```

Each model is fetched once, cached, and cloned for repeat instances (the small plant appears five times from one download). On load it's scaled to a target height in metres, centered horizontally, and seated so its base rests exactly on the floor, desk or shelf, with `topAlign` and `centerPivot` options for ceiling-mounted and free-spinning objects.

### Adding or Swapping a Prop

1. Drop the `.glb` into `objects/`
2. Add an entry to `MODEL_FILES` in `index.html`
3. Call `placeGLB()` with a position and height

## Performance

- Targets 60 FPS on modern hardware
- `index.html` is ~144 KB, so the page and loading screen appear immediately while models stream in
- Models are cached separately by the browser, so code changes don't force a re-download
- Instanced geometry for the keyboard keycaps; shared materials across repeated props

## Credits

3D models sourced from Sketchfab under their respective licenses. Fonts from Google Fonts. Three.js and GSAP via cdnjs.

## License

The source code in this repository is available for reference and learning. The 3D models in `objects/` remain under their original licenses. Please don't republish the site as your own portfolio.

---

Built by **Angelo Mouawad**, Computer Science Student.

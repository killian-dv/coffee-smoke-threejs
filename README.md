# Coffee Smoke — Three.js Journey

Quick recap of the **Coffee Smoke** lesson from [Three.js Journey](https://threejs-journey.com/) by Bruno Simon.

## What this project covers

This project shows how to **fake volumetric-looking smoke** with a **single textured plane** and a **full custom shader pair** (`ShaderMaterial`). Instead of simulating real volume or particles, you drive **vertex displacement** and **fragment alpha** from a **Perlin noise texture** and time so the card reads as soft, drifting steam above a cup.

- **`ShaderMaterial`** with external **`.glsl`** files (via **Vite** + **`vite-plugin-glsl`**) keeps the pipeline simple: you own the vertex and fragment stages end to end.
- The **vertex shader** twists the plane in **XZ** using noise sampled along height, then adds a **wind offset** that grows toward the top of the quad (`pow(uv.y, 3.0)`), so the base stays steadier than the tip.
- The **fragment shader** scrolls UVs over the same noise, **remaps** values with **`smoothstep`**, and **masks** the edges so the rectangle disappears into the scene instead of showing a hard quad.
- **Transparency** is handled with **`transparent: true`**, **`depthWrite: false`**, and alpha in **`gl_FragColor`**, which avoids harsh sorting artifacts typical of additive-only hacks.
- The scene still uses a **baked GLTF** (`bakedModel.glb`) for context; **`OrbitControls`** and a **`Clock`** drive inspection and **`uTime`**.

## What I built

- Loaded **`bakedModel.glb`** with **`GLTFLoader`** and tweaked **anisotropy** on the baked mesh’s **`map`** for sharper texture filtering when viewed at a grazing angle.
- Created a **subdivided plane** (`PlaneGeometry` with segments), **translated** so the pivot sits at the bottom edge, **scaled** into a tall strip, and placed it as **`smokeMesh`** above the model.
- **`ShaderMaterial`** with uniforms **`uPerlinTexture`** and **`uTime`**, **`DoubleSide`**, and GLSL imported from **`vertex.glsl`** / **`fragment.glsl`**.
- **`rotate2D`** helper in a shared include (`includes/rotate2D.glsl`) included from the vertex shader for the twist.
- **Perlin texture** with **`RepeatWrapping`** so scrolling and sampling stay continuous.
- **Fragment shader** ends with Three’s **`tonemapping_fragment`** and **`colorspace_fragment`** includes so output matches the renderer’s color pipeline.

## What I learned

### 1) Smoke as a 2D card + noise, not geometry

- Convincing “smoke” often means **one or few planes** plus **procedural-looking motion** from a **noise map** and **time**, not modeling volume. The lesson is about **art direction** (masking, alpha falloff) as much as math.

### 2) Vertex stage: twist + wind

- **Twist**: sample noise with **`uv.y`** (and time), map to an **angle**, rotate **`position.xz`** with a **2D rotation matrix** so each horizontal slice spins differently along the height of the quad.
- **Wind**: two noise lookups give a **2D offset**; multiplying by **`pow(uv.y, k)`** keeps the bottom anchored and makes the motion read as **rising** steam.

### 3) Fragment stage: scroll, threshold, and edge fade

- **Scrolling UVs** (e.g. along **`vUv.y`**) makes the pattern drift upward.
- **`smoothstep`** turns soft noise into a **cleaner silhouette** and controls how “thick” the smoke reads.
- **Per-edge `smoothstep`** on **`vUv`** removes the **quad outline** so only the smoke puff is visible.

### 4) Transparency and depth

- For overlapping transparent planes, **`depthWrite: false`** is a common choice so **near/far layers** blend more predictably; you trade some depth precision for a softer look.
- **`DoubleSide`** avoids the plane disappearing when the camera crosses its plane during **orbit** navigation.

### 5) Modular GLSL with Vite

- **`#include`** (via **`vite-plugin-glsl`**) lets you **reuse** small functions like **`rotate2D`** across shaders without copy-paste, similar in spirit to Three’s chunk includes on built-in materials.

## Run the project

```bash
npm install
npm run dev
```

## Credits

Part of the **Three.js Journey** course by Bruno Simon.

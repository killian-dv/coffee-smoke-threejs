import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import smokeFragmentShader from "./shaders/coffee-smoke/fragment.glsl?raw";
import smokeVertexShader from "./shaders/coffee-smoke/vertex.glsl?raw";
import "./style.css";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl")!;

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 8;
camera.position.y = 10;
camera.position.z = 12;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Model
 */
gltfLoader.load("./bakedModel.glb", (gltf) => {
  const baked = gltf.scene.getObjectByName("baked");
  if (baked instanceof THREE.Mesh) {
    baked.material.map.anisotropy = 8;
  }
  scene.add(gltf.scene);
});

/**
 * Smoke
 */
// Geometry
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(1.5, 6, 1.5);

// Perlin texture
const perlinTexture = textureLoader.load("./perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

// Material
const smokeMaterial = new THREE.ShaderMaterial({
  wireframe: true,
  transparent: true,
  vertexShader: smokeVertexShader,
  fragmentShader: smokeFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uPerlinTexture: new THREE.Uniform(perlinTexture),
    uTime: new THREE.Uniform(0),
  },
});

// Mesh
const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial);
smokeMesh.position.y = 1.83;
scene.add(smokeMesh);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  smokeMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

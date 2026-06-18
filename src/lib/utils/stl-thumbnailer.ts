import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

/**
 * Generates a high-quality base64 PNG thumbnail from an STL file's ArrayBuffer.
 * Renders the 3D model in a brand-themed aesthetic using an offscreen canvas.
 */
export function generateStlThumbnail(arrayBuffer: ArrayBuffer): string {
  if (typeof window === "undefined") return "";

  // 1. Create offscreen canvas and renderer
  const width = 256;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false, // Render with solid background color for studio contrast
    preserveDrawingBuffer: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0xf3f4f6, 1); // Premium studio off-white background

  // 2. Create Scene
  const scene = new THREE.Scene();

  // 3. Create Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

  // 4. Parse STL Geometry
  const loader = new STLLoader();
  let geometry: THREE.BufferGeometry;
  try {
    geometry = loader.parse(arrayBuffer);
  } catch (err) {
    console.error("Failed to parse STL for thumbnail:", err);
    renderer.dispose();
    return "";
  }

  // 5. Center and size the geometry
  geometry.center();
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox!;
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  let maxDim = Math.max(size.x, size.y, size.z);
  if (isNaN(maxDim) || maxDim <= 0) {
    maxDim = 100; // safe fallback dimension
  }

  // 6. Create Mesh with brand-themed premium material (Primary Purple theme)
  const material = new THREE.MeshStandardMaterial({
    color: 0x6d5cff, // GMK Brand Primary Color
    roughness: 0.3,
    metalness: 0.1,
    flatShading: true, // Flat shading gives STL facets a premium look
    side: THREE.DoubleSide, // Ensure all facets render regardless of winding direction
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // 7. Position lights for nice 3D shadows and highlights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight1.position.set(1, 1, 1).normalize();
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x6d5cff, 0.2); // Brand tint fill light
  dirLight2.position.set(-1, -1, 0.5).normalize();
  scene.add(dirLight2);

  // Add camera headlight so the front-facing surfaces are always illuminated
  const headlight = new THREE.DirectionalLight(0xffffff, 0.4);
  camera.add(headlight);
  scene.add(camera);

  // 8. Position camera to view model diagonally
  // Calculate camera distance to fit maxDim
  const fovRad = camera.fov * (Math.PI / 180);
  let cameraDist = Math.abs(maxDim / 2 / Math.tan(fovRad / 2));
  cameraDist *= 1.45; // Add padding so it fits comfortably

  // Set position at an angle (diagonal isometric-like perspective)
  camera.position.set(cameraDist * 0.7, cameraDist * 0.6, cameraDist * 0.8);
  camera.lookAt(0, 0, 0);

  // 9. Render and extract image
  renderer.render(scene, camera);
  const dataUrl = canvas.toDataURL("image/png");

  // 10. Clean up WebGL resources
  geometry.dispose();
  material.dispose();
  renderer.dispose();

  return dataUrl;
}

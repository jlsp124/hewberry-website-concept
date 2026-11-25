import {
  ACESFilmicToneMapping, AmbientLight, CanvasTexture, DirectionalLight, Group,
  HemisphereLight, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function rounded(width: number, height: number, depth: number, radius: number, material: MeshStandardMaterial) {
  const mesh = new Mesh(new RoundedBoxGeometry(width, height, depth, 4, radius), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function hubMark() {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#5f6781';
    context.font = '600 72px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Ajax', 160, 66);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createHubModel(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!context) return null;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const environment = new RoomEnvironment();
  const radiance = new PMREMGenerator(renderer);
  const reflections = radiance.fromScene(environment, .025, .1, 40, { size: 96 });
  scene.environment = reflections.texture;
  scene.environmentIntensity = .74;
  environment.dispose();
  radiance.dispose();

  scene.add(new AmbientLight('#e8edff', .3));
  scene.add(new HemisphereLight('#e4eaff', '#263452', 1.3));
  const key = new DirectionalLight('#fef7ed', 2.35);
  key.position.set(-3.3, 4.2, 4.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.normalBias = .015;
  key.shadow.bias = -.0004;
  scene.add(key);
  const edge = new DirectionalLight('#7898f0', 2.45);
  edge.position.set(3.1, 1.9, -2.0);
  scene.add(edge);

  const hub = new Group();
  hub.position.y = -.03;
  const shell = new MeshPhysicalMaterial({ color: '#e6ebf4', roughness: .27, metalness: .07, clearcoat: .38, clearcoatRoughness: .23 });
  const outer = new MeshStandardMaterial({ color: '#9da8c1', roughness: .41 });
  const seam = new MeshStandardMaterial({ color: '#2d3b64', roughness: .55 });
  const back = rounded(1.94, 1.94, .21, .14, outer);
  const joint = rounded(1.98, 1.98, .104, .086, seam);
  const face = rounded(2.05, 2.05, .19, .095, shell);
  joint.position.z = .061;
  face.position.z = .143;
  const mark = new Mesh(new PlaneGeometry(.437, .176),
    new MeshBasicMaterial({ map: hubMark(), transparent: true, depthWrite: false, toneMapped: false }));
  mark.position.z = .244;
  hub.add(back, joint, face, mark);
  scene.add(hub);

  const platform = rounded(7.5, .085, 4.2, .018, new MeshStandardMaterial({ color: '#28355d', roughness: .64 }));
  platform.position.set(0, -1.05, 0);
  scene.add(platform);

  const camera = new PerspectiveCamera(35, 1, .1, 28);
  let distance = 5.25;
  let sized = false;
  function size(width: number, height: number) {
    if (!width || !height) return;
    camera.aspect = width / height;
    const horizontal = 2 * Math.tan(camera.fov * Math.PI / 360) * camera.aspect;
    distance = Math.max(5.25, 2.92 / horizontal);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    sized = true;
  }

  function render(phase: number, pointerX: number, pointerY: number) {
    if (!sized) return;
    hub.rotation.set(-.13 + phase * .16 - pointerY * .12,
      -.61 + phase * .83 + pointerX * .18, .11 - phase * .17);
    camera.position.set(.38 * (1 - phase) + pointerX * .15, .73 + pointerY * .17, distance - phase * .3);
    camera.lookAt(0, -.06, .02);
    key.position.x = -3.3 + pointerX * 2.2 + phase * .66;
    key.position.y = 4.2 - pointerY * 1.2;
    renderer.render(scene, camera);
  }

  return { size, render };
}

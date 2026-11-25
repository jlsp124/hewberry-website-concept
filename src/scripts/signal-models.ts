import {
  ACESFilmicToneMapping, AmbientLight, CanvasTexture, Color, DirectionalLight, Group,
  HemisphereLight, LatheGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PCFShadowMap,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, RingGeometry, Scene, SpotLight, SRGBColorSpace,
  TextureLoader, Vector2, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { route } from '../lib/site';

function smoothRange(from: number, to: number, value: number) {
  const fraction = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return fraction * fraction * (3 - 2 * fraction);
}

function rounded(width: number, height: number, depth: number, radius: number, material: MeshStandardMaterial) {
  const mesh = new Mesh(new RoundedBoxGeometry(width, height, depth, 3, radius), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sensor(radius: number, length: number, material: MeshStandardMaterial) {
  const half = length / 2;
  const edge = radius * .24;
  const profile = [
    [0, -half], [radius - edge, -half], [radius - edge * .28, -half + edge * .23],
    [radius, -half + edge], [radius, half - edge], [radius - edge * .28, half - edge * .23],
    [radius - edge, half], [0, half],
  ];
  const device = new Mesh(new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), 34), material);
  device.castShadow = true;
  return device;
}

function pulseRings() {
  const pulse = new Group();
  const rings = Array.from({ length: 3 }, (_, index) => {
    const material = new MeshBasicMaterial({ color: '#ffa78d', transparent: true, opacity: 0, depthWrite: false });
    const radius = .36 + index * .21;
    const ring = new Mesh(new RingGeometry(radius - .006, radius, 72), material);
    ring.renderOrder = 3;
    pulse.add(ring);
    return ring;
  });
  return { pulse, rings };
}

function makeDoor(onTextureReady: () => void) {
  const root = new Group();
  const enamel = new MeshStandardMaterial({ color: '#e6e4d9', roughness: .27, metalness: .04 });
  const edge = new MeshStandardMaterial({ color: '#b3b7aa', roughness: .38 });
  const rail = new MeshStandardMaterial({ color: '#232926', roughness: .53 });
  const wall = new MeshStandardMaterial({ color: '#353832', roughness: .8 });
  const bronze = new MeshStandardMaterial({ color: '#b69a76', roughness: .31, metalness: .68 });
  const paintedOak = new MeshStandardMaterial({ color: '#726158', roughness: .67 });
  new TextureLoader().load(route('images/story/oak.webp'), (texture) => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    paintedOak.map = texture;
    paintedOak.needsUpdate = true;
    onTextureReady();
  });

  const plaster = rounded(1.52, 4.75, .38, .028, wall);
  plaster.position.set(-1.35, .05, -.27);
  root.add(plaster);

  const jamb = rounded(.47, 4.75, .41, .025, paintedOak);
  jamb.position.set(-.62, .05, -.03);
  const inner = rounded(.115, 4.7, .24, .012, rail);
  inner.position.set(-.39, .05, -.055);
  root.add(jamb, inner);

  const fixedContact = sensor(.103, .84, enamel);
  fixedContact.position.set(-.543, .66, .229);
  const contactBase = rounded(.16, .79, .083, .041, edge);
  contactBase.position.set(-.543, .66, .173);
  root.add(contactBase, fixedContact);

  const hinge = new Group();
  hinge.position.set(1.73, .05, -.09);
  root.add(hinge);
  const doorSkin = rounded(2.04, 4.55, .24, .031, paintedOak);
  doorSkin.position.x = -1.02;
  const doorLip = rounded(.042, 4.51, .23, .009, rail);
  doorLip.position.set(-2.027, 0, -.028);
  hinge.add(doorSkin, doorLip);

  for (const x of [-1.84, -1.47, -1.1, -.73, -.36]) {
    const seam = rounded(.012, 4.44, .012, .004, rail);
    seam.position.set(x, 0, .121);
    hinge.add(seam);
  }

  const magnet = sensor(.085, .784, enamel);
  magnet.position.set(-1.953, .61, .229);
  const magnetBase = rounded(.128, .74, .08, .035, edge);
  magnetBase.position.set(-1.953, .61, .157);
  const plate = rounded(.178, .31, .034, .018, bronze);
  plate.position.set(-1.8, -.57, .14);
  const lever = rounded(.32, .065, .075, .025, bronze);
  lever.position.set(-1.7, -.54, .193);
  hinge.add(magnetBase, magnet, plate, lever);

  const led = new MeshStandardMaterial({ color: '#e0d9c6', emissive: '#fca68a', emissiveIntensity: .12 });
  const indicator = rounded(.048, .013, .015, .006, led);
  indicator.castShadow = false;
  indicator.position.set(-.543, .915, .33);
  root.add(indicator);

  const signal = pulseRings();
  signal.pulse.position.set(-.541, .68, .345);
  root.add(signal.pulse);
  return { root, hinge, led, signal };
}

function hubMark() {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#686f65';
    context.font = '600 69px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Ajax', 160, 65);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function windowLight() {
  const light = new SpotLight('#ffd8b3', 30, 14, .57, .78);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 192;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#302820';
    context.fillRect(0, 0, 192, 192);
    context.translate(96, 96);
    context.rotate(-.32);
    for (let y = -142; y < 155; y += 22) {
      const stripe = context.createLinearGradient(0, y, 0, y + 14);
      stripe.addColorStop(0, '#302820');
      stripe.addColorStop(.29, '#d5c5b0');
      stripe.addColorStop(.54, '#eee2d0');
      stripe.addColorStop(1, '#302820');
      context.fillStyle = stripe;
      context.fillRect(-143, y, 286, 14);
    }
  }
  light.map = new CanvasTexture(canvas);
  light.map.colorSpace = SRGBColorSpace;
  light.position.set(-2.3, 2.2, 4.7);
  light.target.position.set(-.6, .75, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(512, 512);
  light.shadow.normalBias = .024;
  return light;
}

function makeHub() {
  const station = new Group();
  const product = new Group();
  const shell = new MeshStandardMaterial({ color: '#e4e1d6', roughness: .32, metalness: .06 });
  const outer = new MeshStandardMaterial({ color: '#bfc2b6', roughness: .45 });
  const seam = new MeshStandardMaterial({ color: '#313b35', roughness: .64 });
  const back = rounded(1.94, 1.94, .205, .125, outer);
  const joint = rounded(1.98, 1.98, .104, .084, seam);
  const face = rounded(2.02, 2.02, .202, .099, shell);
  joint.position.z = .059;
  face.position.z = .143;
  product.add(back, joint, face);

  const mark = new Mesh(
    new PlaneGeometry(.427, .171),
    new MeshBasicMaterial({ map: hubMark(), transparent: true, depthWrite: false, toneMapped: false }),
  );
  mark.position.z = .248;
  product.add(mark);
  station.add(product);

  const signal = pulseRings();
  signal.pulse.position.z = -.40;
  signal.pulse.scale.setScalar(4.05);
  station.add(signal.pulse);
  return { station, product, signal };
}

export function createSignalModels(canvas: HTMLCanvasElement, onTextureReady: () => void) {
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!context) return null;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.09;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const environment = new RoomEnvironment();
  const radiance = new PMREMGenerator(renderer);
  const reflections = radiance.fromScene(environment, .025, .1, 40, { size: 96 });
  scene.environment = reflections.texture;
  scene.environmentIntensity = .61;
  environment.dispose();
  radiance.dispose();

  const camera = new PerspectiveCamera(33, 1, .1, 26);
  scene.add(new AmbientLight('#e8ecdd', .35));
  scene.add(new HemisphereLight('#e3e9df', '#45372f', 1.65));
  const amberKey = new Color('#ffddbb');
  const whiteKey = new Color('#e9f0d5');
  const key = new DirectionalLight(amberKey, 2.44);
  key.position.set(-3.2, 3.4, 4.9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.normalBias = .018;
  key.shadow.bias = -.00035;
  scene.add(key);
  const edge = new DirectionalLight('#9db8ac', 1.52);
  edge.position.set(3.3, 1.7, .5);
  scene.add(edge);
  const porchLight = windowLight();
  scene.add(porchLight, porchLight.target);

  const door = makeDoor(onTextureReady);
  const hub = makeHub();
  scene.add(door.root, hub.station);
  let framingDistance = 5.03;
  let sized = false;

  function size(width: number, height: number) {
    if (width < 1 || height < 1) return;
    camera.aspect = width / height;
    const narrow = camera.aspect < 1.02;
    camera.fov = narrow ? 40 : 33;
    const horizontalSpan = 2 * Math.tan(camera.fov * Math.PI / 360) * camera.aspect;
    // Keep the complete hardware in view even on a tall, narrow stage.
    framingDistance = Math.max(narrow ? 5.19 : 5.03, 3.25 / horizontalSpan);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, narrow ? 1.35 : 1.55));
    renderer.setSize(width, height, false);
    sized = true;
  }

  function render(progress: number, opening: number, pointerX: number, pointerY: number) {
    if (!sized) return;
    const doorExit = smoothRange(.85, 1.16, progress);
    const hubEnter = smoothRange(.86, 1.17, progress);
    const hubTravel = smoothRange(1.14, 1.91, progress);
    const hubExit = smoothRange(1.75, 2.03, progress);
    porchLight.visible = doorExit < .99;
    porchLight.intensity = 38 * (1 - doorExit);
    porchLight.position.x = -2.3 + pointerX * .46;
    door.root.visible = progress < 1.16;
    hub.station.visible = progress > .86 && progress < 2.1;
    door.root.position.set(-doorExit * 4.1, 0, -doorExit * 1.25);
    door.hinge.rotation.y = opening * .64;
    door.led.emissiveIntensity = .12 + opening * 1.18;

    door.signal.rings.forEach((ring, index) => {
      const range = smoothRange(.19 + index * .13, .68 + index * .09, opening);
      ring.scale.setScalar(.67 + range * .66);
      ring.material.opacity = (1 - doorExit) * range * (.51 - index * .101);
    });

    hub.station.position.set(3.4 * (1 - hubEnter) - .60 * hubExit, .28, -1.1 + hubEnter * .95 - hubExit * .87);
    hub.product.rotation.set(-.24 + hubTravel * .43 - pointerY * .13, -.74 + hubTravel * 1.29 + pointerX * .28, .15 - hubTravel * .31);
    hub.product.scale.setScalar(.76 + hubEnter * .31 + hubTravel * .11);
    hub.signal.rings.forEach((ring, index) => {
      const range = smoothRange(1.27 + index * .12, 1.76, progress);
      ring.scale.setScalar(.89 + range * .25);
      ring.material.opacity = range * (.33 - index * .058) * (1 - hubExit * .58);
    });

    const look = (-.45 + .19 * opening) * (1 - hubEnter);
    const doorMove = smoothRange(.07, .81, progress);
    camera.position.set(look + .32 - .64 * doorMove + .34 * hubEnter + pointerX * .23,
      .79 - .37 * hubEnter + pointerY * .14, framingDistance - .30 * doorMove + .36 * hubEnter);
    camera.lookAt(look, .50 - .22 * hubEnter, .02);
    key.position.x = -3.2 + pointerX * 2.8 + hubTravel * .58;
    key.position.y = 3.4 - pointerY * 1.28;
    key.color.copy(amberKey).lerp(whiteKey, hubEnter * .49);
    renderer.render(scene, camera);
  }

  return { size, render };
}

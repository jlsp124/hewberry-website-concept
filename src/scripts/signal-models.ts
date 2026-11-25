import {
  ACESFilmicToneMapping, AmbientLight, CanvasTexture, Color, DirectionalLight, Group,
  HemisphereLight, LatheGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PCFShadowMap,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene, SpotLight, SRGBColorSpace,
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

function makeDoor(onTextureReady: () => void) {
  const root = new Group();
  const enamel = new MeshStandardMaterial({ color: '#e6e4d9', roughness: .27, metalness: .04 });
  const edge = new MeshStandardMaterial({ color: '#b7aca0', roughness: .38 });
  const rail = new MeshStandardMaterial({ color: '#292320', roughness: .53 });
  const wall = new MeshStandardMaterial({ color: '#3f332e', roughness: .8 });
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

  return { root, hinge, led };
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
  const outer = new MeshStandardMaterial({ color: '#c4b9ad', roughness: .45 });
  const seam = new MeshStandardMaterial({ color: '#38312e', roughness: .64 });
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

  const plinth = rounded(6.8, .10, 4.7, .022, new MeshStandardMaterial({ color: '#2d2019', roughness: .68 }));
  plinth.position.set(0, -1.12, .1);
  station.add(plinth);
  return { station, product };
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
  scene.add(new AmbientLight('#eee3d7', .35));
  scene.add(new HemisphereLight('#efe4d6', '#45342e', 1.65));
  const amberKey = new Color('#ffddbb');
  const whiteKey = new Color('#f3e7da');
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
  const edge = new DirectionalLight('#c4af9c', 1.52);
  edge.position.set(3.3, 1.7, .5);
  scene.add(edge);
  const porchLight = windowLight();
  scene.add(porchLight, porchLight.target);

  const door = makeDoor(onTextureReady);
  const hub = makeHub();
  scene.add(door.root, hub.station);
  let framingDistance = 5.64;
  let sized = false;

  function size(width: number, height: number) {
    if (width < 1 || height < 1) return;
    camera.aspect = width / height;
    const narrow = camera.aspect < 1.02;
    camera.fov = narrow ? 40 : 33;
    const horizontalSpan = 2 * Math.tan(camera.fov * Math.PI / 360) * camera.aspect;
    // Keep the complete hardware in view even on a tall, narrow stage.
    framingDistance = Math.max(narrow ? 5.4 : 5.64, 3.28 / horizontalSpan);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, narrow ? 1.35 : 1.55));
    renderer.setSize(width, height, false);
    sized = true;
  }

  function render(progress: number, opening: number, pointerX: number, pointerY: number) {
    if (!sized) return;
    const doorShot = progress < 1;
    const doorMove = smoothRange(.12, .68, progress);
    const hubTravel = smoothRange(1.19, 1.74, progress);
    porchLight.visible = doorShot;
    porchLight.position.x = -2.3 + pointerX * .82;
    porchLight.position.y = 2.2 + pointerY * .42;
    door.root.visible = doorShot;
    hub.station.visible = !doorShot;
    door.hinge.rotation.y = opening * .64;
    door.led.emissiveIntensity = .12 + opening * 1.7;

    hub.station.position.set(0, .12, -.12);
    hub.product.rotation.set(-.15 + hubTravel * .21 - pointerY * .15,
      -.59 + hubTravel * .91 + pointerX * .24, .08 - hubTravel * .15);

    const look = doorShot ? -.38 + .18 * opening : 0;
    camera.position.set(look + (doorShot ? .31 - .51 * doorMove : .34) + pointerX * .37,
      (doorShot ? .72 : .82) + pointerY * .24, framingDistance - (doorShot ? .25 * doorMove : .09 * hubTravel));
    camera.lookAt(look, doorShot ? .45 : .12, .02);
    key.position.x = -3.2 + pointerX * 2.8 + hubTravel * .58;
    key.position.y = 3.4 - pointerY * 1.28;
    key.color.copy(doorShot ? amberKey : whiteKey);
    renderer.render(scene, camera);
  }

  return { size, render };
}

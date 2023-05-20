import * as THREE from 'three';
import {
  initRenderer,
  initDefaultBasicLight,
  onWindowResize,
  degreesToRadians,
  createGroundPlaneWired
} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { makeMap } from './map.js';
import { makeSun } from './sun.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import KeyboardState from '../libs/util/KeyboardState.js';

let scene, renderer, camera, light, aircraftPos, lerpCameraConfig, camPosMin, camPosMax,
  aimPosMin, aimPosMax, camDestination, dist, quaternion;
let aircraft;
let worldAimPos = new THREE.Vector3; // Initial variables
let fireListener = true;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
let keyboard = new KeyboardState(); //Variável para o teclado


//Camera parameters
camera = createCamera();
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
cameraHolder.position.set(0, 115, -60);

aimPosMin = new THREE.Vector3(-235, 10, -255);
aimPosMax = new THREE.Vector3(235, 200, 255);

// Create a basic light to illuminate the scene
light = initDefaultBasicLight(scene);





//Raycaster
let raycaster = new THREE.Raycaster();
let raycasterPlane, raycasterPlaneGeometry, raycasterPlaneMaterial, objects;
objects = [];
raycasterPlaneGeometry = new THREE.PlaneGeometry(930, 440, 20, 20);
raycasterPlaneMaterial = new THREE.MeshLambertMaterial({ color: "rgb(255,0,0)" });
raycasterPlaneMaterial.side = THREE.DoubleSide;
raycasterPlaneMaterial.transparent = true;
raycasterPlaneMaterial.opacity = 0.5;
raycasterPlane = new THREE.Mesh(raycasterPlaneGeometry, raycasterPlaneMaterial);
raycasterPlane.visible = false;
raycasterPlane.position.set(0, 0, 0);
cameraHolder.add(raycasterPlane);
raycasterPlane.translateZ((-cameraHolder.position.z) + 160)
objects.push(raycasterPlane);
window.addEventListener('mousemove', onMouseMove);
function onMouseMove(event) {
  let point;
  let pointer = new THREE.Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  let intersects = raycaster.intersectObjects(objects);
  point = intersects[0].point;
  point.clamp(aimPosMin, aimPosMax);
  scene.attach(aim);
  aim.position.set(point.x, point.y, 160);
  cameraHolder.attach(aim);

}


//Carrega o avião e o adiciona à cena
loadGLBFile('./customObjects/', 'aviao', true, 2);

function loadGLBFile(modelPath, modelName, visibility, desiredScale) {
  var loader = new GLTFLoader();
  loader.load(modelPath + modelName + '.glb', function (gltf) {
    aircraft = gltf.scene;
    aircraft.name = modelName;
    aircraft.visible = visibility;
    aircraft.traverse(function (child) {
      if (child) {
        child.castShadow = true;
      }
    });
    aircraft.traverse(function (node) {
      if (node.material) node.material.side = THREE.DoubleSide;
    });
    aircraft.scale.set(desiredScale, desiredScale, desiredScale);
    scene.add(aircraft)

    var centroAviao = new THREE.SphereGeometry(1, 8, 8);
    var centroAviaoMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    var centro = new THREE.Mesh(centroAviao, centroAviaoMaterial);
    //aircraft.add(centro)
  });
}

//Update Position
function updatePosition() {
  lerpConfig.destination.set(worldAimPos.x, worldAimPos.y, 0);
  if (lerpConfig) { aircraft.position.lerp(lerpConfig.destination, lerpConfig.alpha) }
}

//Lerp Config
const lerpConfig = {
  destination: new THREE.Vector3(0, 55, 0),
  alpha: 0.08,
  move: true
}

//Create aim
let aim = createAim();
raycasterPlane.add(aim);

//Update Aim
function updateAim() {
  scene.attach(aim);
  aim.position.clamp(aimPosMin, aimPosMax);
  cameraHolder.attach(aim);
}

//Update Animation
function updateAnimation(dist, quaternion) {

  aircraft.lookAt(worldAimPos.x, worldAimPos.y, worldAimPos.z);
  dist = aircraft.position.x - worldAimPos.x;
  if (dist < -30) { dist = -30 };
  if (dist > 30) { dist = 30 }
  quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI * (dist / 20)) / 4);
  aircraft.applyQuaternion(quaternion);
  // quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (-Math.PI * ( dist / 40 ) ) / 4);
  // aircraft.applyQuaternion(quaternion);

}

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

let map = makeMap();
map.queue.forEach(element => scene.add(element.map));

let sun = makeSun();
scene.add(sun)

const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load('./sky.jpeg');
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.encoding = THREE.sRGBEncoding;
scene.background = textureEquirec

camera.lookAt(cameraHolder.position.x, cameraHolder.position.y, cameraHolder.position.z + 1);

let isPaused = false; //Variável que define estado pausado/não pausado

var bullets = [];

function fireBullet() {
  var bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  var bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  let mundoAir1 = new THREE.Vector3(0, 0, 0);
  aircraft.getWorldPosition(mundoAir1);

  var direction = new THREE.Vector3();
  let mundoAim = new THREE.Vector3(0, 0, 0);
  aim.getWorldPosition(mundoAim)
  let mundoAir = new THREE.Vector3(0, 0, 0);;
  aircraft.getWorldPosition(mundoAir);
  direction.subVectors(mundoAim, mundoAir).normalize();
  bullet.velocity = direction;
  bullet.velocity.multiplyScalar(5);
  bullet.move = true;

  aircraft.add(bullet);
  bullet.position.set(0, 0, 0);
  scene.attach(bullet)
  bullets.push(bullet);
}

var turretsPos = [];
var turretV = new THREE.Vector3();

function euclideanDistance(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
}

function bulletMov() {
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].position.add(bullets[i].velocity)
    for (var j = 0; j < map.MAX_TURRET; j++) {
      if (!map.turretsDying[j] && map.turretsVisible[j] ) {
        turretV = new THREE.Vector3();
        map.turrets[j].mesh.getWorldPosition(turretV)
        if (euclideanDistance(bullets[i].position.x, bullets[i].position.y, bullets[i].position.z, turretV.x, turretV.y, turretV.z) < 50) {
          map.turretsDying[j] = true;
        }
      }
    }

    if (bullets[i].position.z > 300) { //Definir distância adequada!!
      scene.remove(bullets[i]);  //Remove o tiro da cena
      bullets.splice(i, 1);  //Remove do array
      i--;
    }
  }
}

//Listener do Tiro (Botão esquerdo do mouse)
document.addEventListener("mousedown", fireBullet);

function keyboardUpdate() {

  keyboard.update();

  //Velocidades
  if (keyboard.down(1)) { map.SPEED = 1 }
  if (keyboard.down(2)) { map.SPEED = 3 }
  if (keyboard.down(3)) { map.SPEED = 5 }

  //Pause
  if (keyboard.down('esc')) { isPaused = !isPaused; document.body.style.cursor = 'auto'; }
}

//Mouse invisibility
document.body.style.cursor = 'none';

render();
function render() {
  if (isPaused) {
    keyboardUpdate();
    requestAnimationFrame(render);
    if (fireListener) {
      document.removeEventListener("mousedown", fireBullet);
      document.addEventListener('click', function () { isPaused = false });
      fireListener = false;
    }

  } else {
    if (!fireListener) {
      document.addEventListener("mousedown", fireBullet);
      //Mouse invisibility
      document.body.style.cursor = 'none';
      fireListener = true;
    }


    //Render scene
    requestAnimationFrame(render);
    renderer.render(scene, camera)
    map.updateMapQueue(scene);
    aim.getWorldPosition(worldAimPos);

    if (aircraft) {
      updatePosition();
      updateAnimation(dist, quaternion);
    }
    updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, camDestination);
    updateAim();
    keyboardUpdate();

    //Realiza o movimento dos tiros e excluí da cena
    bulletMov();
  }
}
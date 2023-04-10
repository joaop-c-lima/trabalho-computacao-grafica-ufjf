import * as THREE from  'three';
import {initRenderer, 
        initDefaultBasicLight,
        onWindowResize} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { createPlane } from './createPlane.js';
import { makeMapQueue, updateMapQueue } from './map.js';
import { makeSun } from './sun.js';

let scene, renderer, camera, light, aimPos, lerpCameraConfig, camPosMin, camPosMax, aircraft, camDestination, dist, quaternion;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer

//Camera parameters
camera = createCamera();
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
camPosMin = new THREE.Vector3(-8, 40, -100);
camPosMax = new THREE.Vector3(8, 75, 100);

// Create a basic light to illuminate the scene
light = initDefaultBasicLight(scene); 

//Mouse invisibility
document.body.style.cursor = 'none';

//Pointer Lock
const canvas = document.querySelector("canvas");
canvas.addEventListener("click", async () => {
  canvas.requestPointerLock({unadjustedMovement: true});
});

//Create plane
aircraft = createPlane(scene);
aircraft.position.set(0.0, 55.0, -5.0);

//Update Position
function updatePosition() {
  lerpConfig.destination.set(aim.position.x, aim.position.y, aircraft.position.z);
  
  
  if(lerpConfig) { aircraft.position.lerp(lerpConfig.destination, lerpConfig.alpha) }
}

//Lerp Config
const lerpConfig = {
  destination: new THREE.Vector3(),
  alpha: 0.08,
  move: true
}

//Create aim
let aim = createAim();
scene.add(aim);

//Mouse Movement Listener
document.addEventListener("mousemove", updateAim);

//Update Aim
function updateAim(mouse)
{
  let aimPosMin = new THREE.Vector3(-60, 40.0, -100);
  let aimPosMax = new THREE.Vector3(60, 110.0, 100);
  aim.position.x -= mouse.movementX/100;
  aim.position.y -= mouse.movementY/100;
  aim.position.clamp(aimPosMin, aimPosMax);
}

//Update Animation
function updateAnimation(dist, quaternion)
{
  aircraft.lookAt(aim.position);
  aircraft.rotateY(THREE.MathUtils.degToRad(-90));
  aircraft.rotateZ(THREE.MathUtils.degToRad(-90));
  dist = aircraft.position.x - aim.position.x;
  quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI * ( dist / 40 ) ) / 4);
  aircraft.applyQuaternion(quaternion);
}

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

let mapQueue = makeMapQueue();
mapQueue.forEach(element => scene.add(element));

let sun = makeSun();
scene.add(sun)

const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load( './sky.jpeg' );
	textureEquirec.mapping = THREE.EquirectangularReflectionMapping; 
	textureEquirec.encoding = THREE.sRGBEncoding;
scene.background = textureEquirec

render();

function render() {
  requestAnimationFrame(render);
  updateMapQueue(scene, mapQueue);
  renderer.render(scene, camera) // Render scene
  aimPos = new THREE.Vector3(aim.position.x, aim.position.y, aim.position.z);
  updateCamera(camera, aimPos, lerpCameraConfig, cameraHolder, camPosMin, camPosMax, camDestination);
  updateMapQueue(scene, mapQueue);
  updatePosition();
  updateAnimation(dist, quaternion);
}
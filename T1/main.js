import * as THREE from  'three';
import {initRenderer, 
        initDefaultBasicLight,
        onWindowResize,
        degreesToRadians,
      createGroundPlaneWired} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { createPlane } from './createPlane.js';
import { makeMapQueue, updateMapQueue } from './map.js';
import { makeSun } from './sun.js';

let scene, renderer, camera, light, aircraftPos, prevAircraftPos, lerpCameraConfig, camPosMin, camPosMax, aircraft, camDestination, dist, quaternion;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer

//Camera parameters
camera = createCamera();
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
camPosMin = new THREE.Vector3(-20, 100, -100);
camPosMax = new THREE.Vector3(20, 190, 100);
cameraHolder.position.set(0, 135, -60);

// Create a basic light to illuminate the scene
light = initDefaultBasicLight(scene); 

//Mouse invisibility
//document.body.style.cursor = 'none';

//Pointer Lock
/*const canvas = document.querySelector("canvas");
canvas.addEventListener("click", async () => {
  canvas.requestPointerLock();
});*/

//Create plane
aircraft = createPlane(scene);
aircraft.position.set(0.0, 55.0, 0.0);

//Raycaster
let raycaster = new THREE.Raycaster();
let raycasterPlane, raycasterPlaneGeometry, raycasterPlaneMaterial, objects;
objects = [];
raycasterPlaneGeometry = new THREE.PlaneGeometry(560, 140, 20, 20);
raycasterPlaneMaterial = new THREE.MeshLambertMaterial({color: "rgb(255,0,0)"});
raycasterPlaneMaterial.side = THREE.DoubleSide;
raycasterPlaneMaterial.transparent = true;
raycasterPlaneMaterial.opacity = 0.5;
raycasterPlane = new THREE.Mesh(raycasterPlaneGeometry, raycasterPlaneMaterial);
//raycasterPlane.position.set(0,140,120);
cameraHolder.add(raycasterPlane);
raycasterPlane.translateZ(160)
objects.push(raycasterPlane);
window.addEventListener('mousemove', onMouseMove);
function onMouseMove(event){
  let point;
  let pointer = new THREE.Vector2();
  pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  let intersects = raycaster.intersectObjects(objects);
  point =intersects[0].point;
  let worldPlanePos = new THREE.Vector3;
  raycasterPlane.getWorldPosition(worldPlanePos);
  //console.log(worldPos)
  //aim.position.x = point.x-worldPlanePos.x;
  //aim.position.y = point.y-worldPlanePos.y;
  scene.attach(aim);
  aim.position.set(point.x, point.y, 160);
  cameraHolder.attach(aim)
  let worldAimPos = new THREE.Vector3;
  raycasterPlane.getWorldPosition(worldAimPos);
  console.log(worldAimPos.x)
  lerpConfig.destination.set(aim.position.x, aim.position.y+worldAimPos.y, aircraft.position.z);

}
//Update Position
function updatePosition() {
  if(lerpConfig) { aircraft.position.lerp(lerpConfig.destination, lerpConfig.alpha) }
}

//Lerp Config
const lerpConfig = {
  destination: new THREE.Vector3(0,55,0),
  alpha: 0.08,
  move: true
}

//Create aim
let aim = createAim();
raycasterPlane.add(aim);

//Mouse Movement Listener
//document.addEventListener("mousemove", updateAim);
//document.addEventListener("mousemove", raycasterFunction);

//Update Aim
function updateAim(mouse)
{
  let aimPosMin = new THREE.Vector3(-60, 40.0, -100);
  let aimPosMax = new THREE.Vector3(60, 110.0, 100);
  aim.position.x -= mouse.movementX/50;
  aim.position.y -= mouse.movementY/100;
  aim.position.clamp(aimPosMin, aimPosMax);
}

//Update Animation
function updateAnimation(dist, quaternion)
{
  let worldAimPos = new THREE.Vector3;
  raycasterPlane.getWorldPosition(worldAimPos);
  aircraft.lookAt(aircraft.position.x, worldAimPos.y, aircraft.position.z+25);
  aircraft.rotateY(THREE.MathUtils.degToRad(-90));
  aircraft.rotateZ(THREE.MathUtils.degToRad(-90));
  dist = aircraft.position.x - worldAimPos.x;
  if(dist<-30) {dist = -30};
  if(dist>30) {dist = 30}
  quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI * ( dist / 20 ) ) / 4);
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

camera.lookAt(aim.position.x, aim.position.y, aim.position.z);

render();
function render() {
  requestAnimationFrame(render);
  updateMapQueue(scene, mapQueue);
  renderer.render(scene, camera) // Render scene
  aircraftPos = new THREE.Vector3(aircraft.position.x, aircraft.position.y, aircraft.position.z);
  updateCamera(aircraftPos, aim, lerpCameraConfig, cameraHolder, camPosMin, camPosMax, camDestination);
  //updateMapQueue(scene, mapQueue);
  updatePosition();
  updateAnimation(dist, quaternion);
}
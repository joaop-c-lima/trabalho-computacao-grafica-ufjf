import * as THREE from  'three';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        degreesToRadians} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { createPlane } from './createPlane.js';
import { makeMapRow, updateMapRow } from './map.js';
import KeyboardState from '../libs/util/KeyboardState.js' 

let scene, renderer, camera, material, light, orbit, aimPos, lerpCameraConfig, camPosMin, camPosMax, keyboard, aircraft, camDestination;; // Initial variables
keyboard = new KeyboardState();
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer

//Parametros da camera
camera = createCamera(); // Init camera in this position
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
camPosMin = new THREE.Vector3(-8, 40, -100);
camPosMax = new THREE.Vector3(8, 75, 100);
// camLook deve ter mais liberdade que camPos para que a camera sempre rotacione corretamente
/*let camLookMin = new THREE.Vector3(-8, 5, -25);
let camLookMax = new THREE.Vector3(8, 25, 1000);*/


material = new THREE.MeshBasicMaterial("yellow"); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

let mapRow = makeMapRow();
mapRow.forEach(element => scene.add(element));

const canvas = document.querySelector("canvas");
canvas.addEventListener("click", async () => {
  await canvas.requestPointerLock();
});

//Create plane
aircraft = createPlane(scene);
aircraft.position.set(0.0, 55.0, -5.0);

//Update Position
function updatePosition() {
  aimAssist = aim.position;
  lerpConfig.destination.set(aim.position.x, aim.position.y, aircraft.position.z);
  
  
  if(lerpConfig) { aircraft.position.lerp(lerpConfig.destination, lerpConfig.alpha) }
}

const lerpConfig = {
  destination: new THREE.Vector3(),
  alpha: 0.08,
  move: true
}

//Create aim
let aim = createAim();
scene.add(aim);
var aimAssist = new THREE.Vector3().copy(aim.position);

//Mouse invisibility
document.body.style.cursor = 'none';

//Mouse Movement

//Mouse Movement Listener
document.addEventListener("mousemove", updateAim);

//Update Aim
function updateAim(e)
{
  //console.log(e)

  let aimPosMin = new THREE.Vector3(-60, 40.0, -100);
  let aimPosMax = new THREE.Vector3(60, 110.0, 100);
  aim.position.x -= e.movementX/100;
  aim.position.y -= e.movementY/50;
  aim.position.clamp(aimPosMin, aimPosMax);
  lerpConfig.move = true;
  

}

//Update Animation
var y = 0, z = 0;
function updateAnimation(e)
{
  //keyboard.update();
  aircraft.lookAt(aim.position);
  aircraft.rotateY(THREE.MathUtils.degToRad(-90));
  aircraft.rotateZ(THREE.MathUtils.degToRad(-90));
  /*if( y > -5 && y < 5 && z > -15 && z < 15) {
    if( e.movementX > 0 ) { aircraft.rotateY(degreesToRadians(1.5)); z += 0.5;  };
    if( e.movementX < 0) { aircraft.rotateY(degreesToRadians(-2)); z -= 0.5 };
    if( e.movementY > 0 ) { aircraft.rotateZ(degreesToRadians(-0.3)); y += 0.1 };
    if( e.movementY < 0 ) { aircraft.rotateZ(degreesToRadians(0.3)); y -= 0.1 };
  }

  if( e.movementX/2 < 1 ) {
    if(z > 0) { aircraft.rotateY(degreesToRadians(-10)); z -= 0.5 }
    if(z < 0) { aircraft.rotateY(degreesToRadians(10)); z += 0.5 }
    console.log("CHAMOU")
  }
  if( e.movementY/2 < 1 ) {
    if(y > 0) { aircraft.rotateZ(degreesToRadians(-0.5)); y -= 0.1 }
    if(y < 0) { aircraft.rotateZ(degreesToRadians(0.5)); y += 0.1 }
  }*/
}

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

//Mouse data

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
  aimPos = new THREE.Vector3(aim.position.x, aim.position.y, aim.position.z);
  //console.log(aimPos);
  updateCamera(camera, aimPos, lerpCameraConfig, cameraHolder, camPosMin, camPosMax, camDestination);
  //updateAim(event.clientX, Event.clientY, aim);
  updateMapRow(scene, mapRow);
  
  updatePosition();
  updateAnimation();
  //aim.translateX(MouseEvent.clientX);
  //aim.translateY(MouseEvent.clientY);
  //console.log(MouseEvent.clientX);
}
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

let scene, renderer, camera, material, light, orbit, aimPos, lerpCameraConfig, camPosMin, camPosMax, keyboard, aircraft;; // Initial variables
keyboard = new KeyboardState();
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer

//Parametros da camera
camera = createCamera(); // Init camera in this position
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
camPosMin = new THREE.Vector3(-8, 5, -50);
camPosMax = new THREE.Vector3(8, 40, 50);
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
aircraft.position.set(0.0, 30.0, -5.0);

//
function updatePosition() {
  aircraft.position.set(aimAssist.x, aimAssist.y, 5)
}


//Create aim
let aim = createAim();
scene.add(aim);
var aimAssist = new THREE.Vector3().copy(aim.position);

//Mouse invisibility
document.body.style.cursor = 'none';

//Mouse Movement
const centerX = canvas.innerWidth / 2;
const centerY = canvas.innerHeight / 2;

var mouseX = 0;
var mouseY = 0;

function onDocumentMouseMove( event ) {
	mouseX = ( event.clientX - window.innerWidth / 2 ) / window.innerWidth * 2;
	mouseY = ( window.innerHeight / 2 - event.clientY ) / window.innerHeight * 2;
}

//Mouse Movement Listener
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

//Update Aim
function updateAim()
{
  if(mouseX > centerX) { aim.translateX(0.5) }
  if(centerX > mouseX) { aim.translateX(-0.5) }

  aimAssist = aim.position;

}

const lerpConfig = {
  destination: new THREE.Vector3(aimAssist.x, aimAssist.y, aimAssist.z),
  alpha: 0.01,
  angle: 0.0,
  move: false
}

var y = 0, z = 0;
function updateAnimation()
{
  keyboard.update();
  if( y > -5 && y < 5 && z > -5 && z < 5) {
  if( keyboard.pressed("D") ) { aircraft.rotateY(degreesToRadians(1.0)); z += 0.1 };
  if( keyboard.pressed("A") ) { aircraft.rotateY(degreesToRadians(-1.0)); z -= 0.1 };
  if( keyboard.pressed("W") ) { aircraft.rotateZ(degreesToRadians(0.5)); y += 0.1 };
  if( keyboard.pressed("S") ) { aircraft.rotateZ(degreesToRadians(-0.5)); y -= 0.1 };
}
  if( !keyboard.pressed("D") && !keyboard.pressed("A") && !keyboard.pressed("W") && !keyboard.pressed("S")) {
    if(z > 0) { aircraft.rotateY(degreesToRadians(-1.0)); z -= 0.1 }
    if(z < 0) { aircraft.rotateY(degreesToRadians(1.0)); z += 0.1 }
    if(y > 0) { aircraft.rotateZ(degreesToRadians(-0.5)); y -= 0.1 }
    if(y < 0) { aircraft.rotateZ(degreesToRadians(0.5)); y += 0.1 }
  }
}

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

function aimControl(){
  keyboard.update();
  if ( keyboard.pressed("S") && aim.position.y >= 5 ) { aim.translateY(-1) };
  if ( keyboard.pressed("W") && aim.position.y <= 55 ) { aim.translateY(1) };
  if ( keyboard.pressed("D") && aim.position.x >= -40 ) { aim.translateX(-1) };
  if ( keyboard.pressed("A") && aim.position.x <= 40) { aim.translateX(1) };
  if ( keyboard.pressed("B") )   aim.translateZ(-1);    // Verificar se irá manter ou retirar
  if ( keyboard.pressed("space") )   aim.translateZ(1); // Verificar se irá manter ou retirar
}




render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
  aimControl();
  aimPos = new THREE.Vector3(aim.position.x, aim.position.y, aim.position.z);
  //console.log(aimPos);
  updateCamera(camera, aimPos, lerpCameraConfig, cameraHolder, camPosMin, camPosMax);
  //updateAim(event.clientX, Event.clientY, aim);
  updateMapRow(scene, mapRow);
  
  updateAim();
  updatePosition();
  updateAnimation();
  //aim.translateX(MouseEvent.clientX);
  //aim.translateY(MouseEvent.clientY);
  //console.log(MouseEvent.clientX);


  console.log(y)
}
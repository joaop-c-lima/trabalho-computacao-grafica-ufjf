import * as THREE from  'three';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { makeMapRow, updateMapRow } from './map.js';
import KeyboardState from '../libs/util/KeyboardState.js' 
let scene, renderer, camera, material, light, orbit, aimPos, lerpCameraConfig, camPosMin, camPosMax, keyboard;; // Initial variables
keyboard = new KeyboardState();
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer

//Parametros da camera
camera = createCamera(); // Init camera in this position
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
camPosMin = new THREE.Vector3(-8, 5, -25);
camPosMax = new THREE.Vector3(8, 25, 25);
// camLook deve ter mais liberdade que camPos para que a camera sempre rotacione corretamente
/*let camLookMin = new THREE.Vector3(-8, 5, -25);
let camLookMax = new THREE.Vector3(8, 25, 1000);*/


material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
//orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.
let mapRow = makeMapRow();
mapRow.forEach(element => scene.add(element));
//Create aim
let aim = createAim();
scene.add(aim);

//Mouse invisibility
document.body.style.cursor = 'none';

//Mouse Movement
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
  aim.position.x = mouseX;
  aim.position.y = mouseY;
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
  if (keyboard.pressed("S") )   aim.translateY(-1);
  if (keyboard.pressed("W") )   aim.translateY(1);
  if (keyboard.pressed("D") )   aim.translateX(-1);
  if (keyboard.pressed("A") )   aim.translateX(1);
  if (keyboard.pressed("B") )   aim.translateZ(-1);
  if (keyboard.pressed("space") )   aim.translateZ(1);
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
  
  //aim.translateX(MouseEvent.clientX);
  //aim.translateY(MouseEvent.clientY);
  //console.log(MouseEvent.clientX);
}
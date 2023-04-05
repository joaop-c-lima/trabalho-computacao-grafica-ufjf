import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
//import { updatePosition } from './move.js';

let scene, renderer, camera, material, light; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = createCamera() // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
//orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

//Create aim
let aim = createAim();
scene.add(aim);

//Mouse invisibility
document.body.style.cursor = 'none';

//Mouse Movement
var mouseX = 0;
var mouseY = 0;

function onDocumentMouseMove( event ) {
	mouseX = ( event.clientX * 2 - window.innerWidth / 2 ) / window.innerWidth * 2;
	mouseY = ( window.innerHeight / 2 - event.clientY * 2 ) / window.innerHeight * 2;
}

//Mouse Movement Listener
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

//Update Aim
function updateAim(e)
{
  console.log(e);
  aim.position.x += e.movementX/250;
  aim.position.y -= e.movementY/250;
}

//Defining lerp for Movement
let lerpConfig = {
  destination: new THREE.Vector3(mouseX, mouseY, 0),
  alpha: 0.05,
  move: true
}

//Applying lerp
function updatePosition()
{
  lerpConfig.destination.set(mouseX, mouseY, 0);
  if(lerpConfig.move) sphere.position.lerp(lerpConfig.destination, lerpConfig.alpha);
}

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let sphereGeometry = new THREE.SphereGeometry(0.2,32,16);
let sphere = new THREE.Mesh(sphereGeometry, material);
// position the cube
sphere.position.set(0.0, 1.0, 0.0);
// add the cube to the scene
//scene.add(sphere);


const geometry = new THREE.BoxGeometry( 2, 0.2, 0.5 );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
cube.position.set(0, 10, 0)



const lerpConfigA = {
  destination: new THREE.Vector3(0.0, 0.25, 0.0),
  alpha: 0.01,
  angle: 30,
  move: false
}

const canvas = document.querySelector("canvas");
canvas.addEventListener("click", async () => {
  await canvas.requestPointerLock();
});

document.addEventListener("mousemove", updateAim, false);
render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
 
  
  updatePosition();

  if (lerpConfigA.move) {
    des
    let rad = THREE.MathUtils.degToRad(lerpConfig.angle)
    let quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rad);
    cube.position.lerp(lerpConfigA.destination, lerpConfigA.alpha);
    cube.quaternion.slerp(quat, lerpConfigA.alpha)
 }
}
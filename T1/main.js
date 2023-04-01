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

// create a cube
let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
let cube = new THREE.Mesh(cubeGeometry, material);
// position the cube
cube.position.set(0.0, 2.0, 0.0);
// add the cube to the scene
//scene.add(cube);


render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
  updateAim();
}
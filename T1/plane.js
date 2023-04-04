import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        getMaxSize} from "../libs/util/util.js";
import { MeshBasicMaterial } from '../build/three.module';

let scene, renderer, camera, material, materialYellow, materialFan, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial('gray');
materialYellow = setDefaultMaterial('yellow');// create a basic material
materialFan = MeshBasicMaterial({});
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane


// create a cube
let bodyGeometry = new THREE.CylinderGeometry(2.5, 1.5, 15, 32);
let body = new THREE.Mesh(bodyGeometry, material);
// position the cube
body.position.set(0.0, 2.0, 0.0);
// add the cube to the scene
scene.add(body);

let tailGeometry = new THREE.SphereGeometry(1.5, 32, 16);
let tail = new THREE.Mesh(tailGeometry, material);
body.add(tail);
tail.translateY(-7.5);
// Use this to show information onscreen

let axisGeometry = new THREE.CylinderGeometry(0.1,0.1, 1, 16);
let axis = new THREE.Mesh(axisGeometry, material);
body.add(axis);
axis.translateY(8);

let fanGeometry = new THREE.CircleGeometry(2.5 ,32, 0, 6.283185307179586);
let fan = new THREE.Mesh(fanGeometry, material);
axis.add(fan);
fan.translateY(0.5);
fan.rotateX(THREE.MathUtils.degToRad(90));

let wingGeometry = new THREE.SphereGeometry(1.5, 32, 16);
let wing = new THREE.Mesh(wingGeometry, materialYellow);
wing.scale.set(10, 1.3, 0.2);
body.add(wing)
wing.rotateY(THREE.MathUtils.degToRad(90));
wing.translateY(3);

let wing2Geometry = new THREE.SphereGeometry(1, 32, 16);
let wing2 = new THREE.Mesh(wing2Geometry, material);
wing2.scale.set(0.8, 3, 0.1);
tail.add(wing2);
wing2.rotateZ(THREE.MathUtils.degToRad(90));
wing2.translateY(1.5);

let wing3Geometry = new THREE.SphereGeometry(1, 32, 16);
let wing3 = new THREE.Mesh(wing3Geometry, material);
wing3.scale.set(0.8, 5, 0.1)
tail.add(wing3);
wing3.rotateX(THREE.MathUtils.degToRad(90));
wing3.rotateY(THREE.MathUtils.degToRad(90));

let cabinGeometry = new THREE.CapsuleGeometry(1, 3, 16, 32);
let cabin = new THREE.Mesh(cabinGeometry, material);
body.add(cabin);
cabin.translateY(3);
cabin.translateX(-2);

let ringGeometry = new THREE.RingGeometry(2.0, 2.5, 16, 32);
let ring = new THREE.Mesh(ringGeometry, materialYellow);
fan.add(ring);
render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}
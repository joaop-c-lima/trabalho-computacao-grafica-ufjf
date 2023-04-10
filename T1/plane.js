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



let scene, renderer, camera, material, materialDarkYellow, materialFan, materialFanRing, materialMotor, materialCabin, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial('gray');
materialDarkYellow = setDefaultMaterial('rgb(255,200,0)');
materialMotor = setDefaultMaterial('rgb(200,200,200)');
materialCabin =  setDefaultMaterial('rgb(180,200,200)');// create a basic material
materialFan = new THREE.MeshBasicMaterial({color: "gray", transparent: true, opacity: 0.5});
materialFanRing = new THREE.MeshBasicMaterial({color: "rgb(255,255,0)", transparent: true, opacity: 0.5});
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
tail.translateY(-7.5);
body.add(tail);

// Use this to show information onscreen

let axisGeometry = new THREE.CylinderGeometry(0.1,0.1, 1, 16);
let axis = new THREE.Mesh(axisGeometry, material);
axis.translateY(8);
body.add(axis);


let fanGeometry = new THREE.SphereGeometry(2.4 ,32, 16);
let fan = new THREE.Mesh(fanGeometry, materialFan);
fan.scale.set(1, 1, 0.05);
fan.translateY(0.5);
fan.rotateX(THREE.MathUtils.degToRad(90));
axis.add(fan);


let wingGeometry = new THREE.SphereGeometry(1.5, 32, 16);
let wing = new THREE.Mesh(wingGeometry, materialDarkYellow);
wing.scale.set(10, 1.3, 0.2);
wing.rotateY(THREE.MathUtils.degToRad(90));
wing.translateY(3);
body.add(wing);


let wing2Geometry = new THREE.SphereGeometry(1, 32, 16);
let wing2 = new THREE.Mesh(wing2Geometry, material);
wing2.scale.set(0.8, 3, 0.1);
wing2.rotateZ(THREE.MathUtils.degToRad(90));
wing2.translateY(1.5);
tail.add(wing2);


let wing3Geometry = new THREE.SphereGeometry(1, 32, 16);
let wing3 = new THREE.Mesh(wing3Geometry, material);
wing3.scale.set(0.8, 5, 0.1);
wing3.rotateX(THREE.MathUtils.degToRad(90));
wing3.rotateY(THREE.MathUtils.degToRad(90));
tail.add(wing3);


let cabinGeometry = new THREE.SphereGeometry(1.5, 32, 16);
let cabin = new THREE.Mesh(cabinGeometry, materialCabin);
cabin.translateY(3);
cabin.translateX(-1.8);
cabin.scale.set(1.0, 1.5, 0.8);
body.add(cabin);


let ringGeometry = new THREE.TorusGeometry(2, 0.6, 16, 100);
let ring = new THREE.Mesh(ringGeometry, materialFanRing);
fan.add(ring);

let outsideMotorGeometry = new THREE.TorusGeometry(2.4, 0.1, 16, 100);
let outsideMotor = new THREE.Mesh(outsideMotorGeometry, materialDarkYellow);
outsideMotor.scale.set(1, 1, 2);
outsideMotor.rotateX(THREE.MathUtils.degToRad(90));
outsideMotor.translateZ(-7.6);
body.add(outsideMotor);

let insideMotorGeometry = new THREE.CylinderGeometry(1, 1, 1, 32);
let insideMotor1 = new THREE.Mesh(insideMotorGeometry, materialMotor);
insideMotor1.translateY(7.1);
body.add(insideMotor1);

let insideMotor2= new THREE.Mesh(insideMotorGeometry, materialMotor);
insideMotor2.scale.set(0.3, 1, 0.3);
insideMotor2.translateY(7.3);
body.add(insideMotor2);

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}
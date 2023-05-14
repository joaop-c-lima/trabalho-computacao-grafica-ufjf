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
//import {loadGLBFile} from './loadObjects.js'
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { getMaxSize } from '../libs/util/util.js';

let scene, renderer, camera, light, aircraftPos, lerpCameraConfig, camPosMin, camPosMax,
 aimPosMin, aimPosMax, camDestination, dist, quaternion;;
var aircraft;
let spawn = false;
let worldAimPos = new THREE.Vector3; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer



//Camera parameters
camera = createCamera();
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
//camPosMin = new THREE.Vector3(-200, 80, -200);
//camPosMax = new THREE.Vector3(200, 190, 200);
cameraHolder.position.set(0, 135, -60);

aimPosMin = new THREE.Vector2(-200, 70)
aimPosMax = new THREE.Vector2(200, 200)

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
//const loader = new GLTFLoader();

/*loader.load( './customObjects/A10.glb', function ( gltf ) {

	//scene.add( gltf.scene );
  //gltf.scene.position.set(0,90,-50)
  //aircraft = createPlane(scene)
  //aircraft = gltf.scene;

}, undefined, function ( error ) {

	console.error( error );

} );*/
//const gltfLoader = new GLTFLoader();
//gltfLoader.load('./customObjects/A10/scene.gltf'), (gltf) => {
//  scene.add(gltf.scene);
//  aircraft =  gltf.scene
  

//}
//loadGLBFile('./customObjects/', 'A10', true, 10.5);
//aircraft = loadGLBFile('./customObjects/', 'A10', true, 10.5);
//aircraft = createPlane(scene)

//scene.add(aircraft)
loadGLBFile('./customObjects/', 'mig15', true, 10);
//aircraft.position.set(0.0, 55.0, 0.0);


function loadGLBFile(modelPath, modelName, visibility, desiredScale)
{
   var loader = new GLTFLoader( );
   loader.load( modelPath + modelName + '.glb', function ( gltf ) {
      aircraft = gltf.scene;
      aircraft.name = modelName;
      aircraft.visible = visibility;
      aircraft.traverse( function ( child ) {
         if ( child ) {
            child.castShadow = true;
         }
      });
      aircraft.traverse( function( node )
      {
         if( node.material ) node.material.side = THREE.DoubleSide;
      });
      aircraft.scale.set(2,2,2);
      scene.add(aircraft)
      //aircraft = normalizeAndRescale(aircraft, desiredScale);
      //var obj = fixPosition(obj);
      //aircraft = fixPosition(aircraft);
      //aircraft = obj;
      //scene.add ( obj );
      //assetManager[modelName] = obj; 
      //return obj;      
    });
}

function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); 
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

function fixPosition(obj)
{
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
}

//Raycaster
let raycaster = new THREE.Raycaster();
let raycasterPlane, raycasterPlaneGeometry, raycasterPlaneMaterial, objects;
objects = [];
raycasterPlaneGeometry = new THREE.PlaneGeometry(560, 190, 20, 20);
raycasterPlaneMaterial = new THREE.MeshLambertMaterial({color: "rgb(255,0,0)"});
raycasterPlaneMaterial.side = THREE.DoubleSide;
raycasterPlaneMaterial.transparent = true;
raycasterPlaneMaterial.opacity = 0;
raycasterPlane = new THREE.Mesh(raycasterPlaneGeometry, raycasterPlaneMaterial);
raycasterPlane.position.set(0,0,0);
cameraHolder.add(raycasterPlane);
raycasterPlane.translateZ((-cameraHolder.position.z) + 160)
objects.push(raycasterPlane);
window.addEventListener('mousemove', onMouseMove);
function onMouseMove(event){
  let point;
  let pointer = new THREE.Vector2();
  pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //scene.attach(raycasterPlane);
  raycaster.setFromCamera(pointer, camera);
  let intersects = raycaster.intersectObjects(objects);
  point =intersects[0].point;
  point.clamp(aimPosMin,aimPosMax);
  scene.attach(aim);
  aim.position.set(point.x, point.y, 160);
  cameraHolder.attach(aim);

}
//Update Position
function updatePosition() {
  
  aim.getWorldPosition(worldAimPos);
  lerpConfig.destination.set(worldAimPos.x, worldAimPos.y, aircraft.position.z);
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
function updateAim()
{
  scene.attach(aim);
  if (aim.position.x > aimPosMax.x){
    aim.position.x = (aimPosMax.x);
  }

  if (aim.position.x < aimPosMin.x){
    aim.position.x = (aimPosMin.x);
  }

  if (aim.position.y > aimPosMax.y){
    aim.position.y = (aimPosMax.y);
  }

  if (aim.position.y < aimPosMin.y){
    aim.position.y = (aimPosMin.y);
  }
  cameraHolder.attach(aim);
}

//Update Animation
function updateAnimation(dist, quaternion)
{
  
  //let worldAimPos = new THREE.Vector3;
  //aim.getWorldPosition(worldAimPos);
  aircraft.lookAt(aircraft.position.x, worldAimPos.y, aircraft.position.z+25);
  aircraft.rotateY(THREE.MathUtils.degToRad(45));
  //aircraft.rotateZ(THREE.MathUtils.degToRad(-90));
  dist = aircraft.position.x - worldAimPos.x;
  if(dist<-30) {dist = -30};
  if(dist>30) {dist = 30}
  quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI * ( dist / 20 ) ) / 4);
  aircraft.applyQuaternion(quaternion);
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (-Math.PI * ( dist / 30 ) ) / 4);
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
  //aircraftPos = new THREE.Vector3(aircraft.position.x, aircraft.position.y, aircraft.position.z);

  //updateMapQueue(scene, mapQueue);
  if (aircraft){
    if (!spawn){
      aircraft.position.set(0.0, 135.0, 0.0);
      spawn = true;
    }
    updatePosition();
    updateAnimation(dist, quaternion);

  }
  updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, camDestination);
  updateAim();
}
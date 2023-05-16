import * as THREE from  'three';
import {initRenderer, 
        initDefaultBasicLight,
        onWindowResize,
        degreesToRadians,
      createGroundPlaneWired} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { makeMap, updateMapQueue, speedController } from './map.js';
import { makeSun } from './sun.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import KeyboardState from '../libs/util/KeyboardState.js';

let scene, renderer, camera, light, aircraftPos, lerpCameraConfig, camPosMin, camPosMax,
 aimPosMin, aimPosMax, camDestination, dist, quaternion;
let aircraft;
let worldAimPos = new THREE.Vector3; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
let m = false; //Variável que indicará se o tiro foi feito em momento "estacionário" ou transitório
let keyboard = new KeyboardState(); //Variável para o teclado


//Camera parameters
camera = createCamera();
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
cameraHolder.position.set(0, 115, -60);

aimPosMin = new THREE.Vector3(-235, 10,-255);
aimPosMax = new THREE.Vector3(235, 200,255);

// Create a basic light to illuminate the scene
light = initDefaultBasicLight(scene); 


//Carrega o avião e o adiciona à cena
loadGLBFile('./customObjects/', 'mig15', true, 2);

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
      aircraft.scale.set(desiredScale,desiredScale,desiredScale);
      scene.add(aircraft)     
    });
}


//Raycaster
let raycaster = new THREE.Raycaster();
let raycasterPlane, raycasterPlaneGeometry, raycasterPlaneMaterial, objects;
objects = [];
raycasterPlaneGeometry = new THREE.PlaneGeometry(930, 440, 20, 20);
raycasterPlaneMaterial = new THREE.MeshLambertMaterial({color: "rgb(255,0,0)"});
raycasterPlaneMaterial.side = THREE.DoubleSide;
raycasterPlaneMaterial.transparent = true;
raycasterPlaneMaterial.opacity = 0.5;
raycasterPlane = new THREE.Mesh(raycasterPlaneGeometry, raycasterPlaneMaterial);
raycasterPlane.visible = false;
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
  raycaster.setFromCamera(pointer, camera);
  let intersects = raycaster.intersectObjects(objects);
  point = intersects[0].point;
  point.clamp(aimPosMin,aimPosMax);
  scene.attach(aim);
  aim.position.set(point.x, point.y, 160);
  cameraHolder.attach(aim);

}

//Update Position
function updatePosition() {
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

//Update Aim
function updateAim()
{
  scene.attach(aim);
  aim.position.clamp(aimPosMin,aimPosMax);
  cameraHolder.attach(aim);
}

//Update Animation
function updateAnimation(dist, quaternion)
{
  
  aircraft.lookAt(worldAimPos.x, worldAimPos.y, worldAimPos.z);
  aircraft.rotateY(THREE.MathUtils.degToRad(45));
  dist = aircraft.position.x - worldAimPos.x;
  if(dist<-30) {dist = -30};
  if(dist>30) {dist = 30}
  quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI * ( dist / 20 ) ) / 4);
  aircraft.applyQuaternion(quaternion);
  //quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (-Math.PI * ( dist / 20 ) ) / 4);
  //aircraft.applyQuaternion(quaternion);
  
}

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

let map = makeMap();
map.queue.forEach(element => scene.add(element.map));

let sun = makeSun();
scene.add(sun)

const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load( './sky.jpeg' );
	textureEquirec.mapping = THREE.EquirectangularReflectionMapping; 
	textureEquirec.encoding = THREE.sRGBEncoding;
scene.background = textureEquirec

camera.lookAt(cameraHolder.position.x, cameraHolder.position.y, cameraHolder.position.z + 1);

let isPaused = false; //Variável que define estado pausado/não pausado


var bullets = [];
function fireBullet(){
  var bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  var bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.set(aircraft.position.x+2.5, aircraft.position.y+2.5, aircraft.position.z+12);
  var direction = new THREE.Vector3();
  
  bullet.velocity = direction;
  if(m) { bullet.move = true; direction.subVectors( worldAimPos, aircraft.position ).normalize(); }
  else { bullet.move = false }

  scene.add(bullet);
  bullets.push(bullet);
}

//Listener do Tiro (Botão esquerdo do mouse)
document.addEventListener("mousedown", fireBullet);

function keyboardUpdate() {

  keyboard.update();

  //Velocidades
  if( keyboard.down(1) ) { speedController(1) }
  if( keyboard.down(2) ) { speedController(3) }
  if( keyboard.down(3) ) { speedController(5) }

  //Pause
  if( keyboard.down('esc') ) { isPaused = !isPaused; document.body.style.cursor = 'auto'; } 
}

render();
function render() {
  if(isPaused) {
    keyboardUpdate(); 
    requestAnimationFrame(render);
    document.addEventListener('click', function() {isPaused = false});
    
  } else {
    //Mouse invisibility
    document.body.style.cursor = 'none';

    //Render scene
    requestAnimationFrame(render);
    renderer.render(scene, camera) 
    updateMapQueue(scene, mapQueue);
    aim.getWorldPosition(worldAimPos);

    //Verifica se o tiro está sendo feito enquanto o avião está em movimento ou "estacionário"
    if( ( Math.abs(aircraft.position.x - worldAimPos.x) < 2 ) && ( Math.abs(aircraft.position.y - worldAimPos.y < 2))) { m = false } //Definir diferença máxima para considerar "estacionário"
    else { m = true }

    updatePosition();
    updateAnimation(dist, quaternion);
    updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, camDestination);
    updateAim();
    keyboardUpdate();

    //Realiza o movimento dos tiros e excluí da cena
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].position.add(bullets[i].velocity) 
       
      if(!bullets[i].move) { bullets[i].translateZ(1) }

      raycaster.set(bullets[i].position, bullets[i].velocity);

      var colisoes = raycaster.intersectObjects(turrets);
    
      if (colisoes.length > 0) {
        var torre = colisoes[0].object;
        // Mudar a opacidade da torre
        torre.material.opacity = 0.5;
      }

      if (bullets[i].position.z > 80) { //Definir distância adequada!!
         scene.remove(bullets[i]);  //Remove o tiro da cena
         bullets.splice(i, 1);  //Remove do array
         i--;
       }
    }
  }
}
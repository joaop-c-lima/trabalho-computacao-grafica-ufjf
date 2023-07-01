import * as THREE from 'three';
import {
  initRenderer,
  initDefaultBasicLight,
  onWindowResize
} from "../libs/util/util.js";
import { createCamera, updateCamera } from './camera.js';
import { createAim } from './aim.js';
import { makeMap } from './map.js';
import { makeSun } from './sun.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import KeyboardState from '../libs/util/KeyboardState.js';

let scene, renderer, camera, light, lerpCameraConfig,
  aimPosMin, aimPosMax, camDestination, dist, quaternion;
let aircraft;
let worldAimPos = new THREE.Vector3; // Initial variables
let worldAim2Pos = new THREE.Vector3;
let fireListener = true;      // Evitar que o click para sair do pause chame firebullet()
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
let keyboard = new KeyboardState(); //Variável para o teclado

//Camera parameters
camera = createCamera();
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
cameraHolder.position.set(0, 115, -60);

aimPosMin = new THREE.Vector3(-235, 10, -1024);
aimPosMax = new THREE.Vector3(235, 200, 1024);

// Create a basic light to illuminate the scene
let ambientColor = "rgb(150,150,150)";
let ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);

//Raycaster
let raycaster = new THREE.Raycaster();
let raycasterPlane, raycasterPlaneGeometry, raycasterPlaneMaterial, objects;
objects = [];
raycasterPlaneGeometry = new THREE.PlaneGeometry(9200, 9800, 20, 20);
raycasterPlaneMaterial = new THREE.MeshLambertMaterial({ color: "rgb(255,0,0)" });
raycasterPlaneMaterial.side = THREE.DoubleSide;
raycasterPlaneMaterial.transparent = true;
raycasterPlaneMaterial.opacity = 0.5;
raycasterPlane = new THREE.Mesh(raycasterPlaneGeometry, raycasterPlaneMaterial);
raycasterPlane.visible = false;
raycasterPlane.position.set(0, 0, 0);
cameraHolder.add(raycasterPlane);
raycasterPlane.translateZ((-cameraHolder.position.z) + 500)
objects.push(raycasterPlane);
window.addEventListener('mousemove', onMouseMove);
function onMouseMove(event) {
  let point;
  let pointer = new THREE.Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  let intersects = raycaster.intersectObjects(objects);
  point = intersects[0].point;
  point.clamp(aimPosMin, aimPosMax);
  scene.attach(aim2);
  aim2.position.set(point.x, point.y, 500);
  cameraHolder.attach(aim2);

}

//Carrega o avião e o adiciona à cena
loadGLBFile('./customObjects/', 'aviao', true, 2);

function loadGLBFile(modelPath, modelName, visibility, desiredScale) {
  var loader = new GLTFLoader();
  loader.load(modelPath + modelName + '.glb', function (gltf) {
    aircraft = gltf.scene;
    aircraft.name = modelName;
    aircraft.visible = visibility;
    aircraft.traverse(function (child) {
      if (child) {
        child.castShadow = true;
      }
    });
    aircraft.traverse(function (node) {
      if (node.material) node.material.side = THREE.DoubleSide;
    });
    aircraft.scale.set(desiredScale, desiredScale, desiredScale);
    scene.add(aircraft)
  });
}

//Update Position
function updatePosition() {
  lerpConfig.destination.set(worldAim2Pos.x, worldAim2Pos.y, 0);
  lerpAimConfig.destination.set(worldAim2Pos.x, worldAim2Pos.y, 160);
  if (lerpConfig) { aircraft.position.lerp(lerpConfig.destination, lerpConfig.alpha) }
  if (lerpAimConfig) { aim.position.lerp((lerpAimConfig.destination), lerpAimConfig.alpha) }
}

//Lerp Config
const lerpConfig = {
  destination: new THREE.Vector3(0, 55, 0),
  alpha: 0.01 ,
  move: true
}

const lerpAimConfig = {
  destination: new THREE.Vector3(0, 55, 0),
  alpha: 0.01,
  move: true
}

//Create aim
let aim = createAim();
let aim2 = createAim();
scene.add(aim)
aim.translateZ(160)
raycasterPlane.add(aim2);

//Update Aim
function updateAim() {
  scene.attach(aim2);
  aim2.position.clamp(aimPosMin, aimPosMax);
//  aim2.position.set(aim.position.x,aim.position.y,aim.position.z+60);
  cameraHolder.attach(aim2);
}

//Update Animation
function updateAnimation(dist, quaternion) {

  //aircraft.lookAt(worldAim2Pos.x, worldAim2Pos.y, worldAim2Pos.z);
  dist = aircraft.position.x - worldAim2Pos.x;
  if (dist < -30) { dist = -30 };
  if (dist > 30) { dist = 30 }
  //console.log(dist);
  quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI * (dist / 35)) / 4);
  aircraft.quaternion.slerp(quaternion,0.1)
  //aircraft.applyQuaternion(quaternion);
}

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Cria o mapa e ativa a fila
let map = makeMap();
map.queue.forEach(element => scene.add(element.map));

// Cria o sol
let sun = makeSun();
scene.add(sun)

// Carrega o céu
const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load('./customObjects/sky.png');
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.encoding = THREE.sRGBEncoding;
scene.background = textureEquirec

camera.lookAt(cameraHolder.position.x, cameraHolder.position.y, cameraHolder.position.z + 1); // Inicializa a camera sempre virada para frente

let isPaused = false; //Variável que define estado pausado/não pausado

// Array para armazenar os tiros disparados
var bullets = [];

// Função que realiza os tiros
function fireBullet() {
  //aircraft.add(bulletSound);
  if(bulletSound.isPlaying){
    bulletSound.stop();
    bulletSound.play();
  }
  else{
    bulletSound.play();
  }
  var bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  var bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  var direction = new THREE.Vector3();
  let posMundoAim = new THREE.Vector3(0, 0, 0);
  aim2.getWorldPosition(posMundoAim)   // Pega posição global da mira
  let posMundoAircraft = new THREE.Vector3(0, 0, 0);;
  aircraft.getWorldPosition(posMundoAircraft);  // Pega posição global do aviao
  direction.subVectors(posMundoAim, posMundoAircraft).normalize();  // Calcula direção do avião até a mira
  bullet.velocity = direction;
  bullet.velocity.multiplyScalar(5); // Muda velocidade do disparo

  aircraft.add(bullet); // Faz o disparo sair do avião
  bullet.position.set(0, 0, 0);
  scene.attach(bullet)  // Adiciona o disparo à cena
  bullets.push(bullet); // Adiciona o disparo no array
}

var turretV; 

function euclideanDistance(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
}

function bulletMov() {
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].position.add(bullets[i].velocity) // Atualiza o movimento dos disparos
    for (var j = 0; j < map.MAX_TURRET; j++) {
      if (!map.turrets[j].dying && map.turrets[j].visible ) {
        turretV = new THREE.Vector3();
        map.turrets[j].mesh.getWorldPosition(turretV) // Armazena a posição global das torretas

        // Verifica se a torreta foi atingida
        if (euclideanDistance(bullets[i].position.x, bullets[i].position.y, bullets[i].position.z, turretV.x, turretV.y, turretV.z) < map.DISTANCE_TOLERANCE) {
          map.turrets[j].dying  = true; // Se atingida, status passa sendo destruída
        }
      }
    }

    if (bullets[i].position.z > map.FADE_END() || bullets[i].position.y < map.MAP_Y/2 || Math.abs(bullets[i].position.x) > map.MAP_X/2) {
      scene.remove(bullets[i]);  //Remove o tiro da cena
      bullets.splice(i, 1);  //Remove do array
      i--;
    }
  }
}

//Listener do Tiro (Botão esquerdo do mouse)
document.addEventListener("click", fireBullet);

function keyboardUpdate() {

  keyboard.update();

  //Velocidades
  if (keyboard.down(1)) { map.SPEED = 1 }
  if (keyboard.down(2)) { map.SPEED = 3 }
  if (keyboard.down(3)) { map.SPEED = 5 }
  //Music
  if (keyboard.down('S')) {
    if(!music.isPlaying){
      music.play();
    }
    else{
      music.pause();
    }
  }

  //Pause
  if (keyboard.down('esc')) { isPaused = !isPaused; document.body.style.cursor = 'auto'; }
}

//Mouse invisibility
document.body.style.cursor = 'none';

//Audio
const listener = new THREE.AudioListener();
camera.add( listener );
let audioLoader = new THREE.AudioLoader();
const music = new THREE.Audio( listener ); 
const bulletSound = new THREE.Audio( listener );
audioLoader.load( './customObjects/mixkit-short-laser-gun-shot-1670.wav', function( buffer ) {
  bulletSound.setBuffer(buffer);
  bulletSound.setLoop = false;
  bulletSound.setVolume(1);
});
audioLoader.load( './customObjects/raptor-151529.mp3', function( buffer ) {
	music.setBuffer( buffer );
	music.setLoop( true );
	music.setVolume( 0.8 );
  music.hasPlaybackControl = true
	//sound.play(); // Will play when start button is pressed
});

render();
function render() {
  if (isPaused) { // Pause Ativo
    keyboardUpdate();
    requestAnimationFrame(render);
    if (fireListener) {
      aim.visible = false;
      renderer.render(scene, camera);
      document.removeEventListener("click", fireBullet);
      document.addEventListener('click', function () { isPaused = false });
      fireListener = false; // Desativa os disparos
    }

  } else {
    if (!fireListener) {
      aim.visible = true;
      document.addEventListener("click", fireBullet);
      //Mouse invisibility
      document.body.style.cursor = 'none';
      fireListener = true; // Ativa os disparos
    }

    //Render scene
    requestAnimationFrame(render);
    renderer.render(scene, camera)
    map.updateMapQueue(scene); // Atualiza a fila de mapas
    aim2.getWorldPosition(worldAim2Pos); // Atualiza a posição global da mira
    aim.getWorldPosition(worldAimPos);

    if (aircraft) {
      updatePosition(); // Atualiza posição do avião
      updateAnimation(dist, quaternion); // Realiza animações de movimento do avião
      //console.log(`1:${worldAimPos.x}`);
      //console.log(`2:${worldAim2Pos.x}`);
    }
    updateCamera(aim2, worldAim2Pos, lerpCameraConfig, cameraHolder, camDestination); // Atualiza posição da câmera
    updateAim(); // Atualiza mira
    keyboardUpdate(); // Atualiza teclado

    //Realiza o movimento dos tiros e excluí da cena
    bulletMov();
  }
}
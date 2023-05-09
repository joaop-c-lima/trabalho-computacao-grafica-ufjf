import * as THREE from 'three';
import { makeRandomTree } from './tree.js';
import { getRndInteger } from './utils.js';

const MAP_COLOR = "#228b22";
const MAP_X = 500.0;
const MAP_Y = 0.01;
const MAP_Z = 10.0;
const NUM_MAX_MAP = 100;
const MAX_NON_VISIBLE_MAPS = 5;
const Z_DESTINATION = MAX_NON_VISIBLE_MAPS * MAP_Z * (-1);
const SPEED = 1.0;
const MIN_NUM_TREES = 2;
const MAX_NUM_TREES = 3;
const FADE_START = 200;
const FADE_END = NUM_MAX_MAP * MAP_Z;

// Creates the queue of map parts
export function makeMapQueue() {
  let mapQueue = [];
  mapQueue.push(makeMap());
  for (let i = 1; i < NUM_MAX_MAP; i++) {
    addMapInQueue(mapQueue);
  }
  return mapQueue;
}

// Creates and places a map part at the end of the queue
export function addMapInQueue(mapQueue) {
  mapQueue.push(makeMap());
  mapQueue[mapQueue.length - 1].material.opacity = opacityLinearFunction(mapQueue[mapQueue.length - 2].position.z + MAP_Z);
  mapQueue[mapQueue.length - 1].position.set(0, 0, mapQueue[mapQueue.length - 2].position.z + MAP_Z);
}

// Creates the map along with randomly placed trees
export function makeMap() {
  let mapMaterial = new THREE.MeshLambertMaterial({ color: MAP_COLOR});
  mapMaterial.transparent = true;
  let mapGeometry = new THREE.BoxGeometry(MAP_X, MAP_Y, MAP_Z);
  let map = new THREE.Mesh(mapGeometry, mapMaterial);
  map.position.set(0.0, 0.0, 0.0);
  map.receiveShadow = true;
  let trees = [];
  for (let i = 0; i < getRndInteger(MIN_NUM_TREES, MAX_NUM_TREES); i++) {
    trees.push(makeRandomTree());
    map.add(trees[trees.length - 1]);
    trees[trees.length - 1].position.set(getRndInteger(0, MAP_X) - (MAP_X / 2),
      (trees[trees.length - 1].geometry.parameters.height + MAP_Y) / 2,
      getRndInteger(0, MAP_Z) - (MAP_Z / 2));
  }
  return map;
}

// Remove map from queue and scene
export function removeMap(scene, mapQueue) {
  mapQueue[0].geometry.dispose();
  mapQueue[0].material.dispose();
  scene.remove(mapQueue[0]);
  mapQueue.shift();
}

// Function that sets the opacity of an object given the Z of its position
export function opacityLinearFunction(elementZ) {
  if (elementZ < FADE_START) {
    return 1.0;
  } else {
    return (elementZ * (-1 / (FADE_END - FADE_START))) + (1 + (FADE_START / (FADE_END - FADE_START)));
  }
}

// Sets the opacity of a mesh and its children
export function changeOpacity(element, opacity) {
  element.children.forEach((child) => {
    changeOpacity(child, opacity);
  });
  element.material.opacity = opacity;
}

// Updates the queue of maps by removing the first one from the queue and creating a new map at the end
export function updateMapQueue(scene, mapQueue) {
  mapQueue.forEach(element => {
    element.position.z -= SPEED;
    if (element.position.z >= FADE_START) {
      changeOpacity(element, opacityLinearFunction(element.position.z));
    }
  });
  if (mapQueue[0].position.z <= Z_DESTINATION) {
    removeMap(scene, mapQueue)
    addMapInQueue(mapQueue);
    scene.add(mapQueue[mapQueue.length - 1]);
  }
}

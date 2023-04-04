import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
  setDefaultMaterial,
} from "../libs/util/util.js";
import { makeRandomTree } from './tree.js';
import { getRndInteger } from './utils.js';

const MAP_COLOR = "#228b22";
const MAP_X = 500.0;
const MAP_Y = 0.01;
const MAP_Z = 100.0;
const NUM_MAX_MAP = 40;
const MAX_NON_VISIBLE_MAPS = 1;
const Z_DESTINATION = MAX_NON_VISIBLE_MAPS * MAP_Z * (-1);
const VELOCIDADE = 2.5;
const MIN_NUM_TREES = 20;
const MAX_NUM_TREES = 50;

export function makeMapRow() {
  let mapRow = [];
  mapRow.push(makeMap());
  for (let i = 1; i < NUM_MAX_MAP; i++) {
    addMapInRow(mapRow);
  }
  return mapRow;
}

export function addMapInRow(mapRow) {
  mapRow.push(makeMap());
  mapRow[mapRow.length - 1].position.set(0, 0, mapRow[mapRow.length - 2].position.z + MAP_Z);
}

export function makeMap() {
  let mapMaterial = new THREE.MeshPhongMaterial({ color: MAP_COLOR, shininess: "200" });
  let mapGeometry = new THREE.BoxGeometry(MAP_X, MAP_Y, MAP_Z);
  let map = new THREE.Mesh(mapGeometry, mapMaterial);
  map.position.set(0.0, 0.0, 0.0);
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

export function removeMap(scene, mapRow) {
  mapRow[0].geometry.dispose();
  mapRow[0].material.dispose();
  scene.remove(mapRow[0]);
  mapRow.shift();
}

export function updateMapRow(scene, mapRow) {
  mapRow.forEach(element => element.position.z -= VELOCIDADE);
  if (mapRow[0].position.z <= Z_DESTINATION) {
    removeMap(scene, mapRow)
    addMapInRow(mapRow);
    scene.add(mapRow[mapRow.length - 1]);
  }
}

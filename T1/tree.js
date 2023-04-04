import * as THREE from 'three';
import { getRndInteger } from './utils.js';
const TRUNK_COLOR = "#412525";
const LEAF_COLOR = "#008000"
const TRUNK_MIN_RADIUS = 5;
const TRUNK_MAX_RADIUS = 15;
const TRUNK_MIN_HEIGHT = 15;
const TRUNK_MAX_HEIGHT = 35;
const MIN_NUM_LEAVES = 1;
const MAX_NUM_LEAVES = 4;
const LEAF_MIN_RADIUS = 30;
const LEAF_MAX_RADIUS = 50;
const LEAF_MIN_HEIGHT = 10;
const LEAF_MAX_HEIGHT = 20;


export function makeRandomTree() {
    let trunk = makeRandomTrunk();
    return trunk;
}


export function makeRandomTrunk() {
    let trunkMaterial = new THREE.MeshPhongMaterial({ color: TRUNK_COLOR});
    //trunkMaterial.transparent = true;
    let trunkradius = getRndInteger(TRUNK_MIN_RADIUS, TRUNK_MAX_RADIUS) / 10;
    let trunkHeight = getRndInteger(TRUNK_MIN_HEIGHT, TRUNK_MAX_HEIGHT);
    let trunkGeometry = new THREE.CylinderGeometry(trunkradius, trunkradius, trunkHeight, 32);
    let trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    addLeaves(trunk);
    return trunk
}

export function addLeaves(trunk) {
    let leaf;
    let lastLeaf = makeLeaf();
    trunk.add(lastLeaf);
    lastLeaf.position.y += trunk.geometry.parameters.height/2 + lastLeaf.geometry.parameters.height/2;
    for (let i = 0; i < (getRndInteger(MIN_NUM_LEAVES, MAX_NUM_LEAVES) - 1); i++) {
        leaf = makeLeaf( lastLeaf.geometry.parameters.radius, lastLeaf.geometry.parameters.height);
        lastLeaf.add(leaf);
        leaf.position.y += lastLeaf.geometry.parameters.height/2;
        lastLeaf = leaf;
    }
}

export function makeLeaf(maxRadius = -1, maxHeight = -1) {
    let leafMaterial = new THREE.MeshPhongMaterial({ color: LEAF_COLOR, shininess: "200" });
    leafMaterial.transparent = true;
    let leafRadius = getRndInteger(LEAF_MIN_RADIUS, maxRadius != -1 ? maxRadius : LEAF_MAX_RADIUS) / 10;
    let leafHeight = getRndInteger(LEAF_MIN_HEIGHT, maxHeight != -1 ? maxHeight : LEAF_MAX_HEIGHT);
    let leafGeometry = new THREE.ConeGeometry(leafRadius, leafHeight, 32);
    let leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.castShadow = true;

    return leaf;
}
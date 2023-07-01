import * as THREE from 'three';
import { getRndInteger } from './utils.js';

// TRENCH GROUND
export const TRENCH_GROUND_X = 200.0;
export const TRENCH_GROUND_Y = 0.01;
export const TRENCH_GROUND_Z = 100.0;

export const TRENCH_WALL_X = 0.01;
export const TRENCH_WALL_Y = 100.0;
export const TRENCH_WALL_Z = TRENCH_GROUND_Z;

export const UPSIDE_X = 2000.0;
export const UPSIDE_Y = 0.01;
export const UPSIDE_Z = TRENCH_GROUND_Z;




export function getDeathStarSurface() {
    let trenchGround = getTrenchGround();
    let trenchWallLeft = getTrenchWall();
    let trenchWallRight = getTrenchWall();
    let upsideLeft = getUpside();
    let upsideRight = getUpside();

    trenchGround.add(trenchWallLeft);
    trenchWallLeft.position.set((TRENCH_GROUND_X + TRENCH_WALL_X) * (-0.5),
        (TRENCH_GROUND_Y + TRENCH_WALL_Y) * (0.5),
        0);

    trenchGround.add(trenchWallRight);
    trenchWallRight.position.set((TRENCH_GROUND_X + TRENCH_WALL_X) * (0.5),
        (TRENCH_GROUND_Y + TRENCH_WALL_Y) * (0.5),
        0);

    trenchWallLeft.add(upsideLeft);
    upsideLeft.position.set((TRENCH_WALL_X + UPSIDE_X) * (-0.5),
        (TRENCH_WALL_Y + UPSIDE_Y) * (0.5),
        0);

    trenchWallRight.add(upsideRight);
    upsideRight.position.set((TRENCH_WALL_X + UPSIDE_X) * (0.5),
        (TRENCH_WALL_Y + UPSIDE_Y) * (0.5),
        0);

    return {
        trenchGround: trenchGround,
        trenchWallLeft: trenchWallLeft,
        trenchWallRight: trenchWallRight,
        upsideLeft: upsideLeft,
        upsideRight: upsideRight
    };

}

function getTrenchGround() {
    let geometry = new THREE.BoxGeometry(TRENCH_GROUND_X, TRENCH_GROUND_Y, TRENCH_GROUND_Z);
    let material = getMaterial();
    let mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
}

function getTrenchWall() {
    let geometry = new THREE.BoxGeometry(TRENCH_WALL_X, TRENCH_WALL_Y, TRENCH_WALL_Z);
    let material = getMaterial();
    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function getUpside() {
    let geometry = new THREE.BoxGeometry(UPSIDE_X, UPSIDE_Y, UPSIDE_Z);
    let material = getMaterial();
    material.map.repeat.set(10,1)
    let mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
}

export function getMaterial() {
    var textureLoader = new THREE.TextureLoader();
    let material = new THREE.MeshLambertMaterial({ color: 'lightGray' });
    material.transparent = true;
    material.map = textureLoader.load('./customObjects/death-star-surface.png');
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.minFilter = THREE.LinearFilter;
    material.map.magFilter = THREE.NearestFilter;
    material.map.repeat.set(1, 1);

    return material;
}
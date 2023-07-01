import * as THREE from 'three';
import { getRndInteger } from './utils.js';

// TRENCH GROUND
export const TRENCH_GROUND_X = 200.0;
export const TRENCH_GROUND_Y = 0.01;
export const TRENCH_GROUND_Z = 100.0;

export const TRENCH_WALL_X = 0.01;
export const TRENCH_WALL_Y = TRENCH_GROUND_X/2;
export const TRENCH_WALL_Z = TRENCH_GROUND_Z;

export const UPSIDE_X = TRENCH_GROUND_X;
export const UPSIDE_Y = 0.01;
export const UPSIDE_Z = TRENCH_GROUND_Z;

export const CUBE_RELIEF = 10;
export const CYLINDER_RADIUS_RELIEF = 10;
export const CYLINDER_HEIGHT_RELIEF = 10;



export function getDeathStarSurface() {
    let material = getMaterial();
    let trenchGround = getTrenchGround(material);
    let trenchWallLeft = getTrenchWall(material);
    let trenchWallRight = getTrenchWall(material);
    let upsideLeft = getUpside(material);
    let upsideRight = getUpside(material);

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

function getTrenchGround(material) {
    let geometry = new THREE.BoxGeometry(TRENCH_GROUND_X, TRENCH_GROUND_Y, TRENCH_GROUND_Z);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
}

function getTrenchWall(material) {
    let geometry = new THREE.BoxGeometry(TRENCH_WALL_X, TRENCH_WALL_Y, TRENCH_WALL_Z);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let cube1 = getCubeRelief(material);
    mesh.add(cube1);
    cube1.position.set(0,(TRENCH_WALL_Y - CUBE_RELIEF)/2, (TRENCH_WALL_Z)*(-0.25));

    let cube2 = getCubeRelief(material);
    mesh.add(cube2);
    cube2.position.set(0,(TRENCH_WALL_Y - CUBE_RELIEF)/2, (TRENCH_WALL_Z)*(0.25));

    let cylinder1 = cylinderRelief(material);
    mesh.add(cylinder1);
    cylinder1.position.set(0,0, 0);

    return mesh;
}

function getUpside(material) {
    let geometry = new THREE.BoxGeometry(UPSIDE_X, UPSIDE_Y, UPSIDE_Z);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
}

export function getMaterial() {
    var textureLoader = new THREE.TextureLoader();
    let material = new THREE.MeshLambertMaterial({ color: 'darkGray' });
    material.transparent = true;
    material.map = textureLoader.load('./customObjects/death-star-surface.png');
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.minFilter = THREE.LinearFilter;
    material.map.magFilter = THREE.NearestFilter;
    material.map.repeat.set(3, 3);

    return material;
}

export function getCubeRelief(material){
    let geometry = new THREE.BoxGeometry(CUBE_RELIEF, CUBE_RELIEF, CUBE_RELIEF);
    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

export function cylinderRelief(material){
    let geometry = new THREE.CylinderGeometry(CYLINDER_RADIUS_RELIEF,CYLINDER_RADIUS_RELIEF,CYLINDER_HEIGHT_RELIEF,16);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.rotateZ(THREE.MathUtils.degToRad(90));
    return mesh;
}
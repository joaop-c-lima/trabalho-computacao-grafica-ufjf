import * as THREE from  'three';
import { setDefaultMaterial } from "../../libs/util/util.js";

export function createAim(){
    let aimMaterial = setDefaultMaterial();
    let aimGeometry = new THREE.BoxGeometry(0.3,0.3,0.3);
    var aim = new THREE.Mesh(aimGeometry, aimMaterial);
    aim.position.set(0.0, 2.0, -5.0);
    return aim;
}
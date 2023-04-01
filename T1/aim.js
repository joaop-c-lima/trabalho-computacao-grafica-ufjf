import * as THREE from  'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../../libs/util/util.js";

export function createAim(){
    let aimMaterial = setDefaultMaterial();
    let aimGeometry = new THREE.BoxGeometry(0.3,0.3,0.3);
    let aim = new THREE.Mesh(aimGeometry, aimMaterial);
    aim.position.set(0.0, 2.0, -5.0);
    return aim;
}

export function updateAim(mouseX, mouseY, aim){
    /*aim.translateX = mouseX;
    aim.translateY = mouseY;*/
    //aim.position.x = (mouseX / window.innerWidth) * 2 - 1;
    //aim.position.x = (mouseY / window.innerWidth) * 2 - 1;
    //console.log(aim.position.x)
    //aim.position.x = pointer.x;
    //aim.position.y = pointer.y;
}
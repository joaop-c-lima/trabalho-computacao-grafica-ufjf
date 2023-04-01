import * as THREE from  'three';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../../libs/util/util.js";


export function createCamera(){
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    let camPos = new THREE.Vector3(3, 8, 8);
    let camUp   = new THREE.Vector3(0.0, 0.0, 0.0);
    let camLook = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.position.copy(camPos);
    camera.up.copy( camUp );
    camera.lookAt(camLook);
    return camera;
}


export function updateCamera(){
    
    camera.position.copy(camPos);
    camera.up.copy(camUp);
    camera.lookAt(camLook);
} 
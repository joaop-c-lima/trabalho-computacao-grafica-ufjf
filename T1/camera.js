import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    let camPos = new THREE.Vector3(1, 1, 5);
    let camUp   = new THREE.Vector3(0, 1, 0);
    let camLook = new THREE.Vector3(0.0, 0.0, -100);
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
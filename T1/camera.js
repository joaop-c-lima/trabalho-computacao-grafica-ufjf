import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    return camera;
}


export function updateCamera(camera, aimPos, lerpCameraConfig, cameraHolder, camMin, camMax){
    
    let destination = new THREE.Vector3(aimPos.x, aimPos.y, -25);
    destination.clamp(camMin, camMax);
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.05,
        move: true
    }
    aimPos.clamp(camMin, camMax);
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
    camera.lookAt(aimPos.x, aimPos.y, aimPos.z);
} 
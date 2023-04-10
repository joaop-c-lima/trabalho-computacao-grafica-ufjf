import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(camera, aimPos, lerpCameraConfig, cameraHolder, camMin, camMax, destination){
    aimPos.clamp(camMin, camMax);
    camera.lookAt(aimPos.x, aimPos.y, aimPos.z);
    destination = new THREE.Vector3(aimPos.x, aimPos.y, -60);
    destination.clamp(camMin, camMax);
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.02,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
} 
import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, destination){
    
    if (aim.position.x>-60 && aim.position.x<60){worldAimPos.x = cameraHolder.position.x}
    if (aim.position.y>-25 && aim.position.y<25){ worldAimPos.y = cameraHolder.position.y}
    destination = new THREE.Vector3(worldAimPos.x, worldAimPos.y, -60);
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.04,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
} 
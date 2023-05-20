import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, destination){
    
    if (aim.position.x>-80 && aim.position.x<80){worldAimPos.x = cameraHolder.position.x}
    if (aim.position.y>-45 && aim.position.y<45){ worldAimPos.y = cameraHolder.position.y}
    destination = new THREE.Vector3(worldAimPos.x, worldAimPos.y, -60);
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.04,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
} 
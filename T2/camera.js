import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, destination){
    
    if (worldAimPos.x>-100 && aim.position.x<100){worldAimPos.x = 0}
    else if (worldAimPos.x<-100) {worldAimPos.x = -80}
    else if (worldAimPos.x>100) {worldAimPos.x = 80}
    if (aim.position.y>-45 && aim.position.y<45){ worldAimPos.y = cameraHolder.position.y}
    destination = new THREE.Vector3(worldAimPos.x, worldAimPos.y, -60);
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.01,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
} 
import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, destination){
    
    //if (worldAimPos.x>-100 && aim.position.x<100){worldAimPos.x = 0}
    if (worldAimPos.x<-120) {worldAimPos.x = -100}
    else if (worldAimPos.x>120) {worldAimPos.x = 100}
    else {worldAimPos.x=0}
    if (worldAimPos.y<50) {worldAimPos.y = 50}
    else if (worldAimPos.y>150) {worldAimPos.y = 160}
    else {worldAimPos.y=105}
    //if (aim.position.y>-45 && aim.position.y<45){ worldAimPos.y = cameraHolder.position.y}
    destination = new THREE.Vector3(worldAimPos.x, worldAimPos.y, -60);
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.01,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
} 
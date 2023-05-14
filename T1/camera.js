import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(aim, worldAimPos, lerpCameraConfig, cameraHolder, camMin, camMax, destination){
    
    //camera.lookAt(aimPos.x, aimPos.y, aimPos.z);
    if (aim.position.x>-100 && aim.position.x<100){worldAimPos.x = cameraHolder.position.x}
    if (aim.position.y>-50 && aim.position.y<50){ worldAimPos.y = cameraHolder.position.y}
    //console.log(aircraftPos.x)
    //console.log(aircraftPos.y)
    worldAimPos.clamp(camMin, camMax);
    destination = new THREE.Vector3(worldAimPos.x, worldAimPos.y, -60);
    //console.log(aircraftPos.y)
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.005,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
    /*destination = new THREE.Vector3(aircraftPos.x, aircraftPos.y, 160);
    
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.04,
        move: true
    }*/
    //aim.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha)
    //console.log(aircraftPos)
} 
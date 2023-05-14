import * as THREE from  'three';

export function createCamera(){
    let camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
    return camera;
}


export function updateCamera(aircraftPos,prevAircraftPos, lerpCameraConfig, cameraHolder, camMin, camMax, destination){
    
    //camera.lookAt(aimPos.x, aimPos.y, aimPos.z);
    if (aircraftPos.x>-10 && aircraftPos.x<15){aircraftPos.x = 0}
    if (aircraftPos.y>110 && aircraftPos.y<150){aircraftPos.y = 130}
    aircraftPos.clamp(camMin, camMax);
        destination = new THREE.Vector3(aircraftPos.x, aircraftPos.y, -60);
    
    lerpCameraConfig = {
        destination: destination,
        alpha: 0.04,
        move: true
    }
    cameraHolder.position.lerp(lerpCameraConfig.destination, lerpCameraConfig.alpha);
    //console.log(aircraftPos)
} 
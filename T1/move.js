import * as THREE from 'three';

let lerpConfig = {
    destination: new THREE.Vector3(mouseX, mouseY, 0),
    alpha: 0.05,
    move: true
}

export function updatePosition() {
    lerpConfig.destination.set(mouseX, mouseY, 0);
    if (lerpConfig.move) sphere.position.lerp(lerpConfig.destination, lerpConfig.alpha);
}
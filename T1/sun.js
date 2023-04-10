import * as THREE from 'three';


const SUN_RADIUS = 10
const SUN_COLOR = "rgb(255,255,50)";
const SUN_LIGHT_COLOR = "rgb(255,255,255)";
const SUN_POSITION = new THREE.Vector3(0, 200, 1000);
const BACKLIGHT_STRENGHT = 0.3;


export function makeSun() {
    let sunGeometry = new THREE.SphereGeometry(10, 16, 32);
    let sunMaterial = new THREE.MeshBasicMaterial({ color: SUN_COLOR });
    let sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(SUN_POSITION);


    let sunLight = new THREE.SpotLight(SUN_LIGHT_COLOR);
    sunLight.distance = 1000;
    sunLight.intensity = 2.5
    sunLight.castShadow = true;
    sunLight.target.position.set(0,0,0);
    sunLight.shadow.camera.near = 0.1;       
    sunLight.shadow.camera.far = 10000;  
    sunLight.distance = 0;
    sun.add(sunLight)

    let backLight = new THREE.SpotLight(SUN_LIGHT_COLOR);
    backLight.distance = 1000;
    backLight.intensity = sunLight.intensity*BACKLIGHT_STRENGHT;
    //backLight.castShadow = true;
    backLight.target.position.set(0,0,0);
    backLight.shadow.camera.near = 0.1;       
    backLight.shadow.camera.far = 10000;  
    backLight.distance = 0;
    //sun.add(backLight);
    backLight.position.z = sun.position.z*(-1)

    return sun;
}
import * as THREE from  'three';

export function createAim(){
    //Creating a grid of points
    var vertices = [];
    vertices.push( new THREE.Vector3( 0, 1.5, 0 ) );
    vertices.push( new THREE.Vector3( 0, -1.5, 0 ) );
    vertices.push( new THREE.Vector3( 1.5, 0, 0 ) );
    vertices.push( new THREE.Vector3( -1.5, 0, 0 ) );

    vertices.push( new THREE.Vector3( 0, 1.5, -1 ) );
    vertices.push( new THREE.Vector3( 1.5, 0, -1 ) );
    vertices.push( new THREE.Vector3( -1.5, 0, -1 ) );
    vertices.push( new THREE.Vector3( 0, -1.5, -1 ) );
    
    //Transforming in a Geometry
    var geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    //Setting material
    var material = new THREE.LineBasicMaterial( { color: 0xffffff } );
    //Drawing the geometry
    var crosshair = new THREE.Line( geometry, material );
    crosshair.position.set(0, 30, 5)
    return crosshair;
}
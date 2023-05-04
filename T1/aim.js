import * as THREE from  'three';

export function createAim(){
    //Creating a grid of points
    var vertices = [];
    vertices.push( new THREE.Vector3( 0, 7.5, 0 ) );
    vertices.push( new THREE.Vector3( 0, -7.5, 0 ) );
    vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    vertices.push( new THREE.Vector3( 7.5, 0, 0 ) );
    vertices.push( new THREE.Vector3( -7.5, 0, 0 ) );

    var vertices2 = [];
    vertices2.push( new THREE.Vector3( 0, 7.5, 0 ) );
    vertices2.push( new THREE.Vector3( 7.5, 0, 0 ) );
    vertices2.push( new THREE.Vector3( 0, -7.5, 0 ) );
    vertices2.push( new THREE.Vector3( -7.5, 0, 0 ) );
    vertices2.push( new THREE.Vector3( 0, 7.5, 0 ) );
    
    //Transforming in a Geometry
    var geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    var geometry2 = new THREE.BufferGeometry().setFromPoints(vertices2);
    //Setting material
    var material = new THREE.LineBasicMaterial( { color: 0xffffff } );
    //Drawing the geometry
    var crosshair = new THREE.Line( geometry, material );
    var crosshair2 = new THREE.Line( geometry2, material );

    crosshair.position.set(0, 55, 30)
    crosshair2.position.set(0, 0, 0)

    crosshair.add(crosshair2)
    return crosshair;
}
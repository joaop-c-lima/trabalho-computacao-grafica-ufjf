import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {PLYLoader} from '../build/jsm/loaders/PLYLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import { getMaxSize } from '../libs/util/util.js';

export function loadGLBFile(modelPath, modelName, visibility, desiredScale)
{
   var loader = new GLTFLoader( );
   loader.load( modelPath + modelName + '.glb', function ( gltf ) {
      var obj = gltf.scene;
      obj.name = modelName;
      obj.visible = visibility;
      obj.traverse( function ( child ) {
         if ( child ) {
            child.castShadow = true;
         }
      });
      obj.traverse( function( node )
      {
         if( node.material ) node.material.side = THREE.DoubleSide;
      });

      var obj = normalizeAndRescale(obj, desiredScale);
      //var obj = fixPosition(obj);
      return obj;
      //scene.add ( obj );
      //assetManager[modelName] = obj;        
    });
}

function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); 
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

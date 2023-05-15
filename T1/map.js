import * as THREE from 'three';
import { makeRandomTree } from './tree.js';
import { getRndInteger } from './utils.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';

const MAP_COLOR = "#228b22";
const MAP_X = 500.0;
const MAP_Y = 0.01;
const MAP_Z = 50.0;
const WALL_HEIGHT = 100.0;
const WALL_COLOR = "#808487";
const NUM_MAX_MAP = 20;
const MAX_NON_VISIBLE_MAPS = 3;
const Z_DESTINATION = MAX_NON_VISIBLE_MAPS * MAP_Z * (-1);
const SPEED = 3;
const MIN_NUM_TREES = 2;
const MAX_NUM_TREES = 3;
const FADE_START = 200;
const FADE_END = NUM_MAX_MAP * MAP_Z;
const MAX_TURRET = 3;

// Creates the queue of map parts
export function makeMap() {
  let map = {
    queue: [],
    turret: null,
    turretLoaded: false,
    // Creates and places a map part at the end of the queue
    addMapInQueue: function () {
      this.queue.push(this.makeMap());
      this.queue[this.queue.length - 1].material.opacity = this.opacityLinearFunction(this.queue[this.queue.length - 2].position.z + MAP_Z);
      this.queue[this.queue.length - 1].position.set(0, 0, this.queue[this.queue.length - 2].position.z + MAP_Z);
      this.changeOpacity(this.queue[this.queue.length - 1]);
    },
    makeWall: function () {
      let wallMaterial = new THREE.MeshLambertMaterial({ color: WALL_COLOR });
      wallMaterial.transparent = true;
      let wallGeometry = new THREE.BoxGeometry(MAP_Y, WALL_HEIGHT, MAP_Z);
      let wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.receiveShadow = true;
      wall.castShadow = true;
      return wall;
    },
    // Creates the map along with randomly placed trees
    makeMap: function () {
      let mapMaterial = new THREE.MeshLambertMaterial({ color: MAP_COLOR });
      mapMaterial.transparent = true;
      let mapGeometry = new THREE.BoxGeometry(MAP_X, MAP_Y, MAP_Z);
      let map = new THREE.Mesh(mapGeometry, mapMaterial);
      map.position.set(0.0, 0.0, 0.0);
      map.receiveShadow = true;
      let trees = [];
      for (let i = 0; i < getRndInteger(MIN_NUM_TREES, MAX_NUM_TREES); i++) {
        trees.push(makeRandomTree());
        map.add(trees[trees.length - 1]);
        trees[trees.length - 1].position.set(getRndInteger(0, MAP_X) - (MAP_X / 2),
          (trees[trees.length - 1].geometry.parameters.height + MAP_Y) / 2,
          getRndInteger(0, MAP_Z) - (MAP_Z / 2));
      }
      let rightWall = this.makeWall();
      let leftWall = this.makeWall();
      map.add(rightWall);
      rightWall.position.set(((-0.5) * MAP_X) - MAP_Y, (WALL_HEIGHT + MAP_Y) / 2, 0);
      map.add(leftWall);
      leftWall.position.set((0.5 * MAP_X) + MAP_Y, (WALL_HEIGHT + MAP_Y) / 2, 0)
      if (this.turretLoaded && getRndInteger(0, 100) < 20) {
        let turret = this.turret.clone();
        turret.position.set(getRndInteger(0, MAP_X) - (MAP_X / 2),
          50,
          getRndInteger(0, MAP_Z - 100) - (MAP_Z / 2));
        map.add(turret);

      }
      return map;
    },
    // Remove map from queue and scene
    removeMap: function (scene) {
      this.queue[0].geometry.dispose();
      this.queue[0].material.dispose();
      scene.remove(this.queue[0]);
      this.queue.shift();
    },
    // Function that sets the opacity of an object given the Z of its position
    opacityLinearFunction: function (elementZ) {
      if (elementZ < FADE_START) {
        return 1.0;
      } else {
        return (elementZ * (-1 / (FADE_END - FADE_START))) + (1 + (FADE_START / (FADE_END - FADE_START)));
      }
    },
    // Sets the opacity of a mesh and its children
    changeOpacity: function (element, opacity) {
      if (element.isMesh) {
        element.children.forEach((child) => {
          this.changeOpacity(child, opacity);
        });
        element.material.opacity = opacity;
      } else {
        element.traverse(function (node) {
          if (node.material) {
            node.material.opacity = opacity;
          }
        });
      }
    },
    // Updates the queue of maps by removing the first one from the queue and creating a new map at the end
    updateMapQueue(scene) {
      this.queue.forEach(element => {
        element.position.z -= SPEED;
        if (element.position.z >= FADE_START - SPEED) {
          this.changeOpacity(element, this.opacityLinearFunction(element.position.z));
        }
      });
      if (this.queue[0].position.z <= Z_DESTINATION) {
        this.removeMap(scene)
        this.addMapInQueue();
        scene.add(this.queue[this.queue.length - 1]);
      }
    }
  };
  var loader = new GLTFLoader();
  loader.load("./turret.glb", function (gltf) {
    map.turret = gltf.scene;
    map.turret.traverse(function (child) {
      if (child) {
        child.castShadow = true;
      }
    });
    map.turret.traverse(function (node) {
      if (node.material) {
        node.material.side = THREE.DoubleSide;
        node.material.transparent = true;
        node.material.opacity = 0;
      }
    });
    map.turret.scale.set(10, 10, 10);
    map.turret.rotateY(Math.PI / 2)
    map.turretLoaded = true;
  })
  map.queue.push(map.makeMap());
  for (let i = 1; i < NUM_MAX_MAP; i++) {
    map.addMapInQueue();
  }
  return map;
}

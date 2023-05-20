import * as THREE from 'three';
import { makeRandomTree } from './tree.js';
import { getRndInteger } from './utils.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';

function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Creates the queue of map parts
export function makeMap() {
  let map = {
    MAP_COLOR: "#228b22",
    MAP_X: 500.0,
    MAP_Y: 0.01,
    MAP_Z: 100.0,
    WALL_HEIGHT: 100.0,
    WALL_COLOR: "#808487",
    NUM_MAX_MAP: 15,
    MAX_NON_VISIBLE_MAPS: 2,
    Z_DESTINATION: function () { return this.MAX_NON_VISIBLE_MAPS * this.MAP_Z * (-1) },
    SPEED: 1,
    MIN_NUM_TREES: 5,
    MAX_NUM_TREES: 6,
    FADE_START: 200,
    FADE_END: function () { return (this.NUM_MAX_MAP - 2) * this.MAP_Z },
    MAX_TURRET: 3,
    DISTANCE_TOLERANCE: 20,
    TURRET_SPAWN_CHANCE: 30,
    TURRET_MAX_HP: 5,
    DEATH_FADE_SPEED: 0.05,
    queue: [],
    turrets: [],
    turretsLoaded: [],
    turretsVisible: [],
    turretsBB: [],
    turretsDying: [],
    // Creates and places a map part at the end of the queue
    addMapInQueue: function () {
      this.queue.push(this.makeMap());
      this.queue[this.queue.length - 1].map.position.set(0, 0, this.queue[this.queue.length - 2].map.position.z + this.MAP_Z);
      this.changeOpacity(this.queue[this.queue.length - 1].map, this.opacityLinearFunction(this.queue[this.queue.length - 2].map.position.z + this.MAP_Z));
    },
    makeEdges: function(mesh){
      let edgesGeometry = new THREE.EdgesGeometry(mesh.geometry);
      let edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      let edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.material.transparent = true;
      mesh.add(edges);
    },
    makeWall: function () {
      let wallMaterial = new THREE.MeshLambertMaterial({ color: this.WALL_COLOR });
      wallMaterial.transparent = true;
      let wallGeometry = new THREE.BoxGeometry(this.MAP_Y, this.WALL_HEIGHT, this.MAP_Z);
      let wall = new THREE.Mesh(wallGeometry, wallMaterial);
      this.makeEdges(wall);
      wall.receiveShadow = true;
      wall.castShadow = true;
      return wall;
    },
    // Creates the map along with randomly placed trees
    makeMap: function () {
      let mapPart = {
        map: null,
        turret: -1
      };
      let mapMaterial = new THREE.MeshLambertMaterial({ color: this.MAP_COLOR });
      mapMaterial.transparent = true;
      let mapGeometry = new THREE.BoxGeometry(this.MAP_X, this.MAP_Y, this.MAP_Z);
      let map = new THREE.Mesh(mapGeometry, mapMaterial);
      map.position.set(0.0, 0.0, 0.0);
      map.receiveShadow = true;
      this.makeEdges(map);
      let trees = [];
      let coordinates;
      let collision;
      for (let i = 0; i < getRndInteger(this.MIN_NUM_TREES, this.MAX_NUM_TREES); i++) {
        trees.push(makeRandomTree());
        map.add(trees[trees.length - 1]);
        do {
          coordinates = new THREE.Vector3(getRndInteger(0, (this.MAP_X - this.DISTANCE_TOLERANCE)) - ((this.MAP_X - this.DISTANCE_TOLERANCE) / 2),
            (trees[trees.length - 1].geometry.parameters.height + this.MAP_Y) / 2,
            getRndInteger(0, (this.MAP_Z - this.DISTANCE_TOLERANCE)) - ((this.MAP_Z - this.DISTANCE_TOLERANCE) / 2))
          collision = false;
          trees.forEach((tree) => {
            collision = euclideanDistance(tree.position.x, tree.position.z, coordinates.x, coordinates.z) < this.DISTANCE_TOLERANCE;
            if (collision) {
              return;
            }
          })
        } while (collision);
        trees[trees.length - 1].position.copy(coordinates);
      }
      let rightWall = this.makeWall();
      let leftWall = this.makeWall();
      map.add(rightWall);
      rightWall.position.set(((-0.5) * this.MAP_X) - this.MAP_Y, (this.WALL_HEIGHT + this.MAP_Y) / 2, 0);
      map.add(leftWall);
      leftWall.position.set((0.5 * this.MAP_X) + this.MAP_Y, (this.WALL_HEIGHT + this.MAP_Y) / 2, 0)
      for (let i = 0; i < this.MAX_TURRET; i++) {
        if (this.turretsLoaded[i] && !this.turretsVisible[i] && getRndInteger(0, 100) <= this.TURRET_SPAWN_CHANCE && !this.turretsDying[i]) {
          do {
            coordinates = new THREE.Vector3(getRndInteger(0, (this.MAP_X - this.DISTANCE_TOLERANCE)) - ((this.MAP_X - this.DISTANCE_TOLERANCE) / 2),
              1,
              getRndInteger(0, (this.MAP_Z - this.DISTANCE_TOLERANCE)) - ((this.MAP_Z - this.DISTANCE_TOLERANCE) / 2))
            collision = false;
            trees.forEach((tree) => {
              collision = euclideanDistance(tree.position.x, tree.position.z, coordinates.x, coordinates.z) < this.DISTANCE_TOLERANCE;
              if (collision) {
                return;
              }
            })
          } while (collision);
          map.add(this.turrets[i].mesh);
          this.turrets[i].mesh.visible = true;
          this.turretsVisible[i] = true;
          this.turrets[i].mesh.position.copy(coordinates);
          this.turrets[i].life = this.TURRET_MAX_HP;
          mapPart.turret = i;
          break;
        }
      }
      mapPart.map = map;
      return mapPart;
    },
    disposeAll: function (element, scene) {
      element.children.forEach((child) => {
        if (child.name != "TURRET")
          this.disposeAll(child, scene);
      });
      element.geometry.dispose();
      element.material.dispose();
      scene.remove(element);
    },
    // Remove map from queue and scene
    removeMap: function (scene) {
      this.disposeAll(this.queue[0].map, scene)
      if (this.queue[0].turret != -1) {
        this.turretsVisible[this.queue[0].turret] = false;
      }
      this.queue.shift();
    },
    // Function that sets the opacity of an object given the Z of its position
    opacityLinearFunction: function (elementZ) {
      if (elementZ < this.FADE_START) {
        return 1.0;
      } else {
        return (elementZ * (-1 / (this.FADE_END() - this.FADE_START))) + (1 + (this.FADE_START / (this.FADE_END() - this.FADE_START)));
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
      let dead;
      let death_fade_speed = this.DEATH_FADE_SPEED;
      for (let i = 0; i < this.MAX_TURRET; i++) {
        if (this.turretsDying[i]) {
          this.turrets[i].mesh.traverse(function (node) {
            if (node.material) {
              node.material.opacity -= death_fade_speed;
              dead = node.material.opacity <= 0;
            }
          });
          if (dead) {
            this.turretsDying[i] = false;
            this.turretsVisible[i] = false;
            this.turrets[i].mesh.visible = false;
            for (let j = 0; j < this.NUM_MAX_MAP; j++) {
              if (this.queue[j].turret == i) {
                this.queue[j].turret = -1;
              }
            }
          }
        }
      }
      this.queue.forEach(element => {
        element.map.position.z -= this.SPEED;
        if (element.map.position.z >= this.FADE_START - this.SPEED) {
          this.changeOpacity(element.map, this.opacityLinearFunction(element.map.position.z));
        }
      });
      if (this.queue[0].map.position.z <= this.Z_DESTINATION()) {
        this.removeMap(scene)
        this.addMapInQueue();
        scene.add(this.queue[this.queue.length - 1].map);
      }
    }
  };
  var loader = new GLTFLoader();
  for (let i = 0; i <= map.MAX_TURRET; i++) {
    map.turretsLoaded.push(false);
    map.turretsVisible.push(false);
    map.turretsDying.push(false);
    map.turrets.push({
      mesh: null,
      life: 5,
    })


  }
  for (let i = 0; i <= map.MAX_TURRET; i++) {
    loader.load("./turret.glb", function (gltf) {
      map.turrets[i].mesh = gltf.scene;
      map.turrets[i].mesh.traverse(function (child) {
        if (child) {
          child.castShadow = true;
        }
      });
      map.turrets[i].mesh.traverse(function (node) {
        if (node.material) {
          node.material.side = THREE.DoubleSide;
          node.material.transparent = true;
          node.material.opacity = 0;
        }
      });
      map.turrets[i].mesh.scale.set(10, 10, 10);
      map.turrets[i].mesh.name = "TURRET";
      map.turrets[i].mesh.rotateY(Math.PI / 2);
      map.turretsLoaded[i] = true;
    })

  }
  map.queue.push(map.makeMap());
  for (let i = 1; i < map.NUM_MAX_MAP; i++) {
    map.addMapInQueue();
  }
  return map;
}
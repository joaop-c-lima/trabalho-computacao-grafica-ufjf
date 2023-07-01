import * as THREE from 'three';
import * as DSS from './deathStarSurface.js';
import { getRndInteger } from './utils.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { getDeathStarSurface } from './deathStarSurface.js';

function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Creates the queue of map parts
export function makeMap() {
  let map = {
    NUM_MAX_MAP: 15,
    MAX_NON_VISIBLE_MAPS: 2,
    Z_DESTINATION: function () { return this.MAX_NON_VISIBLE_MAPS * DSS.TRENCH_GROUND_Z * (-1) },
    SPEED: 1,
    MIN_NUM_RELIEF: 5,
    MAX_NUM_RELIEF: 15,
    FADE_START: 500,
    FADE_END: function () { return (this.NUM_MAX_MAP - 2) * DSS.TRENCH_GROUND_Z },
    MAX_TURRET: 3,
    DISTANCE_TOLERANCE: 20,
    TURRET_SPAWN_CHANCE: 30,
    TURRET_MAX_HP: 5,
    DEATH_FADE_SPEED: 0.05,
    queue: [],
    turrets: [],
    // Creates and places a map part at the end of the queue
    addMapInQueue: function () {
      this.queue.push(this.makeMap());
      this.queue[this.queue.length - 1].map.position.set(0, 0, this.queue[this.queue.length - 2].map.position.z + DSS.TRENCH_GROUND_Z);
      this.changeOpacity(this.queue[this.queue.length - 1].map, this.opacityLinearFunction(this.queue[this.queue.length - 2].map.position.z + DSS.TRENCH_GROUND_Z));
    },
    // Creates the map along with randomly placed reliefs and a unique randomly placed turret
    makeMap: function () {
      let mapPart = {
        map: null,
        turret: -1
      };
      let map = getDeathStarSurface();
      let reliefs = [];
      let coordinates;
      let collision;
      for (let i = 0; i < getRndInteger(this.MIN_NUM_RELIEF, this.MAX_NUM_RELIEF); i++) {
        reliefs.push(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), DSS.getMaterial()));
        map.trenchGround.add(reliefs[reliefs.length - 1]);
        do {
          coordinates = new THREE.Vector3(getRndInteger(0, (DSS.TRENCH_GROUND_X - this.DISTANCE_TOLERANCE)) - ((DSS.TRENCH_GROUND_X - this.DISTANCE_TOLERANCE) / 2),
            (10 + DSS.TRENCH_GROUND_Y) / 2,
            getRndInteger(0, (DSS.TRENCH_GROUND_Z - this.DISTANCE_TOLERANCE)) - ((DSS.TRENCH_GROUND_Z - this.DISTANCE_TOLERANCE) / 2))
          collision = false;
          reliefs.forEach((relief) => {
            collision = euclideanDistance(relief.position.x, relief.position.z, coordinates.x, coordinates.z) < this.DISTANCE_TOLERANCE;
            if (collision) {
              return;
            }
          })
        } while (collision);
        reliefs[reliefs.length - 1].position.copy(coordinates);
      }

      for (let i = 0; i < this.MAX_TURRET; i++) {
        if (this.turrets[i].loaded && !this.turrets[i].visible && !this.turrets[i].dying && getRndInteger(0, 100) <= this.TURRET_SPAWN_CHANCE) {
          do {
            coordinates = new THREE.Vector3(getRndInteger(0, (DSS.TRENCH_GROUND_X - this.DISTANCE_TOLERANCE)) - ((DSS.TRENCH_GROUND_X - this.DISTANCE_TOLERANCE) / 2),
              1,
              getRndInteger(0, (DSS.TRENCH_GROUND_Z - this.DISTANCE_TOLERANCE)) - ((DSS.TRENCH_GROUND_Z - this.DISTANCE_TOLERANCE) / 2))
            collision = false;
            reliefs.forEach((relief) => {
              collision = euclideanDistance(relief.position.x, relief.position.z, coordinates.x, coordinates.z) < this.DISTANCE_TOLERANCE;
              if (collision) {
                return;
              }
            })
          } while (collision);
          map.trenchGround.add(this.turrets[i].mesh);
          this.turrets[i].mesh.visible = true;
          this.turrets[i].visible = true;
          this.turrets[i].mesh.position.copy(coordinates);
          this.turrets[i].life = this.TURRET_MAX_HP;
          mapPart.turret = i;
          break;
        }
      }

      mapPart.map = map.trenchGround;
      return mapPart;
    },
    //Dispose a mesh and their children
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
        this.turrets[this.queue[0].turret].visible = false;
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
        if (this.turrets[i].dying) {
          this.turrets[i].mesh.traverse(function (node) {
            if (node.material) {
              node.material.opacity -= death_fade_speed;
              dead = node.material.opacity <= 0;
            }
          });
          if (dead) {
            console.log("OPA")
            this.turrets[i].dying = false;
            this.turrets[i].visible = false;
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
    map.turrets.push({
      mesh: null,
      loaded: false,
      visible: false,
      dying: false,
      life: 5,
    })
  }
  for (let i = 0; i <= map.MAX_TURRET; i++) {
    loader.load("./customObjects/turbolaser.glb", function (gltf) {
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
      map.turrets[i].loaded = true;
    })

  }
  map.queue.push(map.makeMap());
  for (let i = 1; i < map.NUM_MAX_MAP; i++) {
    map.addMapInQueue();
  }
  return map;
}
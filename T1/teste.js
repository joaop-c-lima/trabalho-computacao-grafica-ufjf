import * as THREE from 'three';

// inicializa a cena, a câmera e o renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// adiciona um objeto à cena
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// armazena as coordenadas do mouse
let mouseX = 0, mouseY = 0;

// adiciona um listener de eventos mousemove na janela
window.addEventListener('mousemove', event => {
  // atualiza as coordenadas do mouse
  mouseX = event.clientX;
  mouseY = event.clientY;
});

function animate() {
  requestAnimationFrame(animate);

  // rotaciona o cubo com base nas coordenadas do mouse
  cube.rotation.x += mouseY * 0.0001;
  cube.rotation.y += mouseX * 0.0001;

  // renderiza a cena
  renderer.render(scene, camera);
}
animate();

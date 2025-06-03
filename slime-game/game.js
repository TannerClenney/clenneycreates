let scene, camera, renderer, ball;
let velocity = new THREE.Vector3(0, 0, -0.2);
let yVelocity = 0;
let horizontalVelocity = 0;
const gravity = -0.01;
const jumpDampen = 0.3;
const maxHorizontalSpeed = 0.3;
const keys = {};
const platformChunks = [];
const slimeObstacles = [];
let lastPlatformZ = -100;
let score = 0;
let scoreText;
let isGrounded = false;

init();
animate();

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.position.y = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10).normalize();
  scene.add(light);

  // Ball
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 2, 0);
  scene.add(ball);

  // UI
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '10px';
  div.style.left = '10px';
  div.style.color = 'white';
  div.style.fontSize = '24px';
  div.style.fontFamily = 'monospace';
  div.innerText = `Score: 0`;
  document.body.appendChild(div);
  scoreText = div;

  spawnPlatformChunk(-40);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window

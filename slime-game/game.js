let scene, camera, renderer, ball;
let velocity = new THREE.Vector3(0, 0, -0.2);
let yVelocity = 0;
let horizontalVelocity = 0;
const gravity = -0.01;
const jumpForce = 0.25;
const jumpDampen = 0.3;
const maxHorizontalSpeed = 0.3;
const keys = {};
const platformChunks = [];
const slimeObstacles = [];
let lastPlatform = { x: 0, y: 0, z: 0 };
let lastPlatformZ = -30; // Starts earlier
let score = 0;
let scoreText;
let isGrounded = false;

init();
animate();

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') e.preventDefault();
});
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0x9999ff, 0.5));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10);
  scene.add(light);

  // Ball (player)
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 2, 0);
  scene.add(ball);

  // UI
  scoreText = document.createElement('div');
  scoreText.style.position = 'absolute';
  scoreText.style.top = '10px';
  scoreText.style.left = '10px';
  scoreText.style.color = 'white';
  scoreText.style.fontSize = '24px';
  scoreText.style.fontFamily = 'monospace';
  scoreText.innerText = `Score: 0`;
  document.body.appendChild(scoreText);

  // Starting platform
  spawnPlatformChunk(0, 0, -1);
}

function spawnPlatformChunk(zPos, forceX = null, forceY = null) {
  const width = 10 + Math.random() * 4;
  const depth = 20;
  const height = 1;

  const maxXDist = 6;
  const maxYDrop = 2;
  const minZGap = 22;
  const maxZGap = 25;

  let x = (forceX !== null) ? forceX : lastPlatform.x + (Math.random() * 2 - 1) * maxXDist;
  let y = (forceY !==

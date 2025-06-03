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
let lastPlatformZ = 10;
let score = 0;
let scoreText;
let isGrounded = false;

init();
animate();

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') e.preventDefault(); // prevent page scroll on space
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.position.y = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0x9999ff, 0.5);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10).normalize();
  scene.add(light);

  // Ball
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 2, 20); // Starting Z is now 20
  scene.add(ball);

  // UI
  const div = document.createElement('div');
  div.id = "score";
  div.style.position = 'absolute';
  div.style.top = '10px';
  div.style.left = '10px';
  div.style.color = 'white';
  div.style.fontSize = '24px';
  div.style.fontFamily = 'monospace';
  div.innerText = `Score: 0`;
  document.body.appendChild(div);
  scoreText = div;

  // Start platform
  spawnPlatformChunk(10, 0, 0); // Raised start
  lastPlatformZ = 0;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function spawnPlatformChunk(zPos, forceX = null, forceY = null) {
  const width = 8 + Math.random() * 6;
  const depth = 20 + Math.random() * 10;
  const height = 1;

  const maxXDist = 7;
  const maxYDrop = 2;
  const minZGap = 20;
  const maxZGap = 25;

  let xOffset = (forceX !== null) ? forceX : lastPlatform.x + (Math.random() * 2 - 1) * maxXDist;
  let yLevel = (forceY !== null) ? forceY : lastPlatform.y - Math.random() * maxYDrop;
  let zOffset = lastPlatform.z - (minZGap + Math.random() * (maxZGap - minZGap));

  // Clamp
  xOffset = Math.max(Math.min(xOffset, 15), -15);
  yLevel = Math.max(yLevel, -3);

  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x77ff77,
    metalness: 0.2,
    roughness: 0.6
  });
  const platform = new THREE.Mesh(geo, mat);
  platform.position.set(xOffset, yLevel, zOffset);
  platform.rotation.x = (Math.random() * 10 - 5) * (Math.PI / 180); // varied slope
  scene.add(platform);
  platformChunks.push(platform);

  lastPlatform = { x: xOffset, y: yLevel, z: zOffset };

  // Slime obstacle
  if (Math.random() < 0.4 && zOffset

// Slope-inspired slime game.js with safe tutorial zone
let scene, camera, renderer, ball;
let velocity = new THREE.Vector3(0, 0, -0.25);
let yVelocity = 0;
let horizontalVelocity = 0;
const gravity = -0.01;
const maxHorizontalSpeed = 0.4;
const jumpForce = 0.25;
const jumpDampen = 0.4;
const keys = {};
const platformChunks = [];
let lastPlatform = { x: 0, y: -1, z: 0 };
let score = 0;
let scoreText;
let isGrounded = false;
let speedMultiplier = 1;
let platformCount = 0;
const SAFE_PLATFORM_COUNT = 10;

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
  camera.position.set(0, 5, 15);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10);
  scene.add(light);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 0.5, 1);
  scene.add(ball);

  scoreText = document.createElement('div');
  scoreText.style.position = 'absolute';
  scoreText.style.top = '10px';
  scoreText.style.left = '10px';
  scoreText.style.color = 'white';
  scoreText.style.fontSize = '24px';
  scoreText.style.fontFamily = 'monospace';
  scoreText.innerText = `Score: 0`;
  document.body.appendChild(scoreText);

  for (let i = 0; i < 300; i++) {
    spawnPlatform();
  }
}

function spawnPlatform() {
  const width = 10;
  const depth = 20;
  const height = 1;
  let x, y, z;

  if (platformCount < SAFE_PLATFORM_COUNT) {
    // Tutorial zone: safe platforms
    x = lastPlatform.x;
    y = lastPlatform.y;
    z = lastPlatform.z - 1.8; // Safe reach distance
  } else {
    // Slope mode
    const curveAmplitude = 2;
    const curveFrequency = 0.05;
    x = Math.sin(-lastPlatform.z * curveFrequency) * curveAmplitude;
    y = lastPlatform.y - 0.01; // slight slope
    z = lastPlatform.z - 2.5;
  }

  const geo = new THREE.BoxGeometry(width, height, depth);
  geo.rotateX(-0.05);
  const mat = new THREE.MeshStandardMaterial({ color: 0x223322 });
  const platform = new THREE.Mesh(geo, mat);
  platform.position.set(x, y, z);
  scene.add(platform);
  platformChunks.push(platform);

  lastPlatform = { x, y, z };
  platformCount++;
}

function animate() {
  requestAnimationFrame(animate);

  if (keys['a'] || keys['arrowleft']) {
    horizontalVelocity = Math.max(horizontalVelocity - 0.02, -maxHorizontalSpeed);
  } else if (keys['d'] || keys['arrowright']) {
    horizontalVelocity = Math.min(horizontalVelocity + 0.02, maxHorizontalSpeed);
  } else {
    horizontalVelocity *= 0.9;
  }

  if ((keys[' '] || keys['space']) && isGrounded) {
    yVelocity = jumpForce;
    isGrounded = false;
  }

  yVelocity += gravity;
  isGrounded = false;

  for (const platform of platformChunks) {
    const dx = Math.abs(ball.position.x - platform.position.x);
    const dz = Math.abs(ball.position.z - platform.position.z);
    const platformTop = platform.position.y + 1.5;
    if (dx < 10 && dz < 15 && ball.position.y <= platformTop + 0.1 && ball.position.y > platformTop - 2) {
      ball.position.y = platformTop;
      yVelocity = -yVelocity * jumpDampen;
      isGrounded = true;
    }
  }

  speedMultiplier += 0.0001;
  velocity.z = -0.25 * speedMultiplier;

  ball.position.x += horizontalVelocity;
  ball.position.y += yVelocity;
  ball.position.z += velocity.z;

  camera.position.z = ball.position.z + 15;
  camera.position.x = ball.position.x;
  camera.position.y = ball.position.y + 5;
  camera.lookAt(ball.position.x, ball.position.y, ball.position.z);

  score += 0.1 * speedMultiplier;
  scoreText.innerText = `Score: ${Math.floor(score)}`;

  if (ball.position.y < -10) {
    endGame("You fell! Oops!");
    return;
  }

  renderer.render(scene, camera);
}

function endGame(message) {
  const finalScore = Math.floor(score);
  const high = Math.max(finalScore, localStorage.getItem("slimeHigh") || 0);
  localStorage.setItem("slimeHigh", high);
  alert(`${message}\nScore: ${finalScore}\nHigh Score: ${high}`);
  location.reload();
}


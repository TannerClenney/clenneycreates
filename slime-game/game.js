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
let lastPlatform = { x: 0, y: -1, z: -40 };
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
  scene.background = new THREE.Color(0x000000); // Dark background for contrast

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.position.y = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0x9999ff, 0.5); // Soft glow
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10).normalize();
  scene.add(light);

  // Ball (player)
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 2, 0);
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

  // Starting platform
  spawnPlatformChunk(-10, 0, -1);
  lastPlatformZ = -40;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function spawnPlatformChunk(zPos, forceX = null, forceY = null) {
  const skip = Math.random() < 0.15 && zPos !== -10;
  if (skip) return;

  const width = 10 + Math.random() * 5;
  const depth = 30;
  const height = 1;

  const maxXDist = 10;
  const maxYDrop = 3;

  let xOffset = (forceX !== null) ? forceX : lastPlatform.x + (Math.random() * 2 - 1) * maxXDist;
  let yLevel = (forceY !== null) ? forceY : lastPlatform.y - Math.random() * maxYDrop;
  let zOffset = zPos;

  // Clamp values
  xOffset = Math.max(Math.min(xOffset, 15), -15);
  yLevel = Math.max(yLevel, -3);

  const angle = (Math.random() * 10 - 5) * (Math.PI / 180);

  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x77ff77, // Bright slime-green
    metalness: 0.2,
    roughness: 0.6
  });
  const platform = new THREE.Mesh(geo, mat);
  platform.position.set(xOffset, yLevel, zOffset);
  platform.rotation.x = angle;
  scene.add(platform);
  platformChunks.push(platform);

  lastPlatform = { x: xOffset, y: yLevel, z: zOffset };

  // Add slime obstacle
  if (Math.random() < 0.4 && zOffset !== -10) {
    const slimeGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const slimeMat = new THREE.MeshStandardMaterial({
      color: 0xff33cc,
      emissive: 0xff33cc,
      emissiveIntensity: 0.3
    });
    const slime = new THREE.Mesh(slimeGeo, slimeMat);
    slime.position.set(xOffset + (Math.random() * 6 - 3), yLevel + 1, zOffset + Math.random() * 20 - 10);
    scene.add(slime);
    slimeObstacles.push(slime);
  }
}

function animate() {
  requestAnimationFrame(animate);

  // Input
  if (keys['a'] || keys['arrowleft']) {
    horizontalVelocity = Math.max(horizontalVelocity - 0.02, -maxHorizontalSpeed);
  } else if (keys['d'] || keys['arrowright']) {
    horizontalVelocity = Math.min(horizontalVelocity + 0.02, maxHorizontalSpeed);
  } else {
    horizontalVelocity *= 0.9;
  }

  // Apply gravity
  yVelocity += gravity;
  isGrounded = false;

  // Platform collisions
  for (const platform of platformChunks) {
    const p = platform.position;
    const onX = Math.abs(ball.position.x - p.x) < 10;
    const onZ = Math.abs(ball.position.z - p.z) < 15;
    const heightY = p.y + 1.5;

    if (onX && onZ && ball.position.y <= heightY + 0.1 && ball.position.y > heightY - 2) {
      ball.position.y = heightY;
      yVelocity = -yVelocity * jumpDampen;
      isGrounded = true;
    }
  }

  // Movement
  ball.position.x += horizontalVelocity;
  ball.position.z += velocity.z;
  ball.position.y += yVelocity;

  // Visual feedback
  ball.rotation.z += horizontalVelocity * 0.1;
  ball.rotation.x += yVelocity * 0.1;

  // Camera tracking
  camera.position.z += (ball.position.z + 10 - camera.position.z) * 0.1;
  camera.position.x += (ball.position.x - camera.position.x) * 0.1;
  camera.position.y += ((ball.position.y + 5) - camera.position.y) * 0.05;
  camera.lookAt(ball.position.x, ball.position.y, ball.position.z);

  // Platform generation
  while (lastPlatformZ > ball.position.z - 200) {
    spawnPlatformChunk(lastPlatformZ);
    lastPlatformZ -= 30;
  }

  // Cleanup
  platformChunks.forEach((chunk, i) => {
    if (chunk.position.z > ball.position.z + 50) {
      scene.remove(chunk);
      platformChunks.splice(i, 1);
    }
  });

  slimeObstacles.forEach((slime, i) => {
    if (slime.position.z > ball.position.z + 50) {
      scene.remove(slime);
      slimeObstacles.splice(i, 1);
    }
  });

  // Slime collision
  for (const slime of slimeObstacles) {
    if (ball.position.distanceTo(slime.position) < 1.2) {
      endGame("SLIME SPLAT! Try again.");
      return;
    }
  }

  // Fall detection
  if (ball.position.y < -10) {
    endGame("You fell! Oops!");
    return;
  }

  // Score
  score += 0.1;
  scoreText.innerText = `Score: ${Math.floor(score)}`;

  renderer.render(scene, camera);
}

function endGame(message) {
  const finalScore = Math.floor(score);
  const high = Math.max(finalScore, localStorage.getItem("slimeHigh") || 0);
  localStorage.setItem("slimeHigh", high);
  alert(`${message}\nScore: ${finalScore}\nHigh Score: ${high}`);
  location.reload();
}


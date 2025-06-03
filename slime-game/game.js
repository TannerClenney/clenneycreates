let scene, camera, renderer, ball;
let ballVelocity = new THREE.Vector3(0, 0, -0.2);
let horizontalVelocity = 0;
const maxHorizontalSpeed = 0.3;
const keys = {};
const platformChunks = [];
const slimeObstacles = [];
let lastPlatformZ = -100;
let score = 0;
let scoreText;

init();
animate();

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.position.y = 5;
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10).normalize();
  scene.add(light);

  // Ball (player)
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.y = 1;
  scene.add(ball);

  // Initial platform
  spawnPlatformChunk(-40);

  // Score text
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

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function spawnPlatformChunk(zPos) {
  const shouldHaveGap = Math.random() < 0.2; // 20% chance to skip
  if (shouldHaveGap) return;

  const width = 10 + Math.random() * 10;
  const depth = 30;
  const height = 1;
  const xOffset = (Math.random() - 0.5) * 10;

  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const platform = new THREE.Mesh(geo, mat);
  platform.position.set(xOffset, -1, zPos);
  scene.add(platform);
  platformChunks.push(platform);

  // Possibly add a slime obstacle
  if (Math.random() < 0.4) {
    const slimeGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const slimeMat = new THREE.MeshStandardMaterial({ color: 0xff33cc, roughness: 0.4 });
    const slime = new THREE.Mesh(slimeGeo, slimeMat);
    slime.position.set(xOffset + (Math.random() * 6 - 3), 0, zPos + Math.random() * 20 - 10);
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

  // Movement
  ball.position.x += horizontalVelocity;
  ball.position.z += ballVelocity.z;

  // Camera follow
  camera.position.z = ball.position.z + 10;
  camera.position.x = ball.position.x;
  camera.lookAt(ball.position.x, ball.position.y, ball.position.z);

  // Spawn new platforms
  while (lastPlatformZ > ball.position.z - 200) {
    spawnPlatformChunk(lastPlatformZ);
    lastPlatformZ -= 30;
  }

  // Cleanup
  for (let i = platformChunks.length - 1; i >= 0; i--) {
    if (platformChunks[i].position.z > ball.position.z + 50) {
      scene.remove(platformChunks[i]);
      platformChunks.splice(i, 1);
    }
  }

  for (let i = slimeObstacles.length - 1; i >= 0; i--) {
    if (slimeObstacles[i].position.z > ball.position.z + 50) {
      scene.remove(slimeObstacles[i]);
      slimeObstacles.splice(i, 1);
    }
  }

  // Collision check (simple distance)
  for (const slime of slimeObstacles) {
    const dist = ball.position.distanceTo(slime.position);
    if (dist < 1.2) {
      alert("You hit slime! Game Over.\nFinal Score: " + Math.floor(score));
      location.reload();
      return;
    }
  }

  // Score update
  score += 0.1;
  scoreText.innerText = `Score: ${Math.floor(score)}`;

  renderer.render(scene, camera);
}

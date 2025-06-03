let scene, camera, renderer, ball;
let ballVelocity = new THREE.Vector3(0, 0, -0.2); // Constant forward motion
let horizontalVelocity = 0;
const maxHorizontalSpeed = 0.3;
const keys = {};

init();
animate();

// Handle key events
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.position.y = 5;
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10).normalize();
  scene.add(light);

  // Ball (Player)
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.y = 1;
  scene.add(ball);

  // Floor
  const floorGeo = new THREE.BoxGeometry(20, 1, 100);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -1;
  floor.position.z = -40;
  scene.add(floor);

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Handle input
  if (keys['a'] || keys['arrowleft']) {
    horizontalVelocity = Math.max(horizontalVelocity - 0.02, -maxHorizontalSpeed);
  } else if (keys['d'] || keys['arrowright']) {
    horizontalVelocity = Math.min(horizontalVelocity + 0.02, maxHorizontalSpeed);
  } else {
    horizontalVelocity *= 0.9;
  }

  // Apply movement
  ball.position.x += horizontalVelocity;
  ball.position.z += ballVelocity.z;

  // Move the camera with the ball
  camera.position.z = ball.position.z + 10;
  camera.position.x = ball.position.x;
  camera.lookAt(ball.position.x, ball.position.y, ball.position.z);

  renderer.render(scene, camera);
}

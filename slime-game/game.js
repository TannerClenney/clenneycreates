let scene, camera, renderer, ball;

init();
animate();

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

  // Ball
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  ball = new THREE.Mesh(geometry, material);
  ball.position.y = 1;
  scene.add(ball);

  // Floor (start)
  const floorGeo = new THREE.BoxGeometry(20, 1, 100);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -1;
  floor.position.z = -40;
  scene.add(floor);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Example: Slowly move the ball forward
  ball.position.z -= 0.1;

  // Follow the ball with the camera
  camera.position.z = ball.position.z + 10;

  renderer.render(scene, camera);
}


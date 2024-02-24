let params = {
  color: "#FFF"
};

let cube;

function setupThree() {
  cube = getBox();
  scene.add(cube);

  cube.position.set(1, 0, 0); //(x, y, z);
  cube.scale.x = 100;
  cube.scale.y = 100;
  cube.scale.z = 100;

  // setup gui
  // gui.add(cube.scale, "x").min(1).max(200).step(0.1);
  // gui.add(cube.scale, "y").min(1).max(200).step(0.1);
  // gui.add(cube.scale, "z").min(1).max(200).step(0.1);
  // gui.addColor(params, "color");
}

function updateThree() {
  // cube.material.color.set(params.color);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}

function getBox() {
  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const geometry = new THREE.PlaneGeometry(1, 1);
  // const geometry = new THREE.SphereGeometry(1, 32, 16); //(radius, widthSegments, heightSegments)
  const geometry = new THREE.TorusGeometry(1, 0.25, 16, 3); //(radius, tube, radialSegments, tubularSegments, arc)

  const material = new THREE.MeshBasicMaterial({
    // color: 0xffffff,
    // wireframe: true,
    // side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
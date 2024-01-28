let params = {
  // (add)
};

let cube;
let sphere;
let cubes = [];

function setupThree() {
  /*
  for (let y = -500; y <= 500; y += 100) {
    for (let x = -500; x <= 500; x += 100) {
      cube = getBox();
      scene.add(cube);
      // transformations!
      cube.scale.set(50, 50, 50);
      cube.position.set(x, y, 0);
      cube.rotation.set(0, 0, 0);
    }
  }
  */

  /*
  for (let angle = 0; angle < 360; angle += 72) {
    const mag = 100;
    let x = cos(radians(angle)) * mag;
    let y = sin(radians(angle)) * mag;

    cube = getBox();
    scene.add(cube);
    // transformations!
    cube.scale.set(50, 50, 50);
    cube.position.set(x, y, 0);
    cube.rotation.set(0, 0, 0);
  }
  */
  for (let angle = 0; angle < 360; angle += 72) {
    cube = getBox();
    scene.add(cube);
    cube.scale.set(500, 50, 50);
    cube.geometry.translate(0.2, 0, 0); // ***
    cube.rotation.z = radians(angle);

    cubes.push(cube);
  }
};

function updateThree() {
  for (const cube of cubes) {
    cube.rotation.x += 0.01;
  }
}

function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getSphere() {
  const geometry = new THREE.SphereGeometry(1, 6, 6);
  const material = new THREE.MeshNormalMaterial({
    color: 0x00ff00,
    // wireframe: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
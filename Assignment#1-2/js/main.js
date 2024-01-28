let params = {
  color: "#FFF"
};

let cube;
let boxSize = 500;
let cubeSize = 50;
function setupThree() {

  for (let y = -boxSize / 2; y <= boxSize / 2; y += 100) {
    for (let x of [-boxSize / 2, boxSize / 2]) {
      for (let z of [-boxSize / 2, boxSize / 2]) {
        cube = getBox();
        scene.add(cube);
        cube.position.set(x, y, z);
        cube.scale.set(cubeSize, cubeSize, cubeSize);
      }
    }
  }

  for (let x = -boxSize / 2; x <= boxSize / 2; x += 100) {
    for (let y of [-boxSize / 2, boxSize / 2]) {
      for (let z of [-boxSize / 2, boxSize / 2]) {
        cube = getBox();
        scene.add(cube);
        cube.position.set(x, y, z);
        cube.scale.set(cubeSize, cubeSize, cubeSize);
      }
    }
  }

  for (let z = -boxSize / 2; z <= boxSize / 2; z += 100) {
    for (let y of [-boxSize / 2, boxSize / 2]) {
      for (let x of [-boxSize / 2, boxSize / 2]) {
        cube = getBox();
        scene.add(cube);
        cube.position.set(x, y, z);
        cube.scale.set(cubeSize, cubeSize, cubeSize);
      }
    }
  }


}

function updateThree() {
}

function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial({
    color: 0xffffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
let params = {
  color: "#FFF"
};


let boxSize = 500;
let cubeSize = 5;
let cubeLength = 3;
let item = [];
let frameCount = 0;
let interval = 50;
let num = boxSize / interval + 1;
function setupThree() {
  console.log(num);
  let i = 0; // item index
  for (let y = -boxSize / 2; y <= boxSize / 2; y += interval) {
    // console.log(y);
    for (let x of [-boxSize / 2, boxSize / 2]) {
      for (let z of [-boxSize / 2, boxSize / 2]) {
        item.push([]);
        cube = getBox();
        scene.add(cube);
        cube.position.set(x, y, z);
        cube.scale.set(cubeLength * cubeSize, cubeSize, cubeSize);
        item[i].push(cube);
        cube = getBox();
        scene.add(cube);
        cube.position.set(x, y, z);
        cube.scale.set(cubeSize, cubeLength * cubeSize, cubeSize);
        item[i].push(cube);
        cube = getBox();
        scene.add(cube);
        cube.position.set(x, y, z);
        cube.scale.set(cubeSize, cubeSize, cubeLength * cubeSize);
        item[i].push(cube);
        i++;

      }
    }
  }
  console.log(item);


}

function updateThree() {
  frameCount += 1;
  index = 0;
  degInterval = 120 / num;
  // console.log(degInterval);
  for (const group of item) {
    index++;
    sizeVar = cubeSize * sin(radians(frameCount) + degInterval * index);
    group[0].scale.set(cubeLength * sizeVar, sizeVar, sizeVar);
    group[1].scale.set(sizeVar, sizeVar * sizeVar, sizeVar);
    group[2].scale.set(sizeVar, sizeVar, sizeVar * sizeVar);


  }
}

function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial({
    // color: 0xffffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
let params = {
  color: "#FFF" // for gui
};


let cubes = [];
let sizeRange = [10, 40, 20, 50, 60, 30]; // 0~range
let interval = [20, 30, 40, 40, 10];
let centerSize = 80;
let timeCycle = 1500;
let diameter = [];
let grow = [];
let size = [];


function setupThree() {
  //initialize
  for (let i = 0; i < sizeRange.length - 1; i++) {
    size.push(i / (sizeRange.length - 1) * sizeRange[i]);
  }
  size.push(sizeRange[sizeRange.length - 1] - 1);
  console.log("size", size);

  for (let i = 0; i < sizeRange.length; i++) {
    grow.push(-1 * sizeRange[i] / timeCycle); // grow speed = range/time
  }
  console.log("grow", grow);

  for (let i = 0; i < sizeRange.length; i++) {
    dis = centerSize;
    for (let j = 0; j < i; j++) {
      dis += interval[j];
    }
    diameter.push(dis);
  }
  console.log(diameter);

  // meshes
  for (let i = 0; i < sizeRange.length; i++) {
    cubes.push([]);
    startX = i % 2 == 0 ? 0 : 10;
    for (let x = startX; x < 360; x += 20) {
      let cube = getBox();
      scene.add(cube);
      cube.scale.set(size[i], size[i], size[i]);
      cube.position.set(sin(radians(x)) * diameter[i], cos(radians(x)) * diameter[i], i * 50);
      cube.rotation.z = radians(90 - x);
      cube.geometry.translate(2, 0, 0);
      cubes[i].push(cube);
    }
  }
  console.log(cubes);
}

function updateThree() {
  // cube.rotation.x -= cos(radians(i * 30)) * 0.01;
  // cube.rotation.y += sin(radians(i * 30)) * 0.01;
  for (let layer = 0; layer < sizeRange.length; layer++) {
    for (let i = 0; i < cubes[layer].length; i++) {
      cube = cubes[layer][i];
      if (size[layer] >= sizeRange[layer] || size[layer] <= 0) {
        grow[layer] *= -1;
      }
      size[layer] += grow[layer];
      cube.scale.set(size[layer], size[layer], size[layer]);
      cube.rotation.z += 0.01;
    }
  }
  // console.log("size", size);

}

function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xffea00 });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}


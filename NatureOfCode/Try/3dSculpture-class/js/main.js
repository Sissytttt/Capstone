
let params = {
  color: "#FFF"
};

let array = []
let numLayer = 5;
const WORLD_SIZE = 1000;
let pointCloud;


function setupThree() {
  let Ctree = new Tree(numLayer)
    .setPosition(1, 1, 1)
    .setRotationAngle(0.1, 0, 0)
    .setRotationVelocity(0.01, 0, 0);
  array.push(Ctree);
  pointCloud = getPoints();
  scene.add(pointCloud);
}

function updateThree() {
  // for (let i = 0; i < numLayer; i++) {
  //   array[i].rotation.z += 0.01;
  // }
  for (let c of array) {
    // c.move();
    c.rotate();
    c.update();
  }
  // cube.material.color.set(params.color);
  pointCloud.position.y -= 0.05;
}


function getPoints() {
  const vertices = [];
  const geometry = new THREE.BufferGeometry();
  for (let i = 0; i < 50000; i++) {
    let x = random(-WORLD_SIZE / 2, WORLD_SIZE / 2);
    let y = random(-WORLD_SIZE / 2, WORLD_SIZE / 2);
    let z = random(-WORLD_SIZE / 2, WORLD_SIZE / 2);
    vertices.push(x, y, z);
  }
  // const vertices = new Float32Array([
  //   -1.0, -1.0, 1.0,
  //   1.0, -1.0, 1.0,
  //   1.0, 1.0, 1.0,

  //   1.0, 1.0, 1.0,
  //   -1.0, 1.0, 1.0,
  //   -1.0, -1.0, 1.0
  // ]);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0xFFFFFF });
  const points = new THREE.Points(geometry, material);
  return points;
}


function getLayer(size) {
  const geometry = new THREE.TorusGeometry(size, 0.25, 16, 5);
  const material = new THREE.MeshBasicMaterial({
    color: 0x0E9212,
    // side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function getTree(num) {
  for (let i = 0; i < num; i++) {
    layer = this.getLayer((i + 1) / 4);
    scene.add(layer);
    layer.position.set(1, 200 - (i * 50), 0); //(x, y, z);
    layer.scale.set(100, 100, 100);
    layer.rotation.z = Math.random() * 360 * Math.PI / 180;
    layer.rotation.x = Math.PI / 2;
    array.push(layer);
  }
}
class Tree {
  constructor(layerNum) {
    // this.layerNum = layerNum;
    this.position = createVector();
    this.rotation = createVector();
    this.rotateVel = createVector();
    this.mesh = getTree(layerNum);
  }

  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }

  setRotationAngle(x, y, z) {
    this.rot = createVector(x, y, z);
    return this;
  }
  setRotationVelocity(x, y, z) {
    this.rotVel = createVector(x, y, z);
    return this;
  }
  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }
  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.set(this.rot.x, this.rot.y, this.rot.z);
    this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
}
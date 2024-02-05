let params = {
  color: "#FFF"
};

let balls = [];
const mouse = new THREE.Vector3();

function setupThree() {
  for (let i = 0; i < 10; i++) {
    let b = new Ball()
      .setPos(random(-1000, 1000), random(-1000, 1000), random(-1000, 1000))
      .setDir()
      .setSpd()
      .setScl(5);
    balls.push(b);
  }
  // console.log(balls[0]);
}

function updateThree() {
  for (let b of balls) {
    b.update();
    b.move();
  }
  // console.log(mouse.x, mouse.y);
  // console.log(balls[0].dir.x, balls[0].dir.y)
}

function getSphere() {
  const geometry = new THREE.SphereGeometry(1, 6, 6);
  const material = new THREE.MeshNormalMaterial({
    // color: 0x00ff00,
    // wireframe: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

class Ball {
  constructor() {
    this.pos = createVector();
    this.spd = createVector();
    this.dir = createVector();
    this.scl = createVector();
    // this.force = createVector();
    this.spdLimit = 5;
    this.mesh = getSphere();
    this.topSpd = 10;
  }

  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }

  setSpd() {
    this.spd = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
    return this;
  }

  setDir() {
    this.dir = createVector(mouse.x, mouse.y, mouse.z);
    return this;
  }

  setScl(x, y = x, z = x) {
    this.scl = createVector(x, y, z);
    return this;
  }

  move() {
    this.dir.x = mouse.x;
    this.dir.y = mouse.y;
    this.dir.z = 0;
    // console.log(this.dir.x, this.dir.y);
    this.dir.sub(this.pos);
    this.dir.normalize().div(5);
    this.spd.add(this.dir);
    this.spd.limit(this.topSpd);
    this.pos.add(this.spd);
  }

  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
}


// event listener
window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouse.z = 0;
}


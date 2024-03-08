

let balls = [];

function setupThree() {
  for (let i = 0; i < 10000; i++) {
    let b = new Ball()
      .setR(50)
      .setPos()
      .setAcc()
      .setVel(1, 2)
      .setScl(2);
    balls.push(b);
  }
  // console.log(balls[0]);
}

function updateThree() {
  for (let b of balls) {
    b.turn();
    b.update();

  }
}

function getSphere() {
  const geometry = new THREE.SphereGeometry(1, 6
    , 6);
  const material = new THREE.MeshNormalMaterial({
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}



class Ball {
  constructor() {
    this.r;
    this.cen = createVector(0, 0, 0);
    this.pos = createVector();
    this.acc = createVector();
    this.vel_ori = createVector();
    this.vel = createVector();
    this.vel_top;
    this.mesh = getSphere();
    this.scl = createVector();
  }

  setR(r) {
    this.r = r;
    return this;
  }

  setPos() {
    this.pos = createVector(sin(radians(random(0, 90))) * this.r, sin(radians(random(0, 90))) * this.r, 0);
    return this;
  }

  setAcc() {
    this.acc = p5.Vector.sub(this.cen, this.pos);
    // console.log(this.acc.x, this.acc.y, this.acc.z);
    return this;
  }

  setVel(start, top) {
    this.vel_ori = createVector(start, 0, 0);
    this.vel = createVector(this.vel_ori.x, this.vel_ori.y, this.vel_ori.z);
    this.vel_top = top;
    return this;
  }

  setScl(x, y = x, z = x) {
    this.scl = createVector(x, y, z);
    return this;
  }

  turn() {
    this.acc = p5.Vector.sub(this.cen, this.pos);
    this.acc.setMag(this.vel_ori.magSq() / this.r);
    this.vel.mult(1.005);
    this.vel.limit(this.vel_top);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }

  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
}




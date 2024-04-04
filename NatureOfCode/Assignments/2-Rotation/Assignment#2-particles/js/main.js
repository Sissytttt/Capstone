let params = {
  color: "#FFF",
  particleNum: 0,
};


const NUM_OF_PARTICLES = 50000;
let pointCloud;
let particles = [];

function setupThree() {

  pointCloud = getPoints(NUM_OF_PARTICLES);
  scene.add(pointCloud);


  for (let i = 0; i < 10000; i++) {
    let b = new Particle()
      .setR(30)
      .setPos()
      .setAcc()
      .setVel(1, 2)
      .setScl(2);
    particles.push(b);
  }
}

function updateThree() {
  for (const p of particles) {
    p.turn();
    // p.update();
    p.age();
  }


  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (p.isDone) {
      particles.splice(i, 1);
      i--; // *** not flipped version! ***
    }
  }

  while (particles.length > NUM_OF_PARTICLES) {
    particles.splice(0, 1);
  }


  let positionArray = pointCloud.geometry.attributes.position.array;
  let colorArray = pointCloud.geometry.attributes.color.array;
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let ptIndex = i * 3;
    // position
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
    // color
    colorArray[ptIndex + 0] = p.color.r * p.lifespan;
    colorArray[ptIndex + 1] = p.color.g * p.lifespan;
    colorArray[ptIndex + 2] = p.color.b * p.lifespan;
  }

  pointCloud.geometry.setDrawRange(0, particles.length);
  pointCloud.geometry.attributes.position.needsUpdate = true; // ***
  pointCloud.geometry.attributes.color.needsUpdate = true; // ***
}


function getPoints(maxNum) {
  const vertices = new Float32Array(maxNum * 3); // x, y, z
  const colors = new Float32Array(maxNum * 3); // r, g, b

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    // color: 0xFFFF00,
    vertexColors: true,

    transparent: true,
    opacity: 0.9,

    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  return points;
}

class Particle {
  constructor() {
    this.r;
    this.cen = createVector(0, 0, 0);
    this.pos = createVector();
    this.acc = createVector();
    this.vel_ori = createVector();
    this.vel = createVector();
    this.vel_top;
    this.scl = createVector();

    this.lifespan = 1.0;
    // this.lifeReduction = random(0.005, 0.0001);
    this.lifeReduction = 0;
    // this.lifeReduction = random(0.05, 0.1);
    this.isDone = false;

    this.color = {
      r: random(0.8, 1.0),
      g: random(0.0, 0.2),
      b: random(0.5, 1.0)
    };

  }

  setR(r) {
    this.r = r;
    return this;
  }

  setPos() {
    this.pos = createVector(sin(radians(random(0, 90))) * this.r, cos(radians(random(0, 90))) * this.r, sin(radians(random(0, 90))) * this.r);
    return this;
  }

  setAcc() {
    this.acc = p5.Vector.sub(this.cen, this.pos);
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

  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }

  turn() {
    this.acc = p5.Vector.sub(this.cen, this.pos);
    this.acc.setMag(this.vel_ori.magSq() / this.r);
    this.vel.mult(1.005);
    this.vel.limit(this.vel_top);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }

  // update() {
  //   this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
  //   this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  // }
}




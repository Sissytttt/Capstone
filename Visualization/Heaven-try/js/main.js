let params = {
  color: "#FFFFFFF",
  NUM_OF_PARTICLES: 1000,
  startVel: 0.5,
  maxVel: 3,
  velChangeRate: 0.001,
  yspd: 1,
};


let pointCloud;
let particles = [];

function setupThree() {

  pointCloud = getPoints(params.NUM_OF_PARTICLES);
  scene.add(pointCloud);


  let ControlFolder = gui.addFolder("Control");
  ControlFolder.add(params, "startVel", 0.1, 10, 0.001);
  ControlFolder.add(params, "maxVel", 1, 20, 1);
  ControlFolder.add(params, "velChangeRate", 0, 0.01, 0.0001);
  ControlFolder.add(params, "yspd", 0.1, 5, 0.01);

}

function updateThree() {
  for (const p of particles) {
    p.turn();
    // p.update();
    p.age();
    // p.move_up(params.yspd);
    p.flow();
    p.move();
  }


  while (particles.length < params.NUM_OF_PARTICLES) {
    let b = new Particle()
      .setR(30)
      .setPos()
      .setVel(params.startVel, params.maxVel)
      .setScl(2);
    particles.push(b);
  }


  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }


  while (particles.length > params.NUM_OF_PARTICLES) {
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
    color: 0xFFFFFF,
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
    this.acc = createVector();
    this.vel_ori = createVector();
    this.vel = createVector();
    this.vel_top;
    this.scl = createVector();

    this.lifespan = 1.0;
    this.lifeReduction = random(0.005, 0.001);

    this.isDone = false;

    this.color = {
      r: 1,
      g: 1,
      b: 1
    };

  }

  setR(r) {
    this.r = r;
    return this;
  }

  setPos() {
    this.pos = createVector(sin(radians(random(0, 90))) * this.r, 0, cos(radians(random(0, 90))) * this.r);
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
    // this.acc = p5.Vector.sub(this.cen, this.pos);
    this.acc = createVector(this.vel.z, 0, -this.vel.x);
    this.acc.setMag(this.vel_ori.magSq() / this.r);
    this.vel.mult(1 + params.velChangeRate);
    this.vel.limit(this.vel_top);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }

  move_up(yspd) {
    this.pos.y += yspd;
  }

  flow() {
    let posFreq = 0.005;
    let timeFreq = 0.005;
    let xFreq = this.pos.x * posFreq + frame * timeFreq;
    let yFreq = this.pos.y * posFreq + frame * timeFreq;
    let zFreq = this.pos.z * posFreq + frame * timeFreq;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, 0);
    force.normalize();
    force.mult(0.005);
    this.applyForce(force);

  }

  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }

  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

}


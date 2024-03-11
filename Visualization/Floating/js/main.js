let params = {
  Particles_in_scene: 0
};

const WORLD_LENGTH = 1000;
const WORLD_HEIGHT = 300;
const WORLD_DEPTH = 1000;
const MAX_PARTICLE_NUMBER = 10000;

let LineNum = 50;
let LinePos = [];
let lines = [];

let pointCloud;
let particles = [];

function setupThree() {
  // set up lines array
  for (let i = 0; i < LineNum; i++) {
    posX = random(-WORLD_LENGTH / 2, WORLD_LENGTH / 2);
    posY = 0;
    posZ = random(-WORLD_DEPTH / 10, WORLD_DEPTH / 10);
    LinePos.push([posX, posY, posZ]);
  }

  for (let i = 0; i < LineNum; i++) {
    let line = new Line().setPos(...LinePos[i]);
    lines.push(line);
  }

  for (let i = 0; i < MAX_PARTICLE_NUMBER; i++) {
    let random_line = Math.floor(Math.random() * lines.length);
    lines[random_line].addNewParticle();
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);


  // gui
  params.Particles_in_scene = particles.length;
  gui.add(params, "Particles_in_scene").listen();
}

function updateThree() {
  while (particles.length < MAX_PARTICLE_NUMBER) {
    let random_line = Math.floor(Math.random() * lines.length);
    lines[random_line].addNewParticle();
  }

  // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.move();
    p.adjustVelocity(-0.005);
    p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }

  // then update the points
  let positionArray = pointCloud.geometry.attributes.position.array;
  let colorArray = pointCloud.geometry.attributes.color.array;
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let ptIndex = i * 3;
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
    colorArray[ptIndex + 0] = p.color.r * p.lifespan;
    colorArray[ptIndex + 1] = p.color.g * p.lifespan;
    colorArray[ptIndex + 2] = p.color.b * p.lifespan;
  }
  pointCloud.geometry.setDrawRange(0, particles.length); // ***
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.attributes.color.needsUpdate = true;

  // update GUI
  params.Particles_in_scene = particles.length;
}

function getPoints(objects) {
  const vertices = new Float32Array(objects.length * 3);
  const colors = new Float32Array(objects.length * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load('assets/particle_texture.jpg');
  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: random(1, 5),
    // sizeAttenuation: true,

    //opacity: 0.50,
    //transparent: true,

    depthTest: false,
    blending: THREE.AdditiveBlending,

    map: texture
  });
  // Points
  const points = new THREE.Points(geometry, material);
  return points;
}

class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 1.0;
    this.lifeReduction = random(0.003, 0.05);
    this.isDone = false;

    this.moveScl = random();

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };
    particles.push(this);
  }

  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setColor(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    return this;
  }
  setVel(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setScl(w, h = w, d = w) {
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  adjustVelocity(amount) {
    this.vel.mult(1 + amount);
  }
  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }
  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }
  reappear() {
    if (this.pos.z > WORLD_DEPTH / 2) {
      this.pos.z = -WORLD_DEPTH / 2;
    }
  }
  disappear() {
    if (this.pos.z > WORLD_DEPTH / 2) {
      this.isDone = true;
    }
  }
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  attractedTo(x, y, z) {
    let target = new p5.Vector(x, y, z);
    let force = p5.Vector.sub(target, this.pos);
    if (force.mag() < 100) {
      force.mult(-0.005);
    } else {
      force.mult(0.0001);
    }
    this.applyForce(force);
  }
  flow() {
    let xFreq = this.pos.x * 0.005 + frame * 0.005;
    let yFreq = this.pos.y * 0.005 + frame * 0.005;
    let zFreq = this.pos.z * 0.005 + frame * 0.005;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    force.mult(0.005);
    // force.mult(this.moveScl);
    this.applyForce(force);

  }
}

// ===================================================================
class Line {
  constructor() {
    this.pos = createVector();
    this.lightness = 1;
    return this;
  }

  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }

  addNewParticle() {
    let p_posy = random(-WORLD_DEPTH / 2, WORLD_HEIGHT / 2);
    let xFreq = this.pos.x * 0.005
    let yFreq = p_posy * 0.005 + frame * 0.005;
    let noiseWave = map(noise(yFreq, xFreq), 0, 1, -30, 30); // 弯曲的变换
    let noiseValue = noise(yFreq, this.pos.x)
    let noiseBrightness;
    if (noiseValue < 0.2) {
      noiseBrightness = map(noiseValue, 0, 0.2, 0, 0.01);
    }
    else if (noiseValue < 0.5) {
      noiseBrightness = map(noiseValue, 0.2, 0.5, 0, 0.05);
    }
    else if (noiseValue < 0.7) {
      noiseBrightness = map(noiseValue, 0.5, 0.7, 0.05, 2);
    }
    else if (noiseValue < 1) {
      noiseBrightness = map(noiseValue, 0.7, 1, 1, 255);
    }

    let particle = new Particle()
      .setPos(this.pos.x + noiseWave, p_posy, this.pos.z)
      .setColor(noiseBrightness, noiseBrightness, noiseBrightness)
    particles.push(particle);

  }
}
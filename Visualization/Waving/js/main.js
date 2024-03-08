let params = {
  Particles_in_scene: 0
};

const WORLD_LENGTH = 1500;
const WORLD_HEIGHT = 300;
const WORLD_DEPTH = 1000;
const MAX_PARTICLE_NUMBER = 10000;

let WaveNum = 4;
let WaveAttri = []; // Wvel, Wlen, Wamp, noise_move, WfreqAdj = 1, WampAdj = 1
let WavePos = [];
let waves = [];

let pointCloud;
let particles = [];

function setupThree() {
  // set up waves array
  for (let i = 0; i < WaveNum; i++) {
    Wvel = random(0.005, 0.03);  // * frameCount // big = fast
    Wlen = random(0.005, 0.01); // * this.pos.x // big = short
    Wamp = random(40, 80);
    noise_move = random(100);
    WfreqAdj = 1;
    WampAdj = 1
    WaveAttri.push([Wvel, Wlen, Wamp, noise_move, WfreqAdj, WampAdj]);

    WposX = 0;
    WposY = random(-WORLD_HEIGHT / 2, WORLD_HEIGHT / 2);
    WposZ = random(-WORLD_DEPTH / 2, WORLD_DEPTH / 2);
    WavePos.push([WposX, WposY, WposZ]);
  }

  for (let i = 0; i < WaveNum; i++) {
    let wave = new Wave(...WaveAttri[i]).setPos(...WavePos[i]);
    waves.push(wave);
  }

  for (let i = 0; i < MAX_PARTICLE_NUMBER; i++) {
    let random_wave = Math.floor(Math.random() * waves.length);
    waves[random_wave].addNewParticle();
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
    let random_wave = Math.floor(Math.random() * waves.length);
    waves[random_wave].addNewParticle();
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
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let ptIndex = i * 3;
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
  }
  pointCloud.geometry.setDrawRange(0, particles.length); // ***
  pointCloud.geometry.attributes.position.needsUpdate = true;

  // update GUI
  params.Particles_in_scene = particles.length;
}

function getPoints(objects) {
  const vertices = [];
  for (let obj of objects) {
    vertices.push(obj.pos.x, obj.pos.y, obj.pos.z);
  }

  // geometry
  const geometry = new THREE.BufferGeometry();
  // attributes
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  // draw range
  const drawCount = objects.length; // draw the whole objects
  geometry.setDrawRange(0, drawCount);
  // geometry
  const texture = new THREE.TextureLoader().load('assets/particle_texture.jpg');
  const material = new THREE.PointsMaterial({
    // color: 0xFF9911,
    size: 1,
    sizeAttenuation: true,
    //opacity: 1.0,
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

    this.rot = createVector();
    this.rotVel = createVector();
    this.rotAcc = createVector();

    this.lifespan = 1.0;
    this.lifeReduction = random(0.003, 0.05);
    this.isDone = false;
    particles.push(this);
  }
  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
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
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -1.0, 1.0);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    force.mult(0.006);
    this.applyForce(force);

  }
}


class Wave {
  constructor(Wvel, Wlen, Wamp, noise_move, WfreqAdj = 1, WampAdj = 1) { // Wvel, Wlen, Wamp, noise_move, WfreqAdj = 1, WampAdj = 1
    this.pos = createVector();
    this.vel = Wvel; // * frameCount // big = fast
    this.len = Wlen; // * this.pos.x // big = short
    this.amp = Wamp;
    this.freqAdj = WfreqAdj;
    this.ampAdj = WampAdj;
    this.noise_move = noise_move;
    return this;
  }

  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }

  addNewParticle() {
    let p_posx = random(-WORLD_LENGTH / 2, WORLD_LENGTH / 2);
    let xFreq = p_posx * 0.005 + frame * 0.005;
    let noiseMove = map(noise(xFreq), 0, 1, -0.2, 0.6); // sin的平整度
    let sinForFreq = sin(this.vel * frame) * noiseMove;
    this.freq = (frame * this.vel + p_posx * this.len) * this.freqAdj + sinForFreq;
    let sinValue = sin(this.freq) * this.amp;
    let particle = new Particle()
      .setPos(p_posx, this.pos.y + sinValue, this.pos.z);

    particles.push(particle);

  }
}
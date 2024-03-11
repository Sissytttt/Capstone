let params = {
  PARTICLE_NUMBER: 10000,
  particleNum: 0,
  color: "#FFFFFF"
};

const WORLD_WIDTH = 900;
const WORLD_LENGTH = 1600;

let pointCloud;
let particles = [];

function setupThree() {
  // initialize particles
  for (let i = 0; i < params.PARTICLE_NUMBER; i++) {
    let p = new Particle()
      .setPos(random(-WORLD_LENGTH / 2, WORLD_LENGTH / 2), random(-WORLD_WIDTH / 2, WORLD_WIDTH / 2), 0)
    particles.push(p);
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // GUI
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.open();
  folderBasic.add(params, "PARTICLE_NUMBER", 0, params.PARTICLE_NUMBER).step(1).listen();
  folderBasic.add(params, "particleNum").listen();
  folderBasic.addColor(params, 'color');

}

function updateThree() {
  // set GUI variables
  let c = color(params.color);

  // generate new particles
  while (particles.length < params.PARTICLE_NUMBER) {
    let p = new Particle()
      .setPos(random(-WORLD_LENGTH / 2, WORLD_LENGTH / 2), WORLD_WIDTH / 2, 0)
    particles.push(p);
  }

  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.setColor(red(c), green(c), blue(c));
    p.move();
    // p.movedown1(1);
    p.movedown(4);
    p.disappear();
    // p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--; // not flipped version
    }
  }

  // Update the particle class to points materials
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
  pointCloud.geometry.setDrawRange(0, particles.length);
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.attributes.color.needsUpdate = true;

  // update GUI
  params.particleNum = particles.length;
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
    size: random(1, 3),
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


// ==============================================================
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(5, 5, 5);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 1.0;
    this.lifeReduction = random(0.001, 0.005);
    this.isDone = false;

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };
  }
  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setVel(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setColor(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
  }
  setScale(w, h = w, d = w) {
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }

  movedown(v) {
    let moveFreqX = (-WORLD_LENGTH + this.pos.x) * 0.01; // 整体 move downward
    let moveFreqY = (-WORLD_WIDTH + this.pos.y) * 0.01 + frame * 0.01;
    let moveNoise = noise(moveFreqX, moveFreqY);
    let moveAdj;
    if (moveNoise < 0.4) {
      moveAdj = map(moveNoise, 0, 0.4, 0, 0.7);
    }
    else {
      moveAdj = map(moveNoise, 0.4, 1, 0.7, 1.2);
    }
    let velFreqX = (-WORLD_LENGTH + this.pos.x + 1000) * 0.005; // each partile move downward
    let velFreqY = (-WORLD_WIDTH + this.pos.y + 1000) * 0.008 + moveAdj;
    let velNoise = noise(velFreqX, velFreqY);
    let vel;
    if (velNoise < 0.2) {
      vel = map(velNoise, 0, 0.2, 0 * v, 0.01 * v);
    }
    else if (velNoise < 0.5) {
      vel = map(velNoise, 0.2, 0.5, 0.01 * v, 0.2 * v);
    }
    else if (velNoise < 0.8) {
      vel = map(velNoise, 0.5, 0.8, 0.2 * v, 0.5 * v);
    }
    else {
      vel = map(velNoise, 0.8, 1, 0.5 * v, 1 * v);
    }
    this.vel.y = -vel;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }
  disappear() {
    if (this.pos.y < -WORLD_WIDTH / 2) {
      this.isDone = true;
    }
  }
}
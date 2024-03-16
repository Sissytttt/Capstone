let params = {
  //basic
  PARTICLE_NUMBER: 1000,
  particleNum: 0,
  color: "#FFFFFF",
  WORLD_HEIGHT: 1000,
  WORLD_DEPTH: 1000,
  WORLD_WIDTH: 1000,
  //control: 
  windPosX: 0, // can I use Vector here?
  windPosY: 0,
  windPosZ: 0,
  // parameters
  concentration: 1.2, // big - discrete ; small - concentrate 
  windNoise_posFactor: 0.01,
  windNoise_timeFactor: 0.1,
  windMagnitude: 0.01,
  Var: 1,
  Var: 2,
  Var: 3,
  Var: 1,
  Var: 2,
  Var: 3,
};

const WORLD_SIZE = 1000;
let windPos = new THREE.Vector3(0, 0, 0);

let pointCloud;
let particles = [];

let distMax;

function setupThree() {

  // initialize particles
  setup_particles();

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // GUI
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.add(params, "PARTICLE_NUMBER", 0, 10000).step(1).listen();
  folderBasic.add(params, "particleNum").listen();
  folderBasic.add(params, "WORLD_WIDTH").min(100).max(2000).step(10).onChange(setup_particles);
  folderBasic.add(params, "WORLD_HEIGHT").min(100).max(2000).step(10).onChange(setup_particles);
  folderBasic.add(params, "WORLD_DEPTH").min(100).max(2000).step(10).onChange(setup_particles);
  folderBasic.addColor(params, 'color');

  let ParamControl = gui.addFolder("ParamControl");
  ParamControl.open();
  ParamControl.add(params, "concentration").min(0.5).max(2).step(0.1);
  ParamControl.add(params, "Var").min(0).max(1).step(0.1);
  ParamControl.add(params, "Var").min(0).max(1).step(0.1);
  ParamControl.add(params, "Var").min(0).max(1).step(0.1);

  ParamControl.add(params, "windPosX").min(-params.WORLD_WIDTH / 2).max(params.WORLD_WIDTH / 2).step(1).listen();
  ParamControl.add(params, "windPosY").min(-params.WORLD_HEIGHT / 2).max(params.WORLD_HEIGHT / 2).step(1).listen();
  ParamControl.add(params, "windPosZ").min(-params.WORLD_DEPTH / 2).max(params.WORLD_DEPTH / 2).step(1).listen();

}

function updateThree() {

  // set GUI variables
  // let c = color(params.color);
  windPos.x = params.windPosX;
  windPos.y = params.windPosY;
  windPos.z = params.windPosZ;


  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    // p.setColor(red(c), green(c), blue(c));
    p.apply_wind();
    // p.apply_start_wind();
    p.age();
    p.flow();
    p.move();
    if (p.isDone) {
      particles.splice(i, 1);
      i--; // not flipped version
    }
  }

  //generate new particles
  while (particles.length < params.PARTICLE_NUMBER) {
    generate_particle();
  }

  // update windPos
  updateWindPos();

  // Update the particle class to points materials
  let positionArray = pointCloud.geometry.attributes.position.array;
  let colorArray = pointCloud.geometry.attributes.color.array;
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let ptIndex = i * 3;
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
    colorArray[ptIndex + 0] = p.color.r * abs(2 * abs(p.lifespan - 0.5) - 1) * 2;
    colorArray[ptIndex + 1] = p.color.g * abs(2 * abs(p.lifespan - 0.5) - 1) * 2;
    colorArray[ptIndex + 2] = p.color.b * abs(2 * abs(p.lifespan - 0.5) - 1) * 2;
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
    // size: random(1, 5),
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

function generate_particle() {
  let x = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
  let y = random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2);
  let z = random(-params.WORLD_DEPTH / 2, params.WORLD_DEPTH / 2);
  let distance = dist(windPos.x, windPos.y, windPos.z, x, y, z);
  let possibility1 = map(distance, 0, distMax, params.concentration, 0); // distance to the center
  let xFreq = (x + 3000) * 0.01 + frame * 0.005;
  let yFreq = (y + 900) * 0.01 + frame * 0.005;
  let zFreq = (z + 1000) * 0.01 + frame * 0.005;
  let possibility2 = noise(xFreq, yFreq, zFreq); // noise(position) 
  let possibility = possibility1 * possibility2;

  // let startForceDir = possibility2 * TWO_PI;
  // let startForceMag = noise(xFreq + 2000, yFreq + 1000, zFreq + 1000);
  // startForce = p5.Vector.fromAngle(startForceDir);
  // startForce.normalize();
  // console.log(startForce);
  // startForce.mult(startForceMag).mult(0.1);

  if (possibility > 0.6) {
    let p = new Particle()
      .setPos(x, y, z)
    // .set_start_force(startForce.x, startForce.y, startForce.z);
    particles.push(p);
  }
}

function setup_particles() {
  distMax = dist(windPos.x, windPos.y, windPos.z, params.WORLD_HEIGHT / 2, params.WORLD_DEPTH / 2, params.WORLD_WIDTH / 2);
  while (particles.length < params.PARTICLE_NUMBER) {
    generate_particle();
  }
}


function updateWindPos() {
  windMoveVel = 0.005;
  let xFreq = frame * windMoveVel;
  let yFreq = frame * windMoveVel;
  let zFreq = frame * windMoveVel;
  let xPos = map(noise(xFreq), 0, 1, -params.WORLD_WIDTH, params.WORLD_WIDTH);
  let yPos = map(noise(yFreq + 1000), 0, 1, -params.WORLD_HEIGHT, params.WORLD_HEIGHT);
  let zPos = map(noise(zFreq + 3000), 0, 1, -params.WORLD_DEPTH / 2, params.WORLD_DEPTH / 2);
  windPos.x = xPos;
  windPos.y = yPos;
  windPos.z = zPos;
  params.windPosX = windPos.x;
  params.windPosY = windPos.y;
  params.windPosZ = windPos.z;
}

// ==============================================================
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 1.0;
    this.lifeReduction = random(0.001, 0.005);
    this.isDone = false;

    this.color = {
      r: 2,
      g: 3,
      b: 2
    };

    this.startWindForce = createVector();
  }
  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  set_start_force(x, y, z) {
    this.startWindForce = createVector(x, y, z);
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
    return this;
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
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  apply_force(f) {
    let force = f.copy();
    this.acc.add(force);
  }
  disappear() {
    if (this.pos.z > WORLD_SIZE / 2) {
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
    this.apply_force(force);
  }

  apply_start_wind() {
    this.apply_force(this.startWindForce);
  }

  apply_wind() {
    let xFreq = this.pos.x * params.windNoise_posFactor + frame * params.windNoise_timeFactor;
    let yFreq = this.pos.y * params.windNoise_posFactor + frame * params.windNoise_timeFactor;
    let zFreq = this.pos.z * params.windNoise_posFactor + frame * params.windNoise_timeFactor;
    let noiseMag = noise(xFreq, yFreq, zFreq);
    // let noiseAngle = noise(xFreq + 1000, yFreq + 1500, zFreq + 190) * TWO_PI;
    let noiseAngle = radians(map(noise(xFreq + 1000, yFreq + 1500, zFreq + 190), 0, 1, -360, 360));
    let force = p5.Vector.fromAngle(noiseAngle);
    force.normalize();
    force.mult(noiseMag);
    force.mult(params.windMagnitude)
    this.apply_force(force);
    // console.log(noiseAngle)
    // console.log(force.x, force.y, force.z)

    // let xFreq = this.pos.x * params.windNoise_posFactor + frame * params.windNoise_timeFactor;
    // let yFreq = this.pos.y * params.windNoise_posFactor + frame * params.windNoise_timeFactor;
    // let zFreq = this.pos.z * params.windNoise_posFactor + frame * params.windNoise_timeFactor;
    // let noiseValue = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    // let force = new p5.Vector(cos(frame * 0.005), sin(frame * 0.005), sin(frame * 0.002));
    // force.normalize();
    // force.mult(noiseValue * 0.1);
    // this.apply_force(force);
  }
}
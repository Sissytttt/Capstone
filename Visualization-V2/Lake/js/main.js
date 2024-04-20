let params = {
  // basic
  Particles_in_scene: 0,
  MAX_PARTICLE_NUMBER: 3000,
  WORLD_WIDTH: 1500,
  WORLD_HEIGHT: 300,
  WORLD_DEPTH: 500,
  // wave
  WaveNum: 1,
  /*
    let Wvel = sign * random(0.001, 0.03);  // * frameCount // big = fast
    let XoffsetAmp = random(100, 600);
    let timeOffset = floor(random(200));
    let sinForFreqAmp = random(0.002, 0.007);
    let sinForAmp_amp = random(30, 250);
  */
  Wvel: 0.1,
  WsinForFreq_ampMin: 0.002,
  WsinForFreq_ampMax: 0.007,
  // WsinForAmp_ampMin: 30,
  // WsinForAmp_ampMax: 50,
  WsinForAmp_amp: 100,

  //particles
  lifeReductionMin: 0.02,
  lifeReductionMax: 0.07,
};


let control = {
  Weight: 5,
  Time: 5, // acceleration
  Space: 5,
  Flow: 5,
}


let WaveAttri = []; // 
let WavePos = [];
let waves = [];

let pointCloud;
let particles = [];

function setupThree() {
  // set up waves array
  setWaves();

  for (let i = 0; i < params.MAX_PARTICLE_NUMBER; i++) {
    let random_wave = Math.floor(Math.random() * waves.length);
    waves[random_wave].addNewParticle();
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);


  // gui
  params.Particles_in_scene = particles.length;

  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.add(params, "MAX_PARTICLE_NUMBER", 0, 10000).step(1).listen();
  folderBasic.add(params, "Particles_in_scene").listen();
  folderBasic.add(params, "WORLD_WIDTH", 0, 2000).step(10);
  folderBasic.add(params, "WORLD_HEIGHT", 0, 2000).step(10);

  let folderWave = gui.addFolder("Wave Parameters");
  folderWave.add(params, "WaveNum", 1, 20, 1).onChange(setWaves);
  /*
  let Wvel = sign * random(0.001, 0.03);  // * frameCount // big = fast
  let XoffsetAmp = random(100, 600);
  let timeOffset = floor(random(200));
  let sinForFreqAmp = random(0.002, 0.007);
  let sinForAmp_amp = random(30, 250);

  WvelMin = 0.001,
  WvelMax = 0.03,
  WsinForFreq_ampMin = 0.002,
  WsinForFreq_ampMax = 0.007,
  WsinForAmp_ampMin = 30,
  WsinForAmp_ampMax = 50,
  */
  folderWave.add(params, "Wvel", 0.001, 0.01, 0.001);
  // folderWave.add(params, "WvelMin", 0.001, 0.03, 0.001);
  // folderWave.add(params, "WvelMax", 0.001, 0.01, 0.001);
  // folderWave.add(params, "WsinForFreq_ampMin", 0.001, 0.01, 0.001);
  // folderWave.add(params, "WsinForFreq_ampMax", 0.001, 0.01, 0.001);
  // folderWave.add(params, "WsinForAmp_ampMin", 0.001, 0.01, 0.001);
  // folderWave.add(params, "WsinForAmp_ampMax", 0.001, 0.01, 0.001);
  folderWave.add(params, "WsinForAmp_amp", 30, 50, 1);




  let ControlFolder = gui.addFolder("CONTROL");
  ControlFolder.open();
  ControlFolder.add(control, "Weight", 0, 10, 0.1);
  ControlFolder.add(control, "Time", 0, 10, 0.1);
  ControlFolder.add(control, "Space", 0, 10, 0.1);
  ControlFolder.add(control, "Flow", 0, 10, 0.1);
}

function updateThree() {
  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    let random_wave = Math.floor(Math.random() * waves.length);
    waves[random_wave].addNewParticle();
  }

  // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.move();
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

// ======================

function setWaves() {
  if (WavePos.length > 0) {
    WavePos = [];
    waves = []
  }
  for (let i = 0; i < params.WaveNum; i++) { // Wvel, XoffsetAmp = 200, sinForFreqAmp = 0.005, sinForAmp_amp = 100)
    let sign = Math.random() < 0.5 ? -1 : 1;
    // let Wvel = sign * random(0.001, 0.03);  // * frameCount // big = fast
    let Wvel = sign * random(params.Wvel * 0.8, params.Wvel * 1.2);
    let XoffsetAmp = random(100, 600);
    let timeOffset = floor(random(200));
    let sinForFreq_amp = random(0.002, 0.007);
    // let sinForAmp_amp = random(30, 250);
    let sinForAmp_amp = random(params.WsinForAmp_amp * 0.8, params.WsinForAmp_amp * 1.2, 250);
    WaveAttri.push([Wvel, XoffsetAmp, timeOffset, sinForFreq_amp, sinForAmp_amp]);

    WposX = 0;
    WposY = random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2);
    WposZ = random(-params.WORLD_DEPTH / 2, params.WORLD_DEPTH / 2);
    WavePos.push([WposX, WposY, WposZ]);
  }

  for (let i = 0; i < params.WaveNum; i++) {
    let wave = new Wave(...WaveAttri[i]).setPos(...WavePos[i]);
    waves.push(wave);
  }

}


// ======================
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
    this.lifeReduction = random(params.lifeReductionMin, params.lifeReductionMax);
    this.isDone = false;
    particles.push(this);
  }
  set_pos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  set_vel(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  set_movingVel(val) {
    this.vel = createVector(val, 0, 0);
    return this;
  }
  set_movingDir(val) {
    this.moveingDir = val;
    return this;
  }
  set_scl(w, h = w, d = w) {
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
    if (this.pos.z > params.WORLD_DEPTH / 2) {
      this.pos.z = -params.WORLD_DEPTH / 2;
    }
  }
  disappear() {
    if (this.pos.z > params.WORLD_DEPTH / 2) {
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
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1, 1);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, 0, 1);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1, 1);
    let force = new p5.Vector(noiseValue1, noiseValue2 * this.moveingDir, noiseValue3);
    force.normalize();
    force.mult(0.005);
    this.applyForce(force);

  }
}


class Wave {
  constructor(Wvel, XoffsetAmp = 200, timeOffset, sinForFreqAmp = 0.005, sinForAmp_amp = 100) {
    this.vel = Wvel; // * frameCount // big = fast
    this.Xoffset = XoffsetAmp;
    this.timeOffset = timeOffset;
    this.amp_freqSin = sinForFreqAmp;
    this.AmpSin = sinForAmp_amp;
    return this;
  }

  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }

  addNewParticle() {
    let p_posx = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
    let freq = frame * 0.01 + this.timeOffset;
    let sinXoffset = sin(freq) * this.Xoffset - 800;// WORLD_WIDTH/2
    let sinForFreq = sin(freq) * this.amp_freqSin;
    let ampl = noise(freq) * this.AmpSin;
    // let sinXoffset = sin(freq) * 100 - 800;
    // let sinForFreq = sin(freq) * 0.003;
    // let ampl = noise(freq) * 300;
    let mainSineFreq = (p_posx + sinXoffset) * sinForFreq;
    // let mainSineFreq = (p_posx) * sinForFreq;
    let sinValue = sin(mainSineFreq) * ampl;
    // console.log(sin(mainSineFreq), sinValue)
    let particle = new Particle()
      .set_pos(p_posx, this.pos.y + sinValue, this.pos.z)
      .set_movingDir(sinValue)
      .set_movingVel(this.vel);
    particles.push(particle);
  }

}

function controller() {
  // weight
  if (control.Weight < 5) {
    params.opacityAdj = map(control.Weight, 0, 5, 0.5, 0);
  }

  // time 
  if (control.Time < 5) {
    params.moveupSpd = map(control.Time, 0, 5, 0.7, 1.2);
    params.lifeSpan = 1;
    params.flowForceX = 15;
  }
  else {
    params.moveupSpd = map(control.Time, 5, 10, 1.2, 3);
    params.lifeSpan = map(control.Time, 5, 10, 1, 0.7);
  }

  // Space
  if (control.Space <= 5) {
    params.distributionFreq = map(control.Space, 0, 5, 0.06, 0.02);
  }
  else {
    params.distributionFreq = map(control.Space, 5, 10, 0.02, 0.01);
  }

  // flow
  if (control.Flow > 8) { // flow value big - not fluent
    params.areaSize = map(control.Flow, 8, 10, 1, 0.6);
  }
  else {
    params.areaSize = 1;
  }
}

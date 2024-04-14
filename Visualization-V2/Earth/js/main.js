let params = {
  MAX_PARTICLE_NUMBER: 10000,
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 300,
  WORLD_DEPTH: 1000,
  Particles_in_scene: 0,
  //
  Circle_Num: 30,
  BendMagnitude: 30,
  sizeMin: 400,
  sizeMax: 1000,
  breathAmplMin: 30,
  breathAmplMax: 100,
  breathFreq: 0.02,
  gaussianSD: 100,
  moveRangeMin: 100,
  moveRangeMax: 400,
  moveThreshold: 0.5, // 0~1, >threshold的比例是会有起伏的比例
  WaveFrameFreq: 0.004,
  WaveRadFreq: 0.01,
  WaveAngleFreq: 0.005, // don't know what this controls
  // 
  FlowPosFreq: 0.00001,
  FlowTimeFreq: 0.005,
  MoveSpd: 0.001,
  lifeReductionMin: 0.005,
  lifeReductionMax: 0.02,
};

let control = {
  Weight: 5,
  Time: 5, // acceleration
  Space: 5,
  Flow: 5,
}

let CirclePos = [];
let Circles = [];

let pointCloud;
let particles = [];

let sinArray = [];
let cosArray = [];
let sinCosResolution = 360 * 2;

function setupThree() {
  setupFastSinCos();
  earth_setup_circles();
  for (let i = 0; i < params.MAX_PARTICLE_NUMBER; i++) {
    let random_circle = Math.floor(Math.random() * Circles.length);
    Circles[random_circle].addParticles();
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);


  // gui
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.add(params, "MAX_PARTICLE_NUMBER", 0, 20000).step(1);
  folderBasic.add(params, "WORLD_WIDTH", 0, 2000, 10).onChange(earth_setup_circles);
  folderBasic.add(params, "WORLD_HEIGHT", 0, 2000, 10).onChange(earth_setup_circles);
  folderBasic.add(params, "WORLD_DEPTH", 0, 2000, 10).onChange(earth_setup_circles);
  params.Particles_in_scene = particles.length;
  folderBasic.add(params, "Particles_in_scene").listen();

  let CircleFolder = gui.addFolder("Circle");
  CircleFolder.add(params, "Circle_Num", 1, 100, 1).onChange(earth_setup_circles);

  let ParticleFolder = gui.addFolder("Particles");
  ParticleFolder.add(params, "FlowPosFreq", 0, 0.5, 0.0001);
  ParticleFolder.add(params, "FlowTimeFreq", 0, 0.5, 0.0001);
  ParticleFolder.add(params, "MoveSpd", 0, 0.5, 0.0001);

  let ControlFolder = gui.addFolder("CONTROL");
  ControlFolder.open();
  ControlFolder.add(control, "Weight", 0, 10, 0.1);
  ControlFolder.add(control, "Time", 0, 10, 0.1);
  ControlFolder.add(control, "Space", 0, 10, 0.1);
  ControlFolder.add(control, "Flow", 0, 10, 0.1);

}

function updateThree() {
  controller();
  // update circle pos
  for (let i = 0; i < Circles.length; i++) {
    let circle = Circles[i];
    circle.breath();
    circle.update_pos();
    circle.set_breath_FreqAmpl(params.breathFreq, params.breathAmplMin, params.breathAmplMax);
  }
  // add particles to the circles
  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    let random_circle = Math.floor(Math.random() * Circles.length);
    Circles[random_circle].addParticles();
  }

  // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.wave();
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
    // sizeAttenuation: true,
    //opacity: 0.50,
    //transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  // Points
  const points = new THREE.Points(geometry, material);
  return points;
}

function earth_setup_circles() {
  for (let i = 0; i < params.Circle_Num; i++) {
    let rAdj = abs(randomGaussian(0, params.gaussianSD));
    if (rAdj > params.sizeMax - params.sizeMin) {
      rAdj = params.sizeMax - params.sizeMin;
    }
    let circle = new Circle()
      .set_rAdj(rAdj)
      .set_pos(0, 0, 0)
      .set_size(params.sizeMin + rAdj)
      .set_breath_FreqAmpl(params.breathFreq, params.breathAmplMin, params.breathAmplMax);
    Circles.push(circle);
  }
}

// ===================================================================
class Circle {
  constructor() {
    this.pos = createVector();
  }
  set_pos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  update_pos() {
    let noiseVal = noise(this.pos.x * params.WaveAngleFreq, this.pos.z * params.WaveAngleFreq, frame * params.WaveAngleFreq);
    let yPos = map(noiseVal, 0, 1, -150, 150)
    this.pos.y = yPos;
  }
  set_size(r) {
    this.radians = r;
    this.updatedR = this.radians;
    return this;
  }
  set_rAdj(rAdj) { // outer distance toward the base rad // remember for calculating breath ampl
    this.rAdj = rAdj;
    return this;
  }
  set_breath_FreqAmpl(freq, min, max) {
    let breathAmp = map(this.rAdj, 0, params.sizeMax - params.sizeMin, min, max);
    this.breathFreq = freq;
    this.breathAmpl = breathAmp;
    return this;
  }
  breath() { // update R
    this.updatedR = this.radians + mSin(frame * this.breathFreq) * this.breathAmpl;
  }
  addParticles() {
    let randomAngle = random(2 * PI);
    let randomPosX = mSin(randomAngle) * this.updatedR;
    let randomPosZ = mCos(randomAngle) * this.updatedR;
    let moveRange = map(this.radians, params.sizeMin, params.sizeMax, params.moveRangeMin, params.moveRangeMin);
    let particle = new Particle()
      .set_pos(this.pos.x + randomPosX, this.pos.y, this.pos.z + randomPosZ)
      .set_angle(randomAngle)
      .set_rad(this.radians) // 粒子所在的相对大圆的角度位置，用于之后flow的noise的参数（连贯数值）
      .set_moveRange(moveRange);
    particles.push(particle);
  }
}

// ============================
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();
    this.angle = 0;
    this.rad = 0;
    this.moveRange = 0;
    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 1.0;
    this.lifeReduction = random(params.lifeReductionMin, params.lifeReductionMax);
    this.isDone = false;

    this.moveScl = random();

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };
    particles.push(this);
  }

  set_pos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  set_angle(angle) {
    this.angle = angle;
    return this;
  }
  set_rad(rad) {
    this.rad = rad;
    return this;
  }
  set_moveRange(val) {
    this.moveRange = val;
    return this;
  }
  wave() {
    let angleFreq = this.angle;
    let radFreq = this.rad * params.WaveRadFreq;
    let frameFreq = frame * params.WaveFrameFreq;
    let noiseVal = noise(angleFreq, radFreq, frameFreq);
    let yPos = 0;
    if (noiseVal > params.moveThreshold) {
      yPos = map(noiseVal, params.moveThreshold, 1, 0, this.moveRange);
    }
    this.pos.y = yPos;
  }

  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  apply_force(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }

  flow() {
    let posFreq = params.FlowPosFreq;
    let timeFreq = params.FlowTimeFreq;
    let xFreq = this.pos.x * posFreq + frame * timeFreq;
    let yFreq = this.pos.y * posFreq + frame * timeFreq;
    let zFreq = this.pos.z * posFreq + frame * timeFreq;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    // force.mult(this.flowSpd);
    force.mult(0.005)
    this.apply_force(force);
  }

}


function setupFastSinCos() {
  for (let i = 0; i < sinCosResolution; i++) {
    let deg = map(i, 0, sinCosResolution, 0, 360);
    let rad = radians(deg);
    sinArray.push(sin(rad));
    cosArray.push(cos(rad));
  }
}

function mSin(rad) {
  let angle = rad % TWO_PI;
  if (angle < 0) angle += TWO_PI;
  let index = floor(map(angle, 0, TWO_PI, 0, sinCosResolution));
  return sinArray[index];
}

function mCos(rad) {
  let angle = rad % TWO_PI;
  if (angle < 0) angle += TWO_PI;
  let index = floor(map(angle, 0, TWO_PI, 0, sinCosResolution));
  return cosArray[index];
}


function controller() {
  // weight
  if (control.Weight <= 5) {
    params.moveRangeMin = map(control.Weight, 0, 5, 50, 100);
    params.moveRangeMax = map(control.Weight, 0, 5, 200, 400);
    params.moveThreshold = map(control.Weight, 0, 5, 0.6, 0.5); // need test
  }
  else {
    params.moveRangeMin = map(control.Weight, 5, 10, 300, 900);
    params.moveRangeMax = map(control.Weight, 5, 10, 500, 2000);
    params.moveThreshold = map(control.Weight, 5, 10, 0.5, 0.3);
  }

  // time // 变换不连贯
  if (control.Time <= 5) {
    params.WaveFrameFreq = map(control.Time, 0, 5, 0.002, 0.004);
    params.WaveRadFreq = map(control.Time, 0, 5, 0.0001, 0.005);
  }
  else {
    params.WaveFrameFreq = map(control.Time, 5, 10, 0.004, 0.02);
    params.WaveRadFreq = map(control.Time, 5, 10, 0.005, 0.01);
  }

  // Space
  if (control.Space <= 5) {
    params.breathAmplMin = map(control.Space, 0, 5, 10, 25);
    params.breathAmplMax = map(control.Space, 0, 5, 50, 100);
  }
  else {
    params.breathAmplMin = map(control.Space, 5, 10, 25, 40);
    params.breathAmplMax = map(control.Space, 5, 10, 100, 500);
  }

  // flow
  if (control.Flow <= 5) {
    params.breathFreq = map(control.Flow, 0, 5, 0.01, 0.03);
    params.lifeReductionMin = map(control.Flow, 0, 5, 0.004, 0.006);
    params.lifeReductionMax = map(control.Flow, 0, 5, 0.01, 0.02);
  }
  else {
    params.breathFreq = map(control.Flow, 5, 10, 0.03, 0.05);
    params.lifeReductionMin = map(control.Flow, 5, 10, 0.006, 0.01);
    params.lifeReductionMax = map(control.Flow, 5, 10, 0.02, 0.05);
  }
}

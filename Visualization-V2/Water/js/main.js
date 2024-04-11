// todo: random一下每个曲线向下的speed - 有上有下

let params = {
  MAX_PARTICLE_NUMBER: 10000,
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 300,
  WORLD_DEPTH: 1000,
  Particles_in_scene: 0,
  //
  Line_Num: 10,
  BendMagnitude: 30,
  BendLength: 0.005, // do not show // noise(pos.y * BendLength + frame * ChangeSpeed)
  ChangeSpeed: 0.005, // noise(pos.y * BendAmount + frame * ChangeSpeed)
  BendDifference: 0.005, // do not show // noise(pos.x * BendDifference)
  // 
  FlowPosFreq: 0.005, // do not show // 
  FlowTimeFreq: 0.005,
  MoveSpd: 0.005,
  lifeReductionMin: 0.005,
  lifeReductionMax: 0.05,
};

let control = {
  Weight: 5,
  Time: 5, // acceleration
  Space: 5,
  Flow: 5,
}


let LinePos = [];
let Lines = [];

let pointCloud;
let particles = [];

let space_int = 0, space_int_prev = -1;
let update_lineNum = false;

function setupThree() {

  set_Up_Lines();

  for (let i = 0; i < params.MAX_PARTICLE_NUMBER; i++) {
    let random_line = Math.floor(Math.random() * Lines.length);
    Lines[random_line].add_NewParticle();
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);


  // gui
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.add(params, "MAX_PARTICLE_NUMBER", 0, 20000).step(1);
  folderBasic.add(params, "WORLD_WIDTH", 0, 2000, 10).onChange(set_Up_Lines);
  folderBasic.add(params, "WORLD_HEIGHT", 0, 2000, 10).onChange(set_Up_Lines);
  folderBasic.add(params, "WORLD_DEPTH", 0, 2000, 10).onChange(set_Up_Lines);
  params.Particles_in_scene = particles.length;
  folderBasic.add(params, "Particles_in_scene").listen();

  let LineFolder = gui.addFolder("Line");
  LineFolder.add(params, "Line_Num", 1, 100, 1).onChange(set_Up_Lines);
  LineFolder.add(params, "BendMagnitude", 0, 80, 1);
  LineFolder.add(params, "BendLength", 0, 1, 0.001);
  LineFolder.add(params, "ChangeSpeed", 0, 1, 0.001);
  LineFolder.add(params, "BendDifference", 0, 1, 0.001);

  let ParticleFolder = gui.addFolder("Particles");
  ParticleFolder.add(params, "FlowPosFreq", 0, 0.5, 0.0001);
  ParticleFolder.add(params, "FlowTimeFreq", 0, 0.5, 0.0001);
  ParticleFolder.add(params, "MoveSpd", 0, 0.5, 0.0001);

  let ControlFolder = gui.addFolder("CONTROL");
  ControlFolder.open();
  ControlFolder.add(control, "Weight", 0, 10, 0.1);
  ControlFolder.add(control, "Time", 0, 10, 0.1);
  ControlFolder.add(control, "Space", 0, 10, 0.1).onChange(update_space_int);
  ControlFolder.add(control, "Flow", 0, 10, 0.1);

}

function updateThree() {
  controller();

  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    let random_line = Math.floor(Math.random() * Lines.length);
    Lines[random_line].add_NewParticle();
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

function set_Up_Lines() {
  if (LinePos.length > 0 || Lines.length > 0) {
    LinePos = [];
    Lines = [];
  }

  for (let i = 0; i < params.Line_Num; i++) {
    posX = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
    posY = 0;
    posZ = random(-params.WORLD_DEPTH / 2, params.WORLD_DEPTH / 2);
    LinePos.push([posX, posY, posZ]);
  }

  for (let i = 0; i < params.Line_Num; i++) {
    let line = new Line()
      .set_pos(...LinePos[i])
      .set_spd((random() < 0.5 ? 1 : -1) * params.ChangeSpeed * random(-0.7, 1.3));
    Lines.push(line);
  }
}

function update_space_int() {
  let calc_space_int = floor(control.Space / 3);
  space_int_prev = space_int;
  if (calc_space_int != space_int) {
    space_int = calc_space_int;
  }
  if (space_int_prev != space_int) {
    update_lineNum = true;
  }
  else {
    update_lineNum = false;
  }
}

// ============================
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

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
  set_color(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    return this;
  }
  set_vel(x, y, z) {
    this.vel = createVector(x, y, z);
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
    force.mult(params.MoveSpd);
    this.apply_force(force);

  }
}

// ===================================================================
class Line {
  constructor() {
    this.pos = createVector();
    this.moveDirection = random()
    return this;
  }

  set_pos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }

  set_spd(spd) {
    this.spd = spd;
    return this;
  }

  add_NewParticle() {
    let p_posy = random(-params.WORLD_DEPTH / 2, params.WORLD_HEIGHT / 2);
    let xFreq = this.pos.x * params.BendDifference
    let yFreq = p_posy * params.BendLength + frame * this.spd;
    let noiseWave = map(noise(yFreq, xFreq), 0, 1, - params.BendMagnitude, params.BendMagnitude); // 弯曲的变换
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

    let particle = new ParticleBasic()
      .set_pos(this.pos.x + noiseWave, p_posy, this.pos.z)
      .set_color(noiseBrightness, noiseBrightness, noiseBrightness)
    particles.push(particle);

  }
}

function controller() {
  // weight
  params.BendMagnitude = map(control.Weight, 0, 10, 10, 100);

  // time
  params.MoveSpd = map(control.Time, 0, 10, 0.002, 0.02);

  // Space
  if (update_lineNum) {
    params.Line_Num = map(space_int, 0, 10 / 3, 10, 40);
    set_Up_Lines();
    update_lineNum = false;
  }
  if (control.Space <= 4) {
    params.ChangeSpeed = map(space_int, 0, 5, 0.03, 0.01);
  }
  else {
    params.ChangeSpeed = map(space_int, 5, 10, 0.002, 0.01);
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

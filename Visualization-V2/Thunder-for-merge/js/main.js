let params_basic = {
  PARTICLE_NUMBER: 5000,
  Particles_in_scene: 0,
  WORLD_WIDTH: 1600,
  WORLD_HEIGHT: 900,
  WORLD_DEPTH: 1500,
}

let thunder_params = {
  StartPoints: 5,
  AngleRange: 30,
  thunderLifespan: 1,
  BranchAngleRange: 70,
  anglePossibility: 0.05,
  branchPossibility: 0.008,
  moveSpdMin: 0,
  moveSpdMax: 1,
  thickness: 1,
  //
  particleLifeSpan: 1.0,
  flowPosFreq: 0.05,
  flowTimeFreq: 0.005,
  flowSpd: 0.005,

};

let control = {
  Weight: 5,
  Time: 5, // acceleration
  Space: 5,
  Flow: 5,
}

let thunder_thunders = [];

let pointCloud;
let particles = [];

function setupThree() {
  // set up things array
  add_Lightning(1);

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // gui
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.add(params_basic, "PARTICLE_NUMBER", 0, 20000).step(1);
  folderBasic.add(params_basic, "WORLD_WIDTH", 0, 2000, 10);
  folderBasic.add(params_basic, "WORLD_HEIGHT", 0, 2000, 10);
  folderBasic.add(params_basic, "WORLD_DEPTH", 0, 2000, 10);
  params_basic.Particles_in_scene = particles.length;
  folderBasic.add(params_basic, "Particles_in_scene").listen();

  let folderThunder = gui.addFolder("LINES CONTROL");
  folderThunder.add(thunder_params, "StartPoints", 1, 10, 1).listen();
  folderThunder.add(thunder_params, "AngleRange", 1, 90, 1).listen();
  folderThunder.add(thunder_params, "BranchAngleRange", 1, 90, 1).listen();
  folderThunder.add(thunder_params, "anglePossibility", 0, 1, 0.001).listen();
  folderThunder.add(thunder_params, "branchPossibility", 0, 0.5, 0.001).listen();
  folderThunder.add(thunder_params, "moveSpdMin", 0, 5, 0.1).listen();
  folderThunder.add(thunder_params, "moveSpdMax", 1, 10, 0.1).listen();
  folderThunder.add(thunder_params, "thickness", 1, 5, 0.1).listen();

  let folderParticle = gui.addFolder("PARTICLE CONTROL");
  folderParticle.add(thunder_params, "particleLifeSpan", 0, 2, 0.01).listen();
  folderParticle.add(thunder_params, "flowPosFreq", 0, 1, 0.001).listen();
  folderParticle.add(thunder_params, "flowTimeFreq", 0, 1, 0.001).listen();
  folderParticle.add(thunder_params, "flowSpd", 0, 0.1, 0.0001).listen();

  let ControlFolder = gui.addFolder("CONTROL");
  ControlFolder.open();
  ControlFolder.add(control, "Weight", 0, 10, 0.1);
  ControlFolder.add(control, "Time", 0, 10, 0.1);
  ControlFolder.add(control, "Space", 0, 10, 0.1);
  ControlFolder.add(control, "Flow", 0, 10, 0.1);


}

function updateThree() {
  // mode_Control();
  controller();
  add_Lightning(0.01);
  if (particles.length < params_basic.PARTICLE_NUMBER) {
    for (const thunder of thunder_thunders) {
      let noiseFreq = 0.05;
      let noiseRange = 10;
      let noiseValueX = noise(thunder.pos.x * noiseFreq, frame * noiseFreq);
      let noiseValueY = noise(thunder.pos.y * noiseFreq, frame * noiseFreq);
      let adjX = map(noiseValueX, 0, 1, -noiseRange, noiseRange);
      let adjY = map(noiseValueY, 0, 1, -noiseRange, noiseRange);
      let adj_x = random(-thunder_params.thickness, thunder_params.thickness);
      let adj_y = random(-thunder_params.thickness, thunder_params.thickness);
      let p = new ThunderParticle()
        .set_pos(thunder.pos.x + adjX + adj_x, thunder.pos.y + adjY + adj_y)
        .set_lifespan(thunder_params.particleLifeSpan)
        .set_vel(0, 0);
      particles.push(p);
    }
  }

  // update the things
  for (let i = 0; i < thunder_thunders.length; i++) {
    let thunder = thunder_thunders[i];
    thunder.move();
    thunder.age();
    thunder.changeAngle(thunder_params.anglePossibility);
    add_Branch(thunder, thunder_params.branchPossibility);
    if (thunder.isDone == true) {
      thunder_thunders.splice(i, 1);
      i--;
    }
  }


  // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.move();
    p.age();
    p.check_pos();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }

    // update the points
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
    params_basic.Particles_in_scene = particles.length;
  }
}

function getPoints() {
  const vertices = new Float32Array(params_basic.PARTICLE_NUMBER * 3);
  const colors = new Float32Array(params_basic.PARTICLE_NUMBER * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 2,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  // Points
  const points = new THREE.Points(geometry, material);
  return points;
}

// ================== UPDATE LIGHTNING ===================
function add_Lightning(possibility) {
  if (random(1) < possibility) {
    thunder_thunders.push(
      new Thunder()
        .set_pos(random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2), random(-params_basic.WORLD_HEIGHT / 2, params_basic.WORLD_HEIGHT / 2), 0)
        .set_vel(random(-1, 1), random(-1, 1))
        .set_lifespan(thunder_params.thunderLifespan)
        .set_spd(random(thunder_params.moveSpdMin, thunder_params.moveSpdMax))
        // .set_spd(0.5)
        .set_lifeReduction(random(0.001, 0.01))
    )
    // console.log(thunder_params.moveSpdMin, thunder_params.moveSpdMax);
  }
}
function add_Branch(thunder, possibility) {
  if (random(1) < (thunder.depth * possibility)) {
    let newThunder = new Thunder()
      .set_pos(thunder.pos.x, thunder.pos.y, thunder.pos.z)
      .set_vel(thunder.vel.x, thunder.vel.y, thunder.vel.z)
      .set_lifespan(thunder_params.thunderLifespan)
      .set_spd(random(thunder_params.moveSpdMin, thunder_params.moveSpdMax))
      // .set_spd(0.5)
      .set_lifeReduction(random(0.001, 0.01))
      .reduce_depth(random(0.5))
    newThunder.adjust_age(random(0.5));
    newThunder.rotate(radians(random(-thunder_params.BranchAngleRange, thunder_params.BranchAngleRange)));
    thunder_thunders.push(newThunder);
    thunder.changeAngle(thunder_params.anglePossibility * 10);
    thunder.adjust_age(random(0.5));
    thunder.reduce_depth(random(0.5));
  }
}


// ========================= CLASSES =============================

class Thunder {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.lifespan = 1;
    this.lifeReduction = random(0.004, 0.005);
    this.isDone = false;
    this.depth = 1;
  }
  set_pos(x, y, z = 0) {
    this.pos = createVector(x, y, z);
    return this;
  }
  set_vel(x, y, z = 0) {
    this.vel = createVector(x, y, z);
    return this;
  }
  set_lifeReduction(val) {
    this.lifeReduction = val;
    return this;
  }
  set_spd(spd) {
    this.vel.normalize();
    this.vel.mult(spd);
    return this;
  }
  set_lifespan(val) {
    this.lifespan = val;
    return this;
  }
  reduce_depth(val) {
    this.depth -= val;
    if (this.depth <= 0) {
      this.depth = 0;
      this.isDone = true;
    }
    return this;
  }
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  adjust_age(val) {
    this.lifespan -= val;
  }
  changeAngle(possibility) {
    if (random(1) < possibility) {
      let angle = radians(random(-thunder_params.AngleRange, thunder_params.AngleRange));
      this.vel.rotate(angle);
    }
  }
  rotate(angle) {
    this.vel.rotate(angle);
  }
  move() {
    this.pos.add(this.vel);
  }
}


// ============================
class ThunderParticle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 0;
    this.lifeReduction = random(0.003, 0.005);
    this.isDone = false;

    this.moveScl = random();

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };
    // particles.push(this);
  }

  set_pos(x, y, z = 0) {
    this.pos = createVector(x, y, z);
    return this;
  }
  set_color(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    return this;
  }
  set_lifespan(val) {
    this.lifespan = val;
    return this;
  }
  set_vel(x, y, z = 0) {
    this.vel = createVector(x, y, z);
    return this;
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
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  check_pos() {
    if (this.pos.x > params_basic.WORLD_WIDTH / 2 || this.pos.x < -params_basic.WORLD_WIDTH / 2 || this.pos.y > params_basic.WORLD_HEIGHT / 2 || this.pos.y < -params_basic.WORLD_HEIGHT / 2) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  flow() {
    let posFreq = thunder_params.flowPosFreq;
    let timeFreq = thunder_params.flowTimeFreq;
    let xFreq = this.pos.x * posFreq + frame * timeFreq;
    let yFreq = this.pos.y * posFreq + frame * timeFreq;
    let zFreq = this.pos.z * posFreq + frame * timeFreq;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    force.mult(thunder_params.flowSpd);
    this.applyForce(force);
  }
}


// ================ CONTROL =====================


function controller() {
  // weight
  if (control.Weight <= 5) {
    thunder_params.branchPossibility = map(control.Weight, 0, 5, 0.004, 0.0055);
    thunder_params.moveSpdMin = map(control.Weight, 0, 5, 0.1, 1);
    thunder_params.moveSpdMax = map(control.Weight, 0, 5, 0.3, 2);
  }
  else {
    thunder_params.branchPossibility = map(control.Weight, 5, 10, 0.0055, 0.015);
    thunder_params.moveSpdMin = map(control.Weight, 5, 10, 1, 5);
    thunder_params.moveSpdMax = map(control.Weight, 5, 10, 2, 7);
  }
  thunder_params.thickness = floor(map(control.Weight, 0, 10, 1, 10)) * noise(frame * 0.05);

  // time 
  if (control.Time <= 5) {
    thunder_params.flowSpd = map(control.Time, 0, 5, 0.005, 0.01);
    thunder_params.particleLifeSpan = map(control.Time, 0, 5, 1.0, 0.6);
    thunder_params.flowTimeFreq = map(control.Time, 0, 5, 0.002, 0.005);
  }
  else {
    thunder_params.flowSpd = map(control.Time, 5, 10, 0.01, 0.03);
    thunder_params.particleLifeSpan = map(control.Time, 5, 10, 0.6, 0.3);
    thunder_params.flowTimeFreq = map(control.Time, 5, 10, 0.005, 0.01);
  }

  // Space
  if (control.Space <= 5) {
    thunder_params.anglePossibility = map(control.Space, 0, 5, 0.01, 0.05);
    thunder_params.BranchAngleRange = map(control.Space, 0, 5, 60, 80);
    thunder_params.AngleRange = map(control.Space, 0, 5, 20, 35);
  }
  else {
    thunder_params.anglePossibility = map(control.Space, 5, 10, 0.05, 0.2);
    thunder_params.BranchAngleRange = map(control.Space, 0, 5, 60, 120);
    thunder_params.AngleRange = map(control.Space, 5, 10, 35, 55);
  }

  // flow
  if (control.Flow <= 5) {
    thunder_params.flowPosFreq = map(control.Flow, 0, 5, 0.01, 0.06);
  }
  else {
    thunder_params.flowPosFreq = map(control.Flow, 5, 10, 0.06, 0.2);
  }
}
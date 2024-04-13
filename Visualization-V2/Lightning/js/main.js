let params = {
  MAX_PARTICLE_NUMBER: 5000,
  WORLD_WIDTH: 1600,
  WORLD_HEIGHT: 1000,
  WORLD_DEPTH: 1000,
  Particles_in_scene: 0,
  //
  StartPoints: 5,
  AngleRange: 30,
  thingLifespan: 1,
  BranchAngleRange: 70,
  anglePossibility: 0.05,
  branchPossibility: 0.008,
  moveSpdMin: 0,
  moveSpdMax: 1,
  thickness: 1,
  particleNum: 1,
  //
  particleLifeSpan: 1.0,
  flowPosFreq: 0.05,
  flowTimeFreq: 0.005,
  flowSpd: 0.005,
  //
  YANG: false,
  YIN: false,
};

let control = {
  Weight: 5,
  Time: 5, // acceleration
  Space: 5,
  Flow: 5,
}

let things = [];

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
  folderBasic.add(params, "MAX_PARTICLE_NUMBER", 0, 20000).step(1);
  folderBasic.add(params, "WORLD_WIDTH", 0, 2000, 10);
  folderBasic.add(params, "WORLD_HEIGHT", 0, 2000, 10);
  folderBasic.add(params, "WORLD_DEPTH", 0, 2000, 10);
  params.Particles_in_scene = particles.length;
  folderBasic.add(params, "Particles_in_scene").listen();

  let folderThing = gui.addFolder("LINES CONTROL");
  folderThing.add(params, "StartPoints", 1, 10, 1).listen();
  folderThing.add(params, "AngleRange", 1, 90, 1).listen();
  folderThing.add(params, "BranchAngleRange", 1, 90, 1).listen();
  folderThing.add(params, "anglePossibility", 0, 1, 0.001).listen();
  folderThing.add(params, "branchPossibility", 0, 0.5, 0.001).listen();
  folderThing.add(params, "moveSpdMin", 0, 5, 0.1).listen();
  folderThing.add(params, "moveSpdMax", 1, 10, 0.1).listen();
  folderThing.add(params, "thickness", 1, 5, 0.1).listen();
  folderThing.add(params, "particleNum", 1, 5, 1).listen();

  let folderParticle = gui.addFolder("PARTICLE CONTROL");
  folderParticle.add(params, "particleLifeSpan", 0, 2, 0.01).listen();
  folderParticle.add(params, "flowPosFreq", 0, 1, 0.001).listen();
  folderParticle.add(params, "flowTimeFreq", 0, 1, 0.001).listen();
  folderParticle.add(params, "flowSpd", 0, 0.1, 0.0001).listen();

  let ModeControl = gui.addFolder("Mode Control");
  ModeControl.add(params, "YANG");
  ModeControl.add(params, "YIN");

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
  if (particles.length < params.MAX_PARTICLE_NUMBER) {
    for (const thing of things) {
      let noiseFreq = 0.05;
      let noiseRange = 10;
      let noiseValueX = noise(thing.pos.x * noiseFreq, frame * noiseFreq);
      let noiseValueY = noise(thing.pos.y * noiseFreq, frame * noiseFreq);
      let adjX = map(noiseValueX, 0, 1, -noiseRange, noiseRange);
      let adjY = map(noiseValueY, 0, 1, -noiseRange, noiseRange);
      for (let i = 0; i < params.particleNum; i++) {
        let adj_x = random(-params.thickness, params.thickness);
        let adj_y = random(-params.thickness, params.thickness);
        let p = new Particle()
          .set_pos(thing.pos.x + adjX + adj_x, thing.pos.y + adjY + adj_y)
          .set_lifespan(params.particleLifeSpan)
          // .set_lifespan(0.1)
          .set_vel(0, 0);
        particles.push(p);
      }
    }
  }

  // update the things
  for (let i = 0; i < things.length; i++) {
    let thing = things[i];
    thing.move();
    thing.age();
    thing.changeAngle(params.anglePossibility);
    add_Branch(thing, params.branchPossibility);
    if (thing.isDone == true) {
      things.splice(i, 1);
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
    params.Particles_in_scene = particles.length;
  }
}

function getPoints() {
  const vertices = new Float32Array(params.MAX_PARTICLE_NUMBER * 3);
  const colors = new Float32Array(params.MAX_PARTICLE_NUMBER * 3);

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
    things.push(
      new MovingThing()
        .set_pos(random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2), random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2), 0)
        .set_vel(random(-1, 1), random(-1, 1))
        .set_lifespan(params.thingLifespan)
        .set_spd(random(params.moveSpdMin, params.moveSpdMax))
        // .set_spd(0.5)
        .set_lifeReduction(random(0.001, 0.01))
    )
    // console.log(params.moveSpdMin, params.moveSpdMax);
  }
}
function add_Branch(thing, possibility) {
  if (random(1) < (thing.depth * possibility)) {
    let newThing = new MovingThing()
      .set_pos(thing.pos.x, thing.pos.y, thing.pos.z)
      .set_vel(thing.vel.x, thing.vel.y, thing.vel.z)
      .set_lifespan(params.thingLifespan)
      .set_spd(random(params.moveSpdMin, params.moveSpdMax))
      // .set_spd(0.5)
      .set_lifeReduction(random(0.001, 0.01))
      .reduce_depth(random(0.5))
    newThing.adjust_age(random(0.5));
    newThing.rotate(radians(random(-params.BranchAngleRange, params.BranchAngleRange)));
    things.push(newThing);
    thing.changeAngle(params.anglePossibility * 10);
    thing.adjust_age(random(0.5));
    thing.reduce_depth(random(0.5));
  }
}


// ========================= CLASSES =============================

class MovingThing {
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
      let angle = radians(random(-params.AngleRange, params.AngleRange));
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
class Particle {
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
    if (this.pos.x > params.WORLD_WIDTH / 2 || this.pos.x < -params.WORLD_WIDTH / 2 || this.pos.y > params.WORLD_HEIGHT / 2 || this.pos.y < -params.WORLD_HEIGHT / 2) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  flow() {
    let posFreq = params.flowPosFreq;
    let timeFreq = params.flowTimeFreq;
    let xFreq = this.pos.x * posFreq + frame * timeFreq;
    let yFreq = this.pos.y * posFreq + frame * timeFreq;
    let zFreq = this.pos.z * posFreq + frame * timeFreq;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    force.mult(params.flowSpd);
    this.applyForce(force);
  }
}


// ================ YIN YANG CONTROL =====================

function mode_Control() {
  if (params.YANG == true) {
    // line
    // params.AngleRange= 30;
    // params.BranchAngleRange= 70;
    params.anglePossibility = 0.08;
    params.branchPossibility = 0.07;
    params.moveSpdMin = 3;
    params.moveSpdMax = 5;
    params.thickness = noise(frame * 0.05) * 3;
    params.particleNum = 1;
    params.thingLifespan = 0.5;

    // particles
    params.particleLifeSpan = 0.3;
    params.flowPosFreq = 0.05;
    params.flowTimeFreq = 0.01;
    params.flowSpd = 0.05;
  }

  else if (params.YIN == true) {
    // // line
    // // params.AngleRange= 30;
    // // params.BranchAngleRange= 70;
    // params.anglePossibility = 0.04;
    // params.branchPossibility = 0.05;
    // params.moveSpdMin = 0.3;
    // params.moveSpdMax = 2;
    // params.thickness = noise(frame * 0.05) * 1;
    // params.particleNum = 1;
    // params.thingLifespan = 1;

    // // particles
    // params.particleLifeSpan = 0.3;
    // params.flowPosFreq = 0.05;
    // params.flowTimeFreq = 0.01;
    // params.flowSpd = 0.05;
  }


  else {
    // line
    // params.StartPoints = 5;
    // params.AngleRange = 30;
    params.BranchAngleRange = 70;
    params.anglePossibility = 0.01;
    params.branchPossibility = 0.006;
    params.moveSpdMin = 1;
    params.moveSpdMax = 2;
    params.thickness = noise(frame * 0.05) * 1;
    params.particleNum = 1;
    params.thingLifespan = 1;

    // particles
    params.particleLifeSpan = 1.0;
    params.flowPosFreq = 0.03;
    params.flowTimeFreq = 0.005;
    params.flowSpd = 0.01;
  }

}




function controller() {
  // weight
  if (control.Weight <= 5) {
    params.branchPossibility = map(control.Weight, 0, 5, 0.004, 0.0055);
    params.moveSpdMin = map(control.Weight, 0, 5, 0.01, 1);
    params.moveSpdMax = map(control.Weight, 0, 5, 0.3, 2);
    // params.thickness = floor(map(control.Weight, 0, 10, 1, 4)) * noise(frame * 0.05);
  }
  else {
    params.branchPossibility = map(control.Weight, 5, 10, 0.0055, 0.015);
    params.moveSpdMin = map(control.Weight, 5, 10, 0.5, 5);
    params.moveSpdMax = map(control.Weight, 5, 10, 1, 7);
    // params.thickness = floor(map(control.Weight, 0, 10, 1, 4)) * noise(frame * 0.05);
  }

  // time 
  if (control.Time <= 5) {
    params.flowSpd = map(control.Time, 0, 5, 0.005, 0.01);
    params.particleLifeSpan = map(control.Time, 0, 5, 1.0, 0.6);
    params.flowTimeFreq = map(control.Time, 0, 5, 0.002, 0.005);
  }
  else {
    params.flowSpd = map(control.Time, 5, 10, 0.01, 0.03);
    params.particleLifeSpan = map(control.Time, 5, 10, 0.6, 0.3);
    params.flowTimeFreq = map(control.Time, 5, 10, 0.005, 0.01);
  }

  // Space
  if (control.Space <= 5) {
    params.anglePossibility = map(control.Space, 0, 5, 0.01, 0.05);
    params.BranchAngleRange = map(control.Space, 0, 5, 60, 80);
    params.angleRange = map(control.Space, 0, 5, 20, 35);
  }
  else {
    params.anglePossibility = map(control.Space, 5, 10, 0.05, 0.2);
    params.BranchAngleRange = map(control.Space, 0, 5, 60, 120);
    params.angleRange = map(control.Space, 5, 10, 35, 55);
  }

  // flow
  if (control.Flow <= 5) {
    params.flowPosFreq = map(control.Flow, 0, 5, 0.01, 0.06);
  }
  else {
    params.flowPosFreq = map(control.Flow, 5, 10, 0.06, 0.2);
  }
}
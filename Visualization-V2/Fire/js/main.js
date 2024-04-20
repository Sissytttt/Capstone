// set_life_reduction(val)

let params = {
  PARTICLE_NUMBER: 6000,
  particleNum: 0,
  color: "#FFFFFF",
  WORLD_LENGTH: 1000,
  WORLD_HEIGHT: 700,
  WORLD_DEPTH: 600,
  // particles
  lifeSpan: 1,
  proportion: 0.5, // the portion of upper fire and lower fire // big = lower more
  // lower fire // decrease lifespan to check the following
  distributionFactor: 5, // 集中/均匀生成粒子 // big = condense // power factor for mapping the noise value
  distributionFreq: 0.02, // 火苗更大/更细小 // big = small // frequency for noise postions
  // upper fire
  areaSize: 0.75,
  // move
  flowSpd: 0.008,
  moveupSpd: 1,
  flowForceX: 15,
  flowForceY: 10,
  flowForceZ: 15,
  opacityAdj: 0.1,
  lifeReductionMin: 0.001,
  lifeReductionMax: 0.007,
};


let control = {
  Weight: 5,
  Time: 5, // acceleration
  Space: 5,
  Flow: 5,
  ForceX: 0, // for Fire
}


let pointCloud;
let particles = [];

function setupThree() {
  // initialize particles
  while (particles.length < params.PARTICLE_NUMBER) {
    generate_new_particle();
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // GUI
  let folderBasic = gui.addFolder("WORLD BASIC");
  // folderBasic.open();
  folderBasic.add(params, "PARTICLE_NUMBER", 0, params.PARTICLE_NUMBER).step(1).listen();
  folderBasic.add(params, "particleNum").listen();
  folderBasic.addColor(params, 'color');

  let FactorsParticles = gui.addFolder("Particles_Factors");
  FactorsParticles.add(params, "lifeSpan", 0.5, 3).step(0.1);
  // FactorsParticles.add(params, "opacityAdj", 0, 1).step(0.01);

  let FactorsLower = gui.addFolder("LOWER_FIRE_Factors");
  FactorsLower.add(params, "distributionFactor", 1, 5).step(0.1);
  FactorsLower.add(params, "distributionFreq", 0.01, 0.06).step(0.001);

  let FactorsUpper = gui.addFolder("UPPER_FIRE_Factors");
  FactorsUpper.add(params, "areaSize", 0, 1).step(0.01);

  let ControlFolder = gui.addFolder("CONTROL");
  ControlFolder.open();
  ControlFolder.add(control, "Weight", 0, 10, 0.1);
  ControlFolder.add(control, "Time", 0, 10, 0.1);
  ControlFolder.add(control, "Space", 0, 10, 0.1);
  ControlFolder.add(control, "Flow", 0, 10, 0.1);
  ControlFolder.add(control, "ForceX", -5, 5, 0.1);
}

function updateThree() {
  controller();
  // set GUI variables
  let c = color(params.color);

  // generate new particles
  while (particles.length < params.PARTICLE_NUMBER) {
    if (random() < params.proportion) {
      generate_new_particle();
    }
    else {
      add_upper_points();
    }
  }

  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.moveup();
    p.move();
    p.apply_outsideForce(1);
    p.update_opacity(params.opacityAdj);
    p.age();
    if (p.isDone || p.pos.y > params.WORLD_HEIGHT / 2) {
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
    colorArray[ptIndex + 0] = p.color.r * p.opacity;
    colorArray[ptIndex + 1] = p.color.g * p.opacity;
    colorArray[ptIndex + 2] = p.color.b * p.opacity;
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

// ======================= Functions ===========================

function generate_new_particle() {
  let x = random(-params.WORLD_LENGTH / 2, params.WORLD_LENGTH / 2);
  // let powFactor = 5;
  let powFactor = params.distributionFactor;
  let distributionFreq = params.distributionFreq;
  let noiseFreq = x * distributionFreq + frame * 0.005;
  let noiseValue = noise(noiseFreq);
  let threshold = map(pow(noiseValue, powFactor), 0, 1, 0, 1);
  let lifeReduction = map(noise(noiseFreq), 0, 1, 0.007, 0.001);
  let moveUp = map(noiseValue, 0, 1, 0, 1);
  if (random(1) < threshold) {
    let p = new Particle()
      .setPos(x, 0 - params.WORLD_HEIGHT / 2, 0)
      .set_life_reduction(lifeReduction)
      .set_move_up(moveUp)
      .set_forceScl(noiseValue);
    particles.push(p);
  }
}

function add_upper_points() {
  let distributionFreq = 0.01;
  let x = random(-params.WORLD_LENGTH / 2, params.WORLD_LENGTH / 2);
  let y = random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2);
  let xFreq = (x + 1000) * distributionFreq + sin(frame * 0.005);
  // let xFreq = x * distributionFreq + frame * 0.005;
  let yFreq = y * distributionFreq - frame * 0.005;
  let noiseValue = noise(xFreq, yFreq);
  let lifeReduction = map(noiseValue, 0, 1, params.lifeReductionMin, params.lifeReductionMax);
  let moveUp = map(noiseValue, 0, 1, 0, 1);
  if ((noiseValue > params.areaSize)) {
    let p = new Particle()
      .setPos(x, y, 0)
      .set_life_reduction(lifeReduction)
      .set_move_up(moveUp)
      .set_forceScl(noiseValue);
    particles.push(p);
  }
}


// ==============================================================
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = params.lifeSpan;
    this.lifeReduction = 0;
    this.isDone = false;
    this.opacity = 1;
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
  set_life_reduction(val) {  // need overwrite
    this.lifeReduction = val;
    return this;
  }
  set_move_up(val) {
    this.moveUp = val;
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
  set_forceScl(val) {
    this.forceScl = val;
    return this;
  }
  update_opacity(range) {
    if (this.lifespan < range) {
      let xFreq = this.pos.x * 0.003 + frame * 0.05;
      let yFreq = this.pos.y * 0.003 + frame * 0.05;
      let zFreq = this.pos.z * 0.005 + frame * 0.05;
      let opcacityReduction = noise(xFreq, yFreq, zFreq);
      this.opacity -= opcacityReduction;
    }
    else {
      this.opacity = this.lifespan;
    }
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
    let xFreq = this.pos.x * 0.03 + frame * 0.05;
    let yFreq = this.pos.y * 0.05 + frame * 0.05;
    let zFreq = this.pos.z * 0.05 + frame * 0.05;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -params.flowForceX, params.flowForceX);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, - params.flowForceY, params.flowForceY);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -params.flowForceZ, params.flowForceZ);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    force.mult(params.flowSpd);
    this.apply_force(force);
  }

  moveup() {
    let forceUp = new p5.Vector(0, 1, 0);
    forceUp.mult(0.01);
    forceUp.mult(this.moveUp * params.moveupSpd)
    this.apply_force(forceUp);
  }

  apply_outsideForce(scl) {
    let force = createVector(control.ForceX * this.forceScl, 0);
    let scale = 0;
    if (this.forceScl > 0.5) {
      scale = map(this.forceScl, 0.5, 1, 0, 1);
      force.mult(scl * 0.005 * scale);
      this.apply_force(force);
    }
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

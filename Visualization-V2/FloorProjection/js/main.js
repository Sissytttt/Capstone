let params = {
  MAX_PARTICLE_NUMBER: 5000,
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 1000,
  // Big circle (bagua)
  BigCircleRad: 500,
  BigCircleAngle: 0,
  moveSpeed: 1, // needs to be divisible by 90 （90 % moveSpeed == 0）
  // Small circle
  SmallCircleRad: 100,
  breathFreq: 0.02,
  breathingAmp: 20,
  pointRad: 10,
  shrinkSpeed: 1,
  // particles
  lifeReductionMin: 0.001,
  lifeReductionMax: 0.05,
  velRange: 0.03,
  velRangeTop: 1,
  // trace
  traceThreshold: 0.3,
  traceVelRange: 0.1,
  traceAdjAngle: 10, // 避免trace画到圆里面, 初始为0，之后根据小圆的大小调整
  rotationSpeedTop: 1,
  rotationParVelRange: 0.1,
  spreadRad: 0,
  spreadSpd: 0.0005,
  // whole process
  phase2WaitTime: 150,
  phase2stage3Time: 60,
  phase3stage1Time: 100,
};


let testMode = false;

const WORLD_SIZE = 1000;

let pointCloud;
let particles = [];

let mousePos, centerPos, moveDirection;
let mouseIsClicked = false;

let SmallCircleRad = params.SmallCircleRad;
let breathingAmp = params.breathingAmp;

let velRange = params.velRange;
let lifeReductionMin = params.lifeReductionMin;
let lifeReductionMax = params.lifeReductionMax;

// trace
let trajAngle = 0;
let traceAdjAngle = 0; // 避免trace画到圆里面, 初始为0，之后等于params.traceAdjAngle
let rotationSpeed = 0; // start from 0, reach to params.rotationSpeedTop
let spread = false;

// whole process
let pause = true;
let phase1Finish = false;
let phase2StartTime = 0;
let phase2stage3;
let phase2Finish = false;
let phase3StartTime = 0;
let phase3transmit = false;



function setupThree() {

  if (testMode == true) { // fast speed
    params.moveSpeed *= 10;
    params.shrinkSpeed *= 10;
    // params.rotationSpeedTop *= 10;
    // params.phase2WaitTime = 10;
    // params.spreadSpd *= 10;
  }

  mousePos = createVector(0, 0);
  centerPos = createVector(0, 0);
  moveDirection = createVector(0, 0);

  // particles
  for (let i = 0; i < params.MAX_PARTICLE_NUMBER; i++) {
    let angle = random(TWO_PI);
    let x = cos(angle) * params.SmallCircleRad;
    let y = sin(angle) * params.SmallCircleRad;
    let tParticle = new Particle()
      .setPosition(x, y, random(-5, 5))
      .setVelocity(random(-velRange, velRange), random(-velRange, velRange), random(-velRange, velRange))
      .setLifeReduction(lifeReductionMin, lifeReductionMax);
    particles.push(tParticle);
  }
  params.drawCount = particles.length;

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);
}

function updateThree() {
  if (phase1Finish == false) {
    phase1_bagua_trace();
    phase1_updateParticles();
  }
  else if ((phase2Finish == false)) {
    phase2_Rotation();
    phase2_updateParticles();
  }
  else {
    phase3_transmit();
    phase3_updateParticles();
  }
  // then update the points
  let positionArray = pointCloud.geometry.attributes.position.array;
  let colorArray = pointCloud.geometry.attributes.color.array;
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let ptIndex = i * 3;
    // position
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
    //color
    colorArray[ptIndex + 0] = 1.0 * p.lifespan;
    colorArray[ptIndex + 1] = 1.0 * p.lifespan;
    colorArray[ptIndex + 2] = 1.0 * p.lifespan;
  }
  pointCloud.geometry.setDrawRange(0, particles.length); // ***
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.attributes.color.needsUpdate = true;

  // update GUI
  params.drawCount = particles.length;
}

function getPoints(objects) {
  const vertices = [];
  const colors = [];

  for (let obj of objects) {
    vertices.push(obj.pos.x, obj.pos.y, obj.pos.z);
    colors.push(1, 1, 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const drawCount = objects.length; // draw the whole objects
  geometry.setDrawRange(0, drawCount);
  const texture = new THREE.TextureLoader().load('assets/particle_texture.jpg');
  const material = new THREE.PointsMaterial({
    //color: 0xFF9911,
    vertexColors: true,
    size: 3,
    sizeAttenuation: true, // default
    opacity: 0.9,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    map: texture
  });
  const points = new THREE.Points(geometry, material);
  return points;
}



// ====================== phase 1 ==========================
function phase1_bagua_trace() {
  move_center();
  phase1_generateParticles();
  if (pause == true && mouseIsClicked == false) {
    velRange = params.velRange;
    SmallCircleRad = lerp(SmallCircleRad, params.SmallCircleRad, 0.05)
    if (abs(SmallCircleRad - params.SmallCircleRad) < 0.1) {
      SmallCircleRad = params.SmallCircleRad;
    }
    if (breathingAmp < params.breathingAmp) {
      breathingAmp++;
    }
  }
  if (pause == true && mouseIsClicked) { // mouse clicked
    if (SmallCircleRad > params.pointRad) { // circle shrinks
      if (breathingAmp > 10) {
        breathingAmp--;
      }
      if (SmallCircleRad > params.pointRad) {
        SmallCircleRad -= params.shrinkSpeed;
      }
      if (velRange < params.velRangeTop) {
        velRange += 0.05;
      }
      lifeReductionMax = 0.01;
    }
    // move center
    else if (SmallCircleRad <= 10) {
      lifeReductionMax = params.lifeReductionMax;
      pause = false; // move center
      mouseIsClicked = false;
    }
    // pause set to true when reach the next position 
  }
}

function phase1_generateParticles() {
  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    if (trajAngle > 0 && random() < params.traceThreshold) { // generate particles for trace
      if (trajAngle > params.traceAdjAngle) {
        traceAdjAngle = params.traceAdjAngle
      }
      let angle = random() * (trajAngle - traceAdjAngle);
      let x, y;
      if (angle <= 180) {
        x = sin(radians(angle)) * params.BigCircleRad;
        y = cos(radians(angle)) * params.BigCircleRad + params.BigCircleRad;
      }
      else if (angle < 360) {
        x = sin(radians(angle)) * params.BigCircleRad;
        y = -(cos(radians(angle)) * params.BigCircleRad + params.BigCircleRad);
      }
      let tParticle = new Particle()
        .setPosition(x, y, random(-5, 5))
        .setVelocity(random(-params.traceVelRange, params.traceVelRange), random(-params.traceVelRange, params.traceVelRange), random(-params.traceVelRange, params.traceVelRange))
        .setLifeReduction(lifeReductionMin, lifeReductionMax);
      particles.push(tParticle);

    }
    else { // generate particles for circle
      velRange = params.velRange;
      let angle = random(TWO_PI);
      let x = centerPos.x + cos(angle) * (SmallCircleRad + sin(frame * params.breathFreq) * breathingAmp);
      let y = centerPos.y + sin(angle) * (SmallCircleRad + sin(frame * params.breathFreq) * breathingAmp);
      let tParticle = new Particle()
        .setPosition(x, y, random(-5, 5))
        .setVelocity(random(-velRange, velRange), random(-velRange, velRange), random(-velRange, velRange))
        .setLifeReduction(lifeReductionMin, lifeReductionMax);
      particles.push(tParticle);
    }
  }
}

function move_center() {
  if (pause == false && phase1Finish == false) {
    trajAngle += params.moveSpeed;
    velRange = 0.01;
  }
  if (trajAngle % 90 == 0) {
    pause = true;
  }
  if (trajAngle <= 180) {
    centerPos.x = sin(radians(trajAngle)) * params.BigCircleRad;
    centerPos.y = cos(radians(trajAngle)) * params.BigCircleRad + params.BigCircleRad;
  }
  else if (trajAngle < 360) {
    centerPos.x = sin(radians(trajAngle)) * params.BigCircleRad;
    centerPos.y = -(cos(radians(trajAngle)) * params.BigCircleRad + params.BigCircleRad);
  }
  else if (trajAngle > 360) {
    phase1Finish = true;
    phase2StartTime = frame;
  }
}

function phase1_updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow(1);
    p.move();
    p.adjustVelocity(-0.005);
    p.rotate();
    p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }
}

// ====================== phase 2 ==========================
function phase2_Rotation() {
  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    if (trajAngle > params.traceAdjAngle) {
      traceAdjAngle = params.traceAdjAngle
    }
    let angle = random() * (trajAngle - traceAdjAngle);
    let x, y;
    if (angle <= 180) {
      x = sin(radians(angle)) * params.BigCircleRad;
      y = cos(radians(angle)) * params.BigCircleRad + params.BigCircleRad;
    }
    else if (angle < 360) {
      x = sin(radians(angle)) * params.BigCircleRad;
      y = -(cos(radians(angle)) * params.BigCircleRad + params.BigCircleRad);
    }
    let rotationAngle = -radians(frame * rotationSpeed);
    if (rotationSpeed < params.rotationSpeedTop) {
      rotationSpeed += 0.00001;
    }
    let rotatedX = x * cos(rotationAngle) - y * sin(rotationAngle);
    let rotatedY = x * sin(rotationAngle) + y * cos(rotationAngle);
    x = rotatedX;
    y = rotatedY;
    console.log
    let tParticle = new Particle()
      .setPosition(x, y, random(-5, 5))
      .setVelocity(random(-params.rotationParVelRange, params.rotationParVelRange), random(-params.rotationParVelRange, params.rotationParVelRange), random(-params.rotationParVelRange, params.rotationParVelRange))
      .setLifeReduction(lifeReductionMin, lifeReductionMax);
    particles.push(tParticle);
  }
  if (frame - phase2StartTime >= params.phase2WaitTime) {
    spread = true;
  }
}

function phase2_updateParticles() {
  lifeReductionMin = 0.003;
  lifeReductionMax = 0.01;
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow(10);
    p.move();
    p.adjustVelocity(-0.005);
    p.rotate();
    p.age();
    if (spread == true && params.spreadRad < (params.BigCircleRad * 2 - 10)) {
      params.spreadRad += params.spreadSpd;
      p.check_dist_slice(params.spreadRad);
    }
    if (params.spreadRad >= (params.BigCircleRad * 2 - 20)) {
      p.check_dist_slice(params.spreadRad);
      if (!phase2stage3) {
        phase2stage3 = frame;
      }
      else if ((frame - phase2stage3) > params.phase2stage3Time) {
        phase2Finish = true;
      }
    }
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }
}

// ====================== phase 3 ==========================

let phase3Rad = params.BigCircleRad;

function phase3_transmit() {
  phase3_generatePar_stage1();
}

function phase3_generatePar_stage1() {
  lifeReductionMin = 0.001;
  lifeReductionMax = 0.01;
  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    let angle = random(TWO_PI);
    let x = cos(angle) * phase3Rad * 2;
    let y = sin(angle) * phase3Rad * 2;
    let tParticle = new Particle()
      .setPosition(x, y, random(-5, 5))
      .setVelocity(random(-params.velRange, params.velRange), random(-params.velRange, params.velRange), random(-params.velRange, params.velRange))
      .setLifeReduction(lifeReductionMin, lifeReductionMax);
    particles.push(tParticle);
  }
  if (frame - phase3StartTime > params.phase3stage1Time) {
    phase3transmit = true;
  }
}

function phase3_updateParticles() {
  if (phase3transmit) {
    params.MAX_PARTICLE_NUMBER -= 10;
  }
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (phase3transmit) {
      let frontForce = createVector(0, random(0.05, 0.2), 0);
      p.applyForce(frontForce);
    }
    else {
      p.flow(10);
    }
    p.move();
    p.adjustVelocity(-0.005);
    p.rotate();
    p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }
}


// ======================= class ===========================
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
    this.lifeReduction = 1;
    this.isDone = false;
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setVelocity(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setLifeReduction(min, max) {
    this.lifeReduction = random(min, max);
    return this;
  }
  setRotationAngle(x, y, z) {
    this.rot = createVector(x, y, z);
    return this;
  }
  setRotationVelocity(x, y, z) {
    this.rotVel = createVector(x, y, z);
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
    if (this.pos.z > WORLD_SIZE / 2) {
      this.pos.z = -WORLD_SIZE / 2;
    }
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
  flow(spd) {
    let xFreq = this.pos.x * 0.05 + frame * 0.005;
    let yFreq = this.pos.y * 0.05 + frame * 0.005;
    let zFreq = this.pos.z * 0.05 + frame * 0.005;
    let noiseValue = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(cos(frame * 0.005), sin(frame * 0.005), sin(frame * 0.002));
    force.normalize();
    force.mult(noiseValue * spd * 0.01);
    this.applyForce(force);
  }
  check_dist_reduce(limit) {
    let distance = this.pos.mag();
    if (distance < limit) {
      this.lifeReduction *= 4;
    }
  }
  check_dist_slice(limit) {
    let distance = this.pos.mag();
    if (distance < limit) {
      this.isDone = true;
    }
  }
}

document.addEventListener('click', function () {
  mouseIsClicked = true;
  console.log("mouse is clicked");
});


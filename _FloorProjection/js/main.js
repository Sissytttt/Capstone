// interaction process:
// phase 1:
//   small circles leading audience to walk in a YinYang shape
// phase 2: 
//   the YinYang rotate and spread into a circle
// phase 3:
//   the particles on the circle transmit to the front wall
// phase 4: (start inteaction)
//   the circle become smaller showing the interaction area; user interact with the front projection
// phase 5: (after inteaction, when the user step out of the circle)
//   the cirlce spread out and particles disappear
// reture to phase 1, starts a new cycle

// ------------------------ TODO --------------------
// why phase 5's vel is set automatically?????????
// restart sometimes not working well (?)
// restart -- 不要用space bar，自己过度（phase 5 的particles消失之后）

let params = {
  particleNum: 0,
  MAX_PARTICLE_NUMBER: 2000,
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 1000,
  // Big circle (bagua)
  BigCircleRad: 500,
  BigCircleAngle: 0,
  // phase 1
  phase1_breath_lifeReductionMin: 0.008,
  phase1_breath_lifeReductionMax: 0.02,
  phase1_breath_particleVel: 0.03,
  phase1_breathCircle_Rad: 100,
  phase1_breathCircle_Freq: 0.01, // big - faster
  phase1_breathCircle_Amp: 20,
  phase1_parFlowSpeed: 1,
  //
  phase1_shrink_prticleVel: 1,
  phase1_shrink_lifeReductionMin: 0.004,
  phase1_shrink_lifeReductionMax: 0.01,
  phase1_shrinkSpeed: 1,
  phase1_shrinkto_rad: 10,
  //
  phase1_trace_Threshold: 0.3,
  phase1_trace_particleVel: 0.1,
  phase1_trace_moveSpd: 0.5, // needs to be divisible by 90 （90 % moveSpeed == 0）
  phase1_trace_AdjAngle: 10, // 避免trace画到圆里面, 初始为0，这里写的是后面的大小，根据小圆的大小调整

  // phase 2 -- bagua rotation
  phase2_particleNumber: 5000,
  phase2_lifeReductionMin: 0.001,
  phase2_lifeReductionMax: 0.015,
  phase2_rotationSpeedTop: 0.5,
  phase2_rotationSpeedAcc: 0.00001,
  phase2_rotationParVelRange: 0.1,
  phase2_parFlowSpd: 1,
  phase2_spreadRad: 0,
  phase2_spreadSpd: 0.0005,
  phase2_stage2Time: 500, // wait until spread
  phase2_stage3Time: 300,
  //phase 3
  phase3_particleNumber: 5000, // same with phase2_particleNumber
  phase3_particleVel: 0.05,
  phase3_lifeReductionMin: 0.003,
  phase3_lifeReductionMax: 0.01,
  phase3_stage1Time: 100,
  phase3_moveUpSpd: 0.01,
  phase3_particleReductionSpd: 10,
  // phase 4
  phase4_particleNumber: 2000,
  phase4_circle_r: 400,
  phase4_circle_R: 1000,
  phase4_circle_sd: 20, // small - concentrated
  phase4_circle_rangeMin: 5,
  phase4_circle_rangeMax: 30,
  phase4_breathFreq: 0.02,
  phase4_breathAmp: 0.05,
  //
  phase5_angleNoise: 0.001,
  phase5_repulseSpdMin: 0.00000001,
  phase5_repulseSpdMax: 0.00005,
  phase5_lifeReductionMin: 0.005,
  phase5_lifeReductionMax: 0.01,
};


let testMode = false;

const WORLD_SIZE = 1000;

let pointCloud;
let particles = [];

let centerPos;
let mouseIsClicked = false;
// fast Sin & Cos
let sinArray = [];
let cosArray = [];
let sinCosResolution = 360 * 2; // 720
// sound
let SingingBowl0, SingingBowl1, SingingBowl2, SingingBowl3, SingingBowl4, SingingBowl5, SingingBowl_high;
//phase 1
let phase1_step = 1;
let playSoundOnce = false;
let smallCircleShrink = false;
let SmallCircleRad = params.phase1_breathCircle_Rad;
let breathingAmp = params.phase1_breathCircle_Amp;
// trace
let trajAngle = 0;
let traceAdjAngle = 0; // 避免trace画到圆里面, 初始为0，之后等于params.traceAdjAngle
let rotationSpeed = 0; // start from 0, reach to params.rotationSpeedTop
let spread = false;
// phase 2
let circleThreshold = 0;
// whole process
let pause = true;
let phase1Finish = false;
let phase2StartTime = 0;
let phase2stage3 = 0; // start time
let phase2stage2Start = false;
let phase2Finish = false;
let phase3Finish = false;
let phase3StartTime = 0;
let phase3transmit = false;
let phase4Finish = false;
let phase5Finish = false;


let audioListener;


// random initialization
let init_randomAngle;

function setupThree() {
  audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  get_SingingBowl_low('assets/sound/SingingBowl_low.MP3');
  get_SingingBowl_high('asset/sound/SingingBowl_low.MP3')
  setupFastSinCos();
  init_randomAngle = radians(random(360));
  if (testMode == true) { // fast speed
    params.phase1_trace_moveSpd *= 10;
    params.phase1_shrinkSpeed *= 10;
    params.phase2_stage2Time = 50;
    // params.phase3_particleReductionSpd = 50;
    params.phase2_spreadSpd = 0.01;
    params.phase3_stage1Time = 5;
  }
  centerPos = createVector(0, 0);

  // particles
  for (let i = 0; i < params.MAX_PARTICLE_NUMBER; i++) {
    let angle = random(TWO_PI);
    let x = mCos(angle) * params.phase1_breathCircle_Rad;
    let y = mSin(angle) * params.phase1_breathCircle_Rad;
    let tParticle = new Particle()
      .setPosition(x, y, random(-5, 5))
      .setVelocity(random(-params.phase1_velRange, params.phase1_velRange), random(-params.phase1_velRange, params.phase1_velRange), random(-params.phase1_velRange, params.phase1_velRange))
      .setLifeReduction(params.phase1_breath_lifeReductionMin, params.phase1_breath_lifeReductionMax);
    particles.push(tParticle);
  }
  params.drawCount = particles.length;

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  gui.add(params, "particleNum").listen();;
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
  else if (phase3Finish == false) {
    phase3_transmit();
    phase3_updateParticles();
  }
  else if (phase4Finish == false) {
    phase4_generateParticles();
    phase4_updateParticles();
  }
  else {
    phase5_updateParticles_disappear();
  }

  params.particleNum = particles.length; // update GUI


  // update the points' info
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
    SmallCircleRad = lerp(SmallCircleRad, params.phase1_breathCircle_Rad, 0.05); // circle spread 
    if (playSoundOnce == false) {
      console.log("playing", phase1_step)
      playSingingBowlBasedOnPhase();
      playSoundOnce = true;
    }
    if (abs(SmallCircleRad - params.phase1_breathCircle_Rad) < 0.1) {
      SmallCircleRad = params.phase1_breathCircle_Rad;
    }
    if (breathingAmp < params.phase1_breathCircle_Amp) {
      breathingAmp++;
    }
  }
  if (pause == true && mouseIsClicked) { // mouse clicked
    if (SmallCircleRad > params.phase1_shrinkto_rad) { // circle shrinks
      if (breathingAmp > 10) {
        breathingAmp--;
      }
      if (SmallCircleRad > params.phase1_shrinkto_rad) {
        SmallCircleRad -= params.phase1_shrinkSpeed;
        smallCircleShrink = true;
      }
      lifeReductionMax = 0.01;
    }
    // move center
    else if (SmallCircleRad <= 10) {
      smallCircleShrink = false;
      lifeReductionMax = params.lifeReductionMax;
      pause = false; // move center
      mouseIsClicked = false;
    }
    // pause set to true when reach the next position 
  }
}

function phase1_generateParticles() {
  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    if (trajAngle > 0 && random() < params.phase1_trace_Threshold) { // generate particles for trace
      if (trajAngle > params.phase1_trace_AdjAngle) {
        traceAdjAngle = params.phase1_trace_AdjAngle
      }
      let angle = random() * (trajAngle - traceAdjAngle);
      let x, y;
      if (angle <= 180) {
        x = mSin(radians(angle)) * params.BigCircleRad;
        y = mCos(radians(angle)) * params.BigCircleRad + params.BigCircleRad;
      }
      else if (angle < 360) {
        x = mSin(radians(angle)) * params.BigCircleRad;
        y = -(mCos(radians(angle)) * params.BigCircleRad + params.BigCircleRad);
      }
      let rotatedX = x * mCos(init_randomAngle) - y * mSin(init_randomAngle);
      let rotatedY = x * mSin(init_randomAngle) + y * mCos(init_randomAngle);
      x = rotatedX;
      y = rotatedY;
      let tParticle = new Particle()
        .setPosition(x, y, random(-5, 5))
        .setVelocity(random(-params.phase1_trace_particleVel, params.phase1_trace_particleVel), random(-params.phase1_trace_particleVel, params.phase1_trace_particleVel), random(-params.phase1_trace_particleVel, params.phase1_trace_particleVel))
        .setLifeReduction(params.phase1_breath_lifeReductionMin, params.phase1_breath_lifeReductionMax);
      particles.push(tParticle);

    }
    else { // generate particles for circle
      let lifeReductionMin = params.phase1_breath_lifeReductionMin;
      let lifeReductionMax = params.phase1_breath_lifeReductionMax;
      let vel = params.phase1_breath_particleVel;
      if (smallCircleShrink == true) {
        vel = params.phase1_shrink_prticleVel;
        lifeReductionMin = params.phase1_shrink_lifeReductionMin;
        lifeReductionMax = params.phase1_shrink_lifeReductionMax;
      }
      let angle = random(TWO_PI);
      let x = centerPos.x + mCos(angle) * (SmallCircleRad + mSin(frame * params.phase1_breathCircle_Freq) * breathingAmp);
      let y = centerPos.y + mSin(angle) * (SmallCircleRad + mSin(frame * params.phase1_breathCircle_Freq) * breathingAmp);
      let rotatedX = x * mCos(init_randomAngle) - y * mSin(init_randomAngle);
      let rotatedY = x * mSin(init_randomAngle) + y * mCos(init_randomAngle);
      x = rotatedX;
      y = rotatedY;
      let tParticle = new Particle()
        .setPosition(x, y, random(-5, 5))
        .setVelocity(random(-vel, vel), random(-vel, vel), random(-vel, vel))
        .setLifeReduction(lifeReductionMin, lifeReductionMax);
      particles.push(tParticle);
    }
  }
}

function move_center() {
  if (pause == false && phase1Finish == false) {
    trajAngle += params.phase1_trace_moveSpd;
    velRange = 0.01;
  }
  if (trajAngle % 90 == 0) {
    pause = true;
  }
  if (trajAngle <= 180) {
    centerPos.x = mSin(radians(trajAngle)) * params.BigCircleRad;
    centerPos.y = mCos(radians(trajAngle)) * params.BigCircleRad + params.BigCircleRad;
  }
  else if (trajAngle < 360) {
    centerPos.x = mSin(radians(trajAngle)) * params.BigCircleRad;
    centerPos.y = -(mCos(radians(trajAngle)) * params.BigCircleRad + params.BigCircleRad);
  }
  else if (trajAngle > 360) {
    phase1Finish = true;
    phase2StartTime = frame;
  }
}

function phase1_updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow(params.phase1_parFlowSpeed);
    p.move();
    p.rotate();
    p.age();
    p.phase5_age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }
}

function log_phase1step() {
  console.log(phase1_step);
}
// ====================== phase 2 ==========================
function phase2_Rotation() {
  if (phase2stage2Start) {
    circleThreshold += 0.005;
    while (particles.length < params.phase2_particleNumber) {
      let angle, x, y;
      let rand = random();
      if (rand < circleThreshold) {
        angle = random(0, 360);
        x = mCos(angle) * phase3Rad * 2;
        y = mSin(angle) * phase3Rad * 2;
        let tParticle = new Particle()
          .setPosition(x, y, random(-5, 5))
          .setVelocity(random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange), random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange), random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange))
          .setLifeReduction(params.phase2_lifeReductionMin, params.phase2_lifeReductionMax);
        particles.push(tParticle);
      }
      else {
        if (trajAngle > params.phase1_trace_AdjAngle) {
          traceAdjAngle = params.phase1_trace_AdjAngle
        }
        angle = random() * (trajAngle - traceAdjAngle);
        if (angle <= 180) {
          x = mSin(radians(angle)) * params.BigCircleRad;
          y = mCos(radians(angle)) * params.BigCircleRad + params.BigCircleRad;
        }
        else if (angle < 360) {
          x = mSin(radians(angle)) * params.BigCircleRad;
          y = -(mCos(radians(angle)) * params.BigCircleRad + params.BigCircleRad);
        }
        let rotationAngle = -radians(frame * rotationSpeed) + init_randomAngle;
        if (rotationSpeed < params.phase2_rotationSpeedTop) {
          rotationSpeed += params.phase2_rotationSpeedAcc;
        }
        let rotatedX = x * mCos(rotationAngle) - y * mSin(rotationAngle);
        let rotatedY = x * mSin(rotationAngle) + y * mCos(rotationAngle);
        x = rotatedX;
        y = rotatedY;
        let tParticle = new Particle()
          .setPosition(x, y, random(-5, 5))
          .setVelocity(random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange), random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange), random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange))
          .setLifeReduction(params.phase2_lifeReductionMin, params.phase2_lifeReductionMax);
        particles.push(tParticle);
      }
      if (frame - phase2StartTime >= params.phase2_stage2Time) {
        spread = true;
      }
    }
  }
  else {
    rotationBagua();
  }
}

function rotationBagua() {
  while (particles.length < params.phase2_particleNumber) {
    let angle, x, y;
    if (trajAngle > params.phase1_trace_AdjAngle) {
      traceAdjAngle = params.phase1_trace_AdjAngle
    }
    angle = random() * (trajAngle - traceAdjAngle);
    if (angle <= 180) {
      x = mSin(radians(angle)) * params.BigCircleRad;
      y = mCos(radians(angle)) * params.BigCircleRad + params.BigCircleRad;
    }
    else if (angle < 360) {
      x = mSin(radians(angle)) * params.BigCircleRad;
      y = -(mCos(radians(angle)) * params.BigCircleRad + params.BigCircleRad);
    }
    let rotationAngle = -radians(frame * rotationSpeed) + init_randomAngle;
    if (rotationSpeed < params.phase2_rotationSpeedTop) {
      rotationSpeed += params.phase2_rotationSpeedAcc;
    }
    let rotatedX = x * mCos(rotationAngle) - y * mSin(rotationAngle);
    let rotatedY = x * mSin(rotationAngle) + y * mCos(rotationAngle);
    x = rotatedX;
    y = rotatedY;
    let tParticle = new Particle()
      .setPosition(x, y, random(-5, 5))
      .setVelocity(random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange), random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange), random(-params.phase2_rotationParVelRange, params.phase2_rotationParVelRange))
      .setLifeReduction(params.phase2_lifeReductionMin, params.phase2_lifeReductionMax);
    particles.push(tParticle);
  }
  if (frame - phase2StartTime >= params.phase2_stage2Time) {
    spread = true;
  }
}

function phase2_updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow(params.phase2_parFlowSpd);
    p.move();
    p.rotate();
    p.age();
    if (spread == true && params.phase2_spreadRad < (params.BigCircleRad * 2 - 10)) {
      params.phase2_spreadRad += params.phase2_spreadSpd;
      p.check_dist_slice(params.phase2_spreadRad);
    }
    if (params.phase2_spreadRad >= (params.BigCircleRad * 2 - 20)) {
      p.check_dist_slice(params.phase2_spreadRad);
      if (!phase2stage3 > 0) {
        phase2stage3 = frame;
        phase2stage2Start = true;
      }
      else if ((frame - phase2stage3) > params.phase2_stage3Time) {
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
  phase3_generateParticles();
}

function phase3_generateParticles() {
  while (particles.length < params.phase3_particleNumber) {
    let angle = random(TWO_PI);
    let x = mCos(angle) * phase3Rad * 2;
    let y = mSin(angle) * phase3Rad * 2;
    let tParticle = new Particle()
      .setPosition(x, y, random(-5, 5))
      .setVelocity(random(-params.phase3_particleVel, params.phase3_particleVel), random(-params.phase3_particleVel, params.phase3_particleVel), random(-params.phase3_particleVel, params.phase3_particleVel))
      .setLifeReduction(params.phase3_lifeReductionMin, params.phase3_lifeReductionMax);
    particles.push(tParticle);
  }
  if (frame - phase3StartTime > params.phase3_stage1Time) {
    phase3transmit = true;

  }
}

function phase3_updateParticles() {
  if (phase3transmit && params.phase3_particleNumber > params.phase4_particleNumber) {
    params.phase3_particleNumber -= params.phase3_particleReductionSpd;
  }
  else {
    phase3transmit = false;
    phase3Finish = true;
    // phase4Start = true;
  }
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (phase3transmit) {
      p.move_up(params.phase3_moveUpSpd);
    }
    else {
      p.flow(10);
    }
    p.move();
    p.rotate();
    p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }
}


// ====================== phase 4 ==========================

function phase4_generateParticles() {
  while (particles.length < params.phase4_particleNumber) {
    p = new BreathParticle()
      .set_breathCen(0, 0, 0)
      .setLifeReduction(params.phase5_lifeReductionMin, params.phase4_lifeReductionMax)
      .set_breathPos(params.phase4_circle_r, params.phase4_circle_R, params.phase4_circle_sd)
      .set_breathFreq(params.phase4_breathFreq)
      .set_breathAmp(params.phase4_breathAmp)
      .set_breathMoveRange(params.phase4_circle_rangeMin, params.phase4_circle_rangeMax);
    particles.push(p);
  }
}


function phase4_updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.breath();
    p.age();
    p.flow(5);
    p.move();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }

}
// ====================== phase 5 ==========================

function phase5_updateParticles_disappear() {
  // let par1 = particles[0]
  // console.log(par1.vel.x, par1.vel.y, par1.vel.z);
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.move();
    p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
    p.phase5_age();
    p.repulse_from(0, 0, 0);
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
  flow(spd = 1) {
    let xFreq = this.pos.x * 0.05 + frame * 0.005;
    let yFreq = this.pos.y * 0.05 + frame * 0.005;
    let noiseValue = map(noise(xFreq, yFreq), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(mCos(frame * 0.005), mSin(frame * 0.005));
    force.normalize();
    force.mult(noiseValue * spd * 0.01);
    this.applyForce(force);
  }
  move_up(spd) {
    let xFreq = this.pos.x * 0.5 + frame * 0.005;
    let yFreq = this.pos.y * 0.01 + frame * 0.005;
    let noiseVal = noise(xFreq, yFreq);
    let up_force;
    if (noiseVal < 0.4) {
      up_force = map(noiseVal, 0, 0.4, 0, 0.1);
    }
    else if (noiseVal < 0.7) {
      up_force = map(noiseVal, 0.4, 0.7, 0.15, 9);
    }
    else {
      up_force = map(noiseVal, 0.7, 1, 9, 1);
    }
    let forceUp = createVector(0, up_force, 0);
    forceUp.mult(spd);
    this.applyForce(forceUp);
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
  set_breathCen() { }
  set_breathPos() { }
  set_breathFreq() { }
  set_breathAmp() { }
  breath() { }
  phase5_age() { }
  repulse_from() { }
}


class BreathParticle extends Particle {
  constructor() {
    super();
    this.outer = 0; //点所在的位置半径相对于大圆的位置
    this.moveRange = 0;
    this.breathCenter = createVector(0, 0, 0);
    this.breathFrequency = 1;
    this.breathAmplitude = 1;
  }

  set_breathCen(x, y, z) {
    this.breathCenter = createVector(x, y, z);
    return this;
  }

  set_breathPos(r, R, sd) { // also set this.outer & this.angle
    let rCircle = r;
    let RCircle = R;
    this.angle = radians(random(360));
    this.outer = abs(randomGaussian(0, sd));
    if (this.outer > RCircle - rCircle) {
      this.outer = RCircle - rCircle;
    }
    let rad = rCircle + this.outer;
    let xPos = this.breathCenter.x + mSin(this.angle) * rad;
    let yPos = this.breathCenter.y + mCos(this.angle) * rad;
    this.pos.set(xPos, yPos, 0);
    return this;
  }

  set_breathMoveRange(min, max) {
    this.moveRange = map(this.outer, 0, 3 * params.phase4_circle_sd, min, max);
    return this;
  }

  set_breathFreq(freq) {
    this.breathFrequency = freq;
    return this;
  }

  set_breathAmp(amp) {
    this.breathAmplitude = amp;
    return this;
  }
  age() {
    // overwrite, not aging
  }
  phase5_age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }

  breath() {
    let moveDist = mCos(frame * this.breathFrequency) * this.moveRange + this.moveRange;
    let updatingR = params.phase4_circle_r + moveDist;
    let xPos = this.breathCenter.x + mSin(this.angle) * updatingR;
    let yPos = this.breathCenter.y + mCos(this.angle) * updatingR;
    this.pos.set(xPos, yPos, 0);
  }


  repulse_from(x, y, z) {
    let target = new p5.Vector(x, y, z);
    let force = p5.Vector.sub(this.pos, target);
    let forceMag = noise(this.angle * params.phase5_angleNoise);
    let mag = map(forceMag, 0, 1, params.phase5_repulseSpdMin, params.phase5_repulseSpdMax)
    force.mult(mag);
    force.mult(0.0001);
    this.applyForce(force);
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

document.addEventListener('keydown', onKeyDown);
function onKeyDown(event) {
  switch (event.key) {
    case '1':
      phase1Finish = false;
      phase2Finish = false;
      phase3Finish = false;
      phase4Finish = false;
      phase5Finish = false;
      console.log("keydown 1");
      break;
    case '2':
      phase1Finish = true;
      phase2Finish = false;
      phase3Finish = false;
      phase4Finish = false;
      phase5Finish = false;
      console.log("keydown 2");
      break;
    case '3':
      phase1Finish = true;
      phase2Finish = true;
      phase3Finish = false;
      phase4Finish = false;
      phase5Finish = false;
      console.log("keydown 3");
      break;
    case '4':
      phase1Finish = true;
      phase2Finish = true;
      phase3Finish = true;
      phase4Finish = false;
      phase5Finish = false;
      console.log("keydown 4");
      break;
    case '5':
      phase1Finish = true;
      phase2Finish = true;
      phase3Finish = true;
      phase4Finish = true;
      phase5Finish = false;
      console.log("keydown 5");
      break;
    case ' ': // restart
      phase1Finish = false;
      phase2Finish = false;
      phase3Finish = false;
      phase4Finish = false;
      phase5Finish = false;
      params.phase3_particleNumber = params.phase2_particleNumber; // refresh phase3_particleNumber
      init_randomAngle = radians(random(360));
      centerPos = createVector(0, 0);
      smallCircleShrink = false;
      SmallCircleRad = params.phase1_breathCircle_Rad;
      breathingAmp = params.phase1_breathCircle_Amp;
      // trace
      trajAngle = 0;
      traceAdjAngle = 0;
      rotationSpeed = 0;
      spread = false;
      circleThreshold = 0;
      // whole process
      pause = true;
      phase2StartTime = 0;
      phase2stage3 = 0;
      phase2stage2Start = false;
      phase3StartTime = 0;
      phase3transmit = false;
      phase1_step = 1;
      playOnce_SingingBowl(SingingBowl0);
      console.log("Space Pressed - restart");
      break;
  }
}

document.addEventListener('click', function () {
  playSoundOnce = false;
  phase1_step += 1;
  mouseIsClicked = true;
  console.log(phase1_step);
  console.log("mouse is clicked");
});


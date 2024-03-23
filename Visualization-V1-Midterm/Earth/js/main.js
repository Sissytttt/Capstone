// 近处多 远处少
// 向上的风？
// 左右运动的力更大一些
let params = {
  color: "#FFF",
  particle_Num: 10000,
  WORLD_WIDTH: 5000,
  WORLD_HEIGHT: 900,
  //
  posFreqX: 0.01,
  posFreqY: 0.01,
  timeFreq: 0.01,
  flowForce: 0.01,
  //
  circle_r: 500,
  circle_R: 1200,
  circle_Sd: 60,
  //movement
  BreathSpeed: 0.03,
  //particle
  ParticleNoise: 30,
  lifespan: 1.4,
}

let pointCloud;
let particles = [];


//----------------------------------------------------
function setupThree() {
  pointCloud = getPoints(params.particle_Num);
  scene.add(pointCloud);

  generateParticles();

  //GUI
  let folderBasic = gui.addFolder("BASIC");
  folderBasic.add(params, "particle_Num").min(100).max(10000).step(1);

  let noiseControl = gui.addFolder("NOISE_PARAMETERS");
  noiseControl.add(params, "posFreqX").min(0.00001).max(0.1).step(0.00001);
  noiseControl.add(params, "posFreqY").min(0.00001).max(0.1).step(0.00001);
  noiseControl.add(params, "timeFreq").min(0.00001).max(0.1).step(0.00001);
  noiseControl.add(params, "flowForce").min(0.0001).max(0.05).step(0.0001);

  let distributionControl = gui.addFolder("DISTRIBUTION_PEPARAMETERS");
  distributionControl.add(params, "circle_r").min(100).max(1200).step(10).onChange(REgenerateParticles);
  distributionControl.add(params, "circle_R").min(100).max(1500).step(10).onChange(REgenerateParticles);
  distributionControl.add(params, "circle_Sd").min(10).max(100).step(1).onChange(REgenerateParticles);

  let movingControl = gui.addFolder("MOVEMENT CONTROL");
  movingControl.add(params, "BreathSpeed", 0, 0.1, 0.001).onChange(REgenerateParticles);
  movingControl.add(params, "ParticleNoise", 0, 100, 1).onChange(REgenerateParticles);
}

//----------------------------------------------------
function updateThree() {

  generateParticles();

  for (const p of particles) {
    p.flow();
    p.age();
    p.move();
  }

  // remove
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }
  while (particles.length > params.particle_Num) {
    particles.splice(0, 1);
  }


  // update the individual points
  let positionArray = pointCloud.geometry.attributes.position.array;
  let colorArray = pointCloud.geometry.attributes.color.array;
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let ptIndex = i * 3;
    // position
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
    // color
    colorArray[ptIndex + 0] = p.color.r * p.lifespan;
    colorArray[ptIndex + 1] = p.color.g * p.lifespan;
    colorArray[ptIndex + 2] = p.color.b * p.lifespan;
  }

  // update on GPU
  pointCloud.geometry.setDrawRange(0, particles.length);
  pointCloud.geometry.attributes.position.needsUpdate = true; // ***
  pointCloud.geometry.attributes.color.needsUpdate = true; // ***
}


//----------------------------------------------------

function generateParticles() {
  while (particles.length < params.particle_Num) {
    p = new Particle()
      .setCen(0, 0, 0)
      .setPos(params.circle_r, params.circle_R, params.circle_Sd)
      .setVelMag(random(3, 5));
    particles.push(p);
  }
}


function REgenerateParticles() {
  particles = [];
  while (particles.length < params.particle_Num) {
    p = new Particle()
      .setCen(0, 0, 0)
      .setPos(params.circle_r, params.circle_R, params.circle_Sd)
      .setVelMag(random(3, 5));
    particles.push(p);
  }
}

function getPoints(maxNum) {
  const vertices = new Float32Array(maxNum * 3); // x, y, z
  const colors = new Float32Array(maxNum * 3); // r, g, b

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    // color: 0xFFFF00,
    vertexColors: true,

    transparent: true,
    opacity: 0.9,

    size: 2,

    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  return points;
}

//----------------------------------------------------
class Particle {
  constructor() {
    this.pos = createVector();
    this.base_pos = createVector();
    this.rCircle = 0;
    this.RCircle = 0;
    this.r = 0;
    this.vel = createVector();
    this.acc = createVector();
    //
    this.cen = createVector();
    //
    this.color = {
      r: random(0.8, 1.0),
      g: random(0.8, 1.0),
      b: random(0.8, 1.0)
    };
    //
    this.lifespan = params.lifespan;
    this.lifeReduction = random(0.005, 0.01);
    this.isDone = false;
  }

  setCen(x, y, z) {
    this.cen = createVector(x, y, z);
    return this;
  }

  setVelMag(val) {
    this.vel_mag = val;
    return this;
  }

  setPos(r, R, sd) {
    this.rCircle = r;
    this.RCircle = R;
    this.angle = radians(random(360));
    let outer = abs(randomGaussian(0, sd));
    if (outer > this.RCircle - this.rCircle) {
      outer = this.RCircle - this.rCircle;
    }
    this.r = this.rCircle + outer;
    let xPos = sin(this.angle) * this.r;
    let yPos = cos(this.angle) * this.r;
    this.base_pos = createVector(xPos, yPos, 0);
    this.pos.set(this.base_pos);
    return this;
  }


  age() {
    if (this.lifespan > 0) {
      this.lifespan -= this.lifeReduction;
    } else {
      this.lifespan = 0;
      this.isDone = true;
    }
    if (this.pos.x < -params.WORLD_WIDTH / 2 || this.pos.x > params.WORLD_WIDTH / 2) {
      this.isDone = true;
    }
  }

  flow() {
    let posFreqX = params.posFreqX;
    let posFreqY = params.posFreqY;
    let timeFreq = params.timeFreq;
    let flowForce = params.flowForce;
    let xFreq = this.pos.x * posFreqX + frame * timeFreq;
    let yFreq = this.pos.y * posFreqY + frame * timeFreq;
    let noiseVal = noise(xFreq, yFreq); // 调整参数
    let noiseValueX = 0;
    let noiseValueY = 0;
    if (noiseVal > 0.5) {
      noiseValueX = map(noiseVal, 0.5, 1, -1, 1); // 调整参数
      noiseValueY = 0;
      // 如果需要，您可以在这里添加对粒子运动的影响
    }
    let force = createVector(noiseValueX, noiseValueY, 0); // 创建一个 p5.Vector 对象
    force.normalize();
    force.mult(flowForce);
    this.apply_force(force);
  }


  apply_force(f) {
    let force = f.copy();
    this.acc.add(force);
  }


  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}
let params = {
  color: "#FFF",
  particle_Num: 10000,
  WORLD_WIDTH: 1500,
  WORLD_HEIGHT: 900,
  //
  posFreq: 0.05, // can't see the difference ? not sure if they are working
  timeFreq: 0.001,
  flowForce: 0.0001, // 0.05~0.0001
  //
  circle_r: 800,
  circle_R: 1000,
  circle_Sd: 50,
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
  noiseControl.add(params, "posFreq").min(0.00001).max(0.1).step(0.00001);
  noiseControl.add(params, "timeFreq").min(0.00001).max(0.1).step(0.00001);
  noiseControl.add(params, "flowForce").min(0.0001).max(0.05).step(0.0001);

  let distributionControl = gui.addFolder("DISTRIBUTION_PEPARAMETERS");
  distributionControl.add(params, "circle_r").min(100).max(1200).step(10).onChange(REgenerateParticles);
  distributionControl.add(params, "circle_R").min(100).max(1500).step(10).onChange(REgenerateParticles);
  distributionControl.add(params, "circle_Sd").min(10).max(100).step(1).onChange(REgenerateParticles);
}

//----------------------------------------------------
function updateThree() {

  generateParticles();

  for (const p of particles) {
    p.flow();
    p.attractToBase(50);
    p.updateBase(sin(frame * 0.03));
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
    colorArray[ptIndex + 0] = p.color.r;
    colorArray[ptIndex + 1] = p.color.g;
    colorArray[ptIndex + 2] = p.color.b;
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
    this.mass = 1;
    //
    this.color = {
      r: random(0.8, 1.0),
      g: random(0.8, 1.0),
      b: random(0.8, 1.0)
    };
    //
    this.lifespan = 1.0; // 100%
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
    // // normal
    // let angle = radians(random(360));
    // this.base_pos = createVector(sin(angle) * random(this.startR, this.startR + 300), cos(angle) * random(this.startR, this.startR + 300), 0);
    // this.pos.set(this.base_pos);
    //
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

  updateLifespan() {
    if (this.lifespan > 0) {
      this.lifespan -= this.lifeReduction;
    } else {
      this.lifespan = 0;
      this.isDone = true;
    }
  }

  flow() {
    let posFreq = params.posFreq;
    let timeFreq = params.timeFreq;
    let flowForce = params.flowForce;
    let xFreq = this.pos.x * posFreq + frame * timeFreq;
    let yFreq = this.pos.y * posFreq + frame * timeFreq;
    let noiseValueX = map(noise(xFreq, yFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValueY = map(noise(xFreq + 1000, yFreq + 1000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValueX, noiseValueY, 0);
    force.normalize();
    force.mult(flowForce);
    this.applyForce(force);
  }

  attractToBase(range) {
    let dist = this.pos.dist(this.base_pos);
    let coeff = (this.r - this.rCircle) / (this.RCircle - this.rCircle);
    let moveRange = range * coeff;
    if (dist > moveRange) {
      let attraction = p5.Vector.sub(this.base_pos, this.pos);
      attraction.mult(dist);
      attraction.mult(0.001);
      this.applyForce(attraction);
    }
  }

  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }

  updateBase(val) {
    // console.log(val)
    this.r += val;
    let xPos = sin(this.angle) * this.r;
    let yPos = cos(this.angle) * this.r;
    this.base_pos.set(xPos, yPos, 0);
  }

  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}
let params = {
  color: "#FFF",
  particleNum: 0,
  moveFrequency: 0.02,
  randomDuration: 120, // time -> length of the line // big=long // + random(-20, 20)
  randomInterval: 0, // line喷射的间距 // + random(-20, 20)
  randomVelMin: 2, // Vel (2, 15)
  randomVelMax: 15,
  WORLD_WIDTH: 1500,
  WORLD_HEIGHT: 1000
};


const NUM_OF_PARTICLES = 30000;
let pointCloud;
let particles = [];

let lastFrame = 0;
let randomInterval = 10;
let randomDuration = 30;
let adjA = Math.random(1000);
let adjB = Math.random(1000);
let dir;
let acc;
let xPos, yPos;

function setupThree() {
  pointCloud = getPoints(NUM_OF_PARTICLES);
  scene.add(pointCloud);

  gui.add(params, "particleNum").listen();;
  let Factors = gui.addFolder("FACTORS");
  Factors.open();
  Factors.add(params, "moveFrequency", 0.001, 0.3).step(0.001).listen();
  // dir = createVector(random(-1, 1), random(-1, 1));
  dir = createVector(1, 1);
  acc = random(-1, 1);
  xPos = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
  yPos = -params.WORLD_HEIGHT / 2;
}

function updateThree() {
  // showWorld();
  if (frame - lastFrame < randomDuration) {
    generate_line(xPos, yPos, dir, acc);
    generate_line(xPos + 10, yPos - 10, dir.rotate(PI), acc);
  }
  else if (frame - lastFrame >= randomDuration && frame - lastFrame < randomDuration + randomInterval) {
    // console.log("rest");
  }
  else if (frame - lastFrame >= randomDuration + randomInterval) {
    // console.log("update");

    let choice = floor(random(4));
    if (choice === 0) {
      xPos = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
      yPos = -params.WORLD_HEIGHT / 2;
      dir = createVector(random(-1, 1), random(0, 1));
    } else if (choice === 1) {
      xPos = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
      yPos = params.WORLD_HEIGHT / 2;
      dir = createVector(random(-1, 1), random(-1, 0));
    } else if (choice === 2) {
      xPos = -params.WORLD_WIDTH / 2;
      yPos = random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2);
      dir = createVector(random(0, 1), random(-1, 1));
    } else {
      xPos = params.WORLD_WIDTH / 2;
      yPos = random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2);
      dir = createVector(random(-1, 0), random(-1, 1));
    }
    randomDuration = params.randomDuration + random(-20, 20);
    randomInterval = params.randomInterval + random(-20, 20);
    randomVelocity = random(params.randomVelMin, params.randomVelMax);
    lastFrame = frame;
    dir.mult(randomVelocity);
    acc = random(-1, 1);
  }

  // update the particles first!
  for (const p of particles) {
    p.move();
    p.updateLifespan();
  }

  // remove if the particle(s) is done!
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (p.isDone) {
      particles.splice(i, 1);
      i--; // *** not flipped version! ***
    }
  }

  // limit the particles
  while (particles.length > NUM_OF_PARTICLES) {
    particles.splice(0, 1);
  }

  // display the number of particles on GUI
  params.particleNum = particles.length;

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

    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  return points;
}
// ============================

function showWorld() {
  for (let i = 0; i < 20; i++) {
    yPos = -params.WORLD_HEIGHT / 2;
    xPos = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
    particles.push(new Particle(xPos, yPos));
  }
  for (let i = 0; i < 20; i++) {
    yPos = params.WORLD_HEIGHT / 2;
    xPos = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
    particles.push(new Particle(xPos, yPos));
  }
  for (let i = 0; i < 20; i++) {
    xPos = -params.WORLD_WIDTH / 2;
    yPos = random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2);
    particles.push(new Particle(xPos, yPos));
  }
  for (let i = 0; i < 20; i++) {
    xPos = params.WORLD_WIDTH / 2;
    yPos = random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2);
    particles.push(new Particle(xPos, yPos));
  }
}
function generate_line(x, y, vel, accMag) {
  let acc = vel.copy().rotate(HALF_PI);
  acc.setMag(accMag);
  acc.mult(0.5);
  particles.push(
    new Particle(x, y)
      .set_vel(dir.x, dir.y)
      .set_acc(acc.x, acc.y)
  );
  particles.push(
    new Particle(x, y)
      .set_vel(dir.x + 1, dir.y + 1)
      .set_acc(acc.x, acc.y)
  );
  particles.push(
    new Particle(x, y)
      .set_vel(dir.x + 1, dir.y - 1)
      .set_acc(acc.x, acc.y)
  );
  particles.push(
    new Particle(x, y)
      .set_vel(dir.x - 1, dir.y + 1)
      .set_acc(acc.x, acc.y)
  );
  particles.push(
    new Particle(x, y)
      .set_vel(dir.x - 1, dir.y - 1)
      .set_acc(acc.x, acc.y)
  );
}


//=============================

class Particle {
  constructor(x = 0, y = 0, z = 0) {
    this.pos = createVector(x, y, z);
    this.vel = createVector();
    this.acc = createVector();
    this.mass = 1;
    //
    this.color = {
      r: 1,
      g: 1,
      b: 1
    };
    //
    this.lifespan = 1.0; // 100%
    this.lifeReduction = random(0.005, 0.01);
    this.isDone = false;
  }
  set_vel(x, y, z = 0) {
    this.vel = createVector(x, y, z);
    return this;
  }
  set_acc(x, y, z = 0) {
    this.acc = createVector(x, y, z);
    return this;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    // this.acc.mult(0);
  }
  updateLifespan() {
    if (this.lifespan > 0) {
      this.lifespan -= this.lifeReduction;
    } else {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  applyForce(f) {
    let force = f.copy();
    if (this.mass > 0) {
      force.div(this.mass);
    }
    this.acc.add(force);
  }
}
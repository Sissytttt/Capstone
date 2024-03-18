let params = {
  color: "#FFF",
  particleNum: 0,
};


const NUM_OF_PARTICLES = 30000;
let pointCloud;
let particles = [];

function setupThree() {
  pointCloud = getPoints(NUM_OF_PARTICLES);
  scene.add(pointCloud);
  gui.add(params, "particleNum").listen();;
}

function updateThree() {

  // generate particles

  generate_line(100, 2000, 1000);

  // update the particles first!
  for (const p of particles) {
    p.updatePosition();
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

function generate_line(adjA, adjB, duration) {
  let xFreq = (frame + adjA) * 0.02;
  let yFreq = (frame + adjB) * 0.02;
  let xPos = map(noise(xFreq), 0, 1, -1000, 1000);
  let yPos = map(noise(yFreq), 0, 1, -500, 500);
  particles.push(new Particle(xPos, yPos));
}

//=============================

class Particle {
  constructor(x = 0, y = 0, z = 0) {
    this.pos = createVector(x, y, z);
    this.vel = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
    this.vel.mult(0.2);
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
  updatePosition() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
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
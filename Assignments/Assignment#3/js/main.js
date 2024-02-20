let params = {
  color: "#FFF",
  particleNum: 0,
};


const NUM_OF_PARTICLES = 30000;
let pointCloud;
let particles = [];


//----------------------------------------------------
function setupThree() {
  let frame = 0;
  pointCloud = getPoints(NUM_OF_PARTICLES);
  scene.add(pointCloud);

  for (let i = 0; i < 10000; i++) {
    p = new Particle().setup();
    particles.push(p);
  }

}

//----------------------------------------------------
function updateThree() {

  p = new Particle().setup().setNewPos();
  particles.push(p);

  frame += 1;

  let gravity = createVector(0, -1, 0);
  for (const p of particles) {
    p.updateAcc();
    p.updateCen();
    p.applyGravity(gravity);
    p.update();
    p.updateLifespan();
  }

  // console.log(particles[1].cen.x)

  // remove
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }
  while (particles.length > NUM_OF_PARTICLES) {
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

//----------------------------------------------------
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();
    //
    this.cen = createVector();
    this.mass = 1;
    this.velmag;
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

  setup() {
    this.angle = random(0, 360);
    this.r = random(0, 500);
    this.velmag = random(1, 3)
    this.pos = createVector(sin(radians(this.angle)) * this.r, 0, cos(radians(this.angle)) * this.r);
    let noiseVal = noise(this.pos.x * 0.02, this.pos.z * 0.02);
    this.pos.y = map(noiseVal, 0, 1, 0, this.r);
    this.cen = createVector(0, this.pos.y, 0);
    this.dist = p5.Vector.sub(this.cen, this.pos);
    this.vel = createVector(-this.dist.z, 0, this.dist.x).setMag(this.velmag);
    this.acc = this.vel.copy().rotate(HALF_PI).setMag(this.vel.magSq() / this.r).mult(1.1);
    // console.log(this.vel.dot(this.acc));
    return this;
  }

  setNewPos() {
    this.pos.x = (sin(radians(this.angle))) * this.r * 2;
    this.pos.z = (cos(radians(this.angle))) * this.r * 2;
    this.pos.y = 300;
    return this;
  }

  updateAcc() {
    this.cen.y = this.pos.y;
    this.dist = p5.Vector.sub(this.cen, this.pos);
    this.r = this.dist.mag();
    this.vel = createVector(-this.dist.z, 0, this.dist.x).setMag(this.velmag);
    if (this.r > 10) {
      this.acc = this.vel.copy().rotate(HALF_PI).setMag(this.vel.magSq() / this.r).mult(1.1);
    }
    else {
      this.acc = this.vel.copy().rotate(HALF_PI).setMag(this.vel.magSq() / this.r);
    }
    if (this.r > 100) {
      this.acc.mult(100 / this.r)
    }
  }

  updateCen() {
    let noiseLevel = 100;
    let noiseScale = 0.005;
    // Scale input coordinate.
    let nt = noiseScale * frame;
    // Compute noise value.
    // if (this.y < 300) {
    this.cen.x = noiseLevel * noise(nt);
    this.cen.z = noiseLevel * noise(nt + 10000);
    // }
  }

  applyGravity(f) {
    let force1 = f.copy();
    if (this.r > 0) {
      let coeff = map(this.r, 0, 500, 0.5, 30)
      force1.div(coeff);
      this.acc.add(force1);
    }
  }

  updateLifespan() {
    if (this.pos.y < -500) {
      if (this.lifespan > 0) {
        this.lifespan -= this.lifeReduction;
      } else {
        this.lifespan = 0;
        this.isDone = true;
        console.log("yes")
      }
    }
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    // this.acc.mult(0);
  }
}
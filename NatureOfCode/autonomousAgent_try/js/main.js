let params = {
  PARTICLE_NUMBER: 1000,
  particleNum: 0,
  color: "#FFFFFF"
};

const WORLD_SIZE = 1000;

let pointCloud;
let particles = [];

let target;
function setupThree() {
  target = createVector(0, 0, 0);
  // initialize particles
  for (let i = 0; i < params.PARTICLE_NUMBER; i++) {
    let v = new Vehicle()
      .setPos(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2))
      .setVel(random(-0.5, 0.5), random(-0.5, 0.5), random(-0.5, 0.5))
    particles.push(v);
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // GUI
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.open();
  folderBasic.add(params, "PARTICLE_NUMBER", 0, params.PARTICLE_NUMBER).step(1).listen();
  folderBasic.add(params, "particleNum").listen();
  folderBasic.addColor(params, 'color');

}

function updateThree() {
  // set GUI variables
  let c = color(params.color);

  // generate new particles
  while (particles.length < params.PARTICLE_NUMBER) {
    let v = new Vehicle()
      .setPos(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2))
      .setVel(random(-0.5, 0.5), random(-0.5, 0.5), random(-0.5, 0.5))
    particles.push(v);
  }

  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let v = particles[i];
    v.setColor(red(c), green(c), blue(c));
    v.move();
    // v.age();
    v.attractedTo(target)
    if (v.isDone) {
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
    colorArray[ptIndex + 0] = p.color.r * p.lifespan;
    colorArray[ptIndex + 1] = p.color.g * p.lifespan;
    colorArray[ptIndex + 2] = p.color.b * p.lifespan;
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
    // size: random(1, 5),
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


// ==============================================================
class Vehicle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 1.0;
    this.lifeReduction = random(0.001, 0.005);
    this.isDone = false;

    this.color = {
      r: 2,
      g: 3,
      b: 2
    };


  }
  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
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
  attractedTo(targetVec) {
    let force = p5.Vector.sub(targetVec, this.pos);
    force.mult(0.001);
    this.applyForce(force);
    this.vel.mult(0.98);
  }
}
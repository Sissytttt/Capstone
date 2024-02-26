let params = {
  PARTICLE_NUMBER: 10000,
  CENTER_NUMBER: 6,
  particleNum: 0,
  color: "#FFFFFF"
};

const WORLD_SIZE = 1000;

let pointCloud;
let particles = [];
let center = [];

let noiseScale = 0.1;
// ==============================================================
// ==============================================================

function setupThree() {
  // initialize particles
  // center points
  for (let i = 0; i < params.CENTER_NUMBER; i++) {
    let c = new Center()
      .setBase(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2), 0)
    // c.update();
    center.push(c);
  }
  // particles
  for (let i = 0; i < params.PARTICLE_NUMBER; i++) {
    let random_angle = radians(random(360));
    let xPos = sin(random_angle) * WORLD_SIZE;
    let yPos = cos(random_angle) * WORLD_SIZE;
    let noiseValue = noise(noiseScale * xPos, noiseScale * yPos);
    let size = map(noiseValue, 0, 1, 1, 5);
    let brightness = map(noiseValue, 0, 1, 100, 255);
    let p = new Particle()
      .setPos(xPos, yPos, 0)
      .setVelMag(random(2, 3));
    let nearest_center = p.nearestCenter(center);
    p.setCenter(nearest_center.pos.x, nearest_center.pos.y, nearest_center.pos.z);
    p.setVel();
    p.attractedTo(nearest_center);
    p.setVel();
    particles.push(p);
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // GUI
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.open();
  folderBasic.add(params, "PARTICLE_NUMBER", 0, params.PARTICLE_NUMBER).step(1).listen();
  folderBasic.add(params, "CENTER_NUMBER", 0, 10).step(1).listen().onChange(function (value) {
    resetParticleSystem();
  });
  folderBasic.add(params, "particleNum").listen();
  folderBasic.addColor(params, 'color');

}


// ==============================================================
// ==============================================================

function updateThree() {
  // set GUI variables
  let c = color(params.color);

  //generate new particles
  while (particles.length < params.PARTICLE_NUMBER) {
    let random_angle = radians(random(0, 360));
    let p = new Particle()
      .setPos(sin(random_angle) * WORLD_SIZE, cos(random_angle) * WORLD_SIZE, 0)
      .setVelMag(random(2, 3));
    let nearest_center = p.nearestCenter(center);
    p.setCenter(nearest_center.pos.x, nearest_center.pos.y, nearest_center.pos.z);
    p.setVel();
    p.attractedTo(nearest_center);
    particles.push(p);
  }

  // update the Center class
  for (let i = 0; i < center.length; i++) {
    let c = center[i];
    // c.setVel(random(-1, 1), random(-1, 1), 0);
    c.move();
    // c.update();
  }

  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let nearest_center = p.nearestCenter(center);
    p.setCenter(nearest_center.pos.x, nearest_center.pos.y, nearest_center.pos.z);
    p.setVel();
    p.attractedTo(nearest_center);
    p.setColor(red(c), green(c), blue(c));
    p.limitVel(5)
    p.move();
    p.age();
    if (p.isDone) {
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

// ==============================================================
// ==============================================================

function getPoints(objects) {
  const vertices = new Float32Array(objects.length * 3);
  const colors = new Float32Array(objects.length * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load('assets/particle_texture.jpg');
  const material = new THREE.PointsMaterial({
    vertexColors: true,
    // size: random(10, 50),
    // sizeAttenuation: true,

    // opacity: 0.50,
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
// ==============================================================


function resetParticleSystem() {
  console.log("RE-Setup");
  particles = [];
  center = [];
  // initialize particles
  // center points
  for (let i = 0; i < params.CENTER_NUMBER; i++) {
    let c = new Center()
      .setBase(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2), 0)
    // c.update();
    center.push(c);
  }
  // particles
  for (let i = 0; i < params.PARTICLE_NUMBER; i++) {
    let random_angle = random(0, 360);
    let p = new Particle()
      .setPos(sin(radians(random_angle)) * WORLD_SIZE, cos(radians(random_angle)) * WORLD_SIZE, 0)
      .setVelMag(random(2, 3));
    let nearest_center = p.nearestCenter(center);
    p.setCenter(nearest_center.pos.x, nearest_center.pos.y, nearest_center.pos.z);
    p.setVel();
    p.attractedTo(nearest_center);
    p.setVel();
    particles.push(p);
  }
}

// ==============================================================
// ==============================================================
class Particle {
  constructor() {
    this.vel_mag = 0;
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.center = createVector();
    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 1.0;
    this.lifeReduction = random(0.001, 0.003);
    this.isDone = false;

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

  setVelMag(value) {
    this.vel_mag = value;
    return this;
  }

  nearestCenter(others) { // other is the center array
    let min_dist = 2000;
    let nearest = null;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      dist = this.pos.dist(other.pos);
      if (dist < min_dist) {
        min_dist = dist;
        nearest = other;
      }
    }
    return nearest;
  }

  setCenter(centerX, centerY, centerZ) {
    this.center = createVector(centerX, centerY, centerZ);
    return this;
  }

  setVel() {
    this.vel = p5.Vector.sub(this.pos, this.center);
    this.vel.rotate(HALF_PI);
    this.vel.normalize();
    this.vel.mult(this.vel_mag);
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
  limitVel(value) {
    this.vel.limit(value);
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


  attractedTo(other) {
    if (other != null) {
      let dist = this.pos.dist(other.pos);
      let mag = (this.vel_mag * this.vel_mag) / dist;
      let force = p5.Vector.sub(other.pos, this.pos);
      force.normalize;
      force.mult(mag);
      force.mult(0.1);
      this.applyForce(force);
    }
  }
}


function getSphere() {
  const geometry = new THREE.SphereGeometry(1, 6
    , 6);
  const material = new THREE.MeshNormalMaterial({
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

// ================================
class Center {
  constructor() {
    this.base = createVector();
    this.pos = createVector();

    this.attraction = 0;

    this.mesh = getSphere();

    this.range = 700;
    this.a = random(100);
    this.b = random(100);
    this.noiseFreq = 0.002;
  }

  setBase(x, y, z) {
    this.base = createVector(x, y, z);
    this.pos = this.base.copy();
    return this;
  }

  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }

  move() {
    let xAdjust = map(noise(this.a), 0, 1, -this.range, this.range);
    this.pos.x = this.base.x + xAdjust;
    let yAdjust = map(noise(this.b), 0, 1, -this.range, this.range);
    this.pos.y = this.base.y + yAdjust;
    this.a += this.noiseFreq;
    this.b += this.noiseFreq;
  }

  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.scale.set(10, 10, 10);
  }
}
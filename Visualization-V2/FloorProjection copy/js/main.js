let params = {
  PARTICLE_NUMBER: 10000,
  particleNum: 0,
  color: "#FFFFFF",
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 1000,
  circle_r: 300,
};


let pointCloud;
let particles = [];

let centerPos;


let mouseX, mouseY;


let noiseScale = 0.1;
// ==============================================================
// ==============================================================

function setupThree() {

  centerPos = createVector(random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2), random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2))
  // particles
  for (let i = 0; i < params.PARTICLE_NUMBER; i++) {
    let random_angle = radians(random(360));
    let xPos = sin(random_angle) * params.circle_r;
    let yPos = cos(random_angle) * params.circle_r;
    let p = new Particle()
      .setPos(xPos / 2, yPos / 2, 0)
      // .setPos(0, 0, 0)
      .setVelMag(random(2, 3));
    p.setCenter(centerPos.x, centerPos.y, 0);
    p.setVel();
    p.attractedTo(centerPos.x, centerPos.y, 0);
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
  folderBasic.add(params, "particleNum").listen();
  folderBasic.addColor(params, 'color');

}


// ==============================================================
// ==============================================================

function updateThree() {
  // set GUI variables
  let c = color(params.color);
  centerPos = createVector(mouseX, mouseY);
  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.setCenter(centerPos.x, centerPos.y, 0);
    //p.setVel();
    p.attractedTo(centerPos.x, centerPos.y, 0);
    p.setColor(red(c), green(c), blue(c));
    //p.limitVel(5)
    //p.flow();
    p.move();
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
  //
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
    //this.mass = this.scl.x * this.scl.y * this.scl.z;
    this.mass = random(5, 10);

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
    this.vel.rotate(HALF_PI); // 90
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
    //
    this.vel.mult(0.99);
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


  attractedTo(x, y, z) {
    let other = createVector(x, y, z);
    let dist = this.pos.dist(other);
    let mag = (this.vel_mag * this.vel_mag) / dist;
    let force = p5.Vector.sub(other, this.pos);
    force.rotate(radians(10));  // ****************
    //force.normalize;
    //force.mult(mag);
    force.mult(0.01);
    this.applyForce(force);
  }
}



document.addEventListener('click', function (event) {
  getMouse(event);
});

function getMouse(event) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  mouseX = ((event.clientX / width) * 2 - 1) * params.WORLD_WIDTH;
  mouseY = (-(event.clientY / height) * 2 + 1) * params.WORLD_HEIGHT;
}

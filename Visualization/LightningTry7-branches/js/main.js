

let params = {
  MAX_PARTICLE_NUMBER: 5000,
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 300,
  WORLD_DEPTH: 1000,
  Particles_in_scene: 0,
  //
  StartPoints: 5,
  AngleRange: 30,
  BranchAngleRange: 70,
  anglePossibility: 0.01,
  branchPossibility: 0.008,

};

let things = [];

let pointCloud;
let particles = [];

function setupThree() {
  // set up things array

  addLightning(1);


  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // gui
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.add(params, "MAX_PARTICLE_NUMBER", 0, 20000).step(1);
  folderBasic.add(params, "WORLD_WIDTH", 0, 2000, 10);
  folderBasic.add(params, "WORLD_HEIGHT", 0, 2000, 10);
  folderBasic.add(params, "WORLD_DEPTH", 0, 2000, 10);
  params.Particles_in_scene = particles.length;
  folderBasic.add(params, "Particles_in_scene").listen();
}

function updateThree() {
  addLightning(0.01);
  if (particles.length < params.MAX_PARTICLE_NUMBER) {
    for (const thing of things) {
      let p1 = new Particle()
        .set_pos(thing.pos.x, thing.pos.y)
        .set_vel(0, 0);
      particles.push(p1);
      let p2 = new Particle()
        .set_pos(thing.pos.x + 1, thing.pos.y - 1)
        .set_vel(0, 0);
      particles.push(p2);
      let p3 = new Particle()
        .set_pos(thing.pos.x - 1, thing.pos.y - 1)
        .set_vel(0, 0);
      particles.push(p3);
      let p4 = new Particle()
        .set_pos(thing.pos.x + 1, thing.pos.y + 1)
        .set_vel(0, 0);
      particles.push(p4);
    }
  }

  // update the things
  for (let i = 0; i < things.length; i++) {
    let thing = things[i];
    thing.move();
    thing.age();
    thing.changeAngle(params.anglePossibility);
    addBranch(thing, params.branchPossibility);
    if (thing.isDone == true) {
      things.splice(i, 1);
      i--;
    }
  }


  // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.move();
    p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }

  // update the points
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
  pointCloud.geometry.setDrawRange(0, particles.length); // ***
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.attributes.color.needsUpdate = true;

  // update GUI
  params.Particles_in_scene = particles.length;
}

function getPoints() {
  const vertices = new Float32Array(params.MAX_PARTICLE_NUMBER * 3);
  const colors = new Float32Array(params.MAX_PARTICLE_NUMBER * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,

    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  // Points
  const points = new THREE.Points(geometry, material);
  return points;
}

// =================
function addLightning(possibility) {
  if (random(1) < possibility) {
    things.push(
      new MovingThing()
        .set_pos(random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2), random(-params.WORLD_HEIGHT / 2, params.WORLD_HEIGHT / 2), 0)
        .set_vel(random(-1, 1), random(-1, 1))
        .set_spd(random(3))
        .set_lifeReduction(random(0.001, 0.01))
    )
  }
}
function addBranch(thing, possibility) {
  if (random(1) < (thing.depth * possibility)) {
    console.log("yes")
    let newThing = new MovingThing()
      .set_pos(thing.pos.x, thing.pos.y, thing.pos.z)
      .set_vel(thing.vel.x, thing.vel.y, thing.vel.z)
      .set_spd(random(3))
      .set_lifeReduction(random(0.001, 0.01))
      .reduce_depth(random(0.5))
    newThing.adjust_age(random(0.5));
    newThing.rotate(radians(random(-params.BranchAngleRange, params.BranchAngleRange)));
    things.push(newThing);
    thing.changeAngle(params.anglePossibility * 10);
    thing.adjust_age(random(0.5));
    thing.reduce_depth(random(0.5));
  }
}
// ===================================================================

class MovingThing {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.lifespan = 1;
    this.lifeReduction = random(0.004, 0.005);
    this.isDone = false;
    this.depth = 1;
  }
  set_pos(x, y, z = 0) {
    this.pos = createVector(x, y, z);
    return this;
  }
  set_vel(x, y, z = 0) {
    this.vel = createVector(x, y, z);
    return this;
  }
  set_lifeReduction(val) {
    this.lifeReduction = val;
    return this;
  }
  set_spd(spd) {
    this.vel.normalize();
    this.vel.mult(spd);
    return this;
  }
  reduce_depth(val) {
    this.depth -= val;
    if (this.depth <= 0) {
      this.depth = 0;
      this.isDone = true;
    }
    return this;
  }
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
      console.log("donw")
    }
  }
  adjust_age(val) {
    this.lifespan -= val;
  }
  changeAngle(possibility) {
    if (random(1) < possibility) {
      let angle = radians(random(-params.AngleRange, params.AngleRange));
      this.vel.rotate(angle);
    }
  }
  rotate(angle) {
    this.vel.rotate(angle);
  }
  move() {
    this.pos.add(this.vel);
  }
}


// ============================
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.lifespan = 1.0;
    this.lifeReduction = random(0.003, 0.005);
    this.isDone = false;

    this.moveScl = random();

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };
    // particles.push(this);
  }

  set_pos(x, y, z = 0) {
    this.pos = createVector(x, y, z);
    return this;
  }
  set_color(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    return this;
  }
  set_vel(x, y, z = 0) {
    this.vel = createVector(x, y, z);
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
  flow() {
    let posFreq = 0.005;
    let timeFreq = 0.005;
    let xFreq = this.pos.x * posFreq + frame * timeFreq;
    let yFreq = this.pos.y * posFreq + frame * timeFreq;
    let zFreq = this.pos.z * posFreq + frame * timeFreq;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    force.mult(0.002);
    this.applyForce(force);
  }

}

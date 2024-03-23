let params = {
  MAX_PARTICLE_NUMBER: 5000,
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 300,
  WORLD_DEPTH: 1000,
  Particles_in_scene: 0,
  //
  Circle_Num: 30,
  BendMagnitude: 30,
  // 
  FlowPosFreq: 0.005,
  FlowTimeFreq: 0.005,
  MoveSpd: 0.001,
};



let CirclePos = [];
let Circles = [];

let pointCloud;
let particles = [];

function setupThree() {

  set_Up_Circles();
  console.log(Circles);
  for (let i = 0; i < params.MAX_PARTICLE_NUMBER; i++) {
    let random_circle = Math.floor(Math.random() * Circles.length);
    Circles[random_circle].addParticles();
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);


  // gui
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.add(params, "MAX_PARTICLE_NUMBER", 0, 20000).step(1);
  folderBasic.add(params, "WORLD_WIDTH", 0, 2000, 10).onChange(set_Up_Circles);
  folderBasic.add(params, "WORLD_HEIGHT", 0, 2000, 10).onChange(set_Up_Circles);
  folderBasic.add(params, "WORLD_DEPTH", 0, 2000, 10).onChange(set_Up_Circles);
  params.Particles_in_scene = particles.length;
  folderBasic.add(params, "Particles_in_scene").listen();

  let CircleFolder = gui.addFolder("Circle");
  CircleFolder.add(params, "Circle_Num", 1, 100, 1).onChange(set_Up_Circles);

  let ParticleFolder = gui.addFolder("Particles");
  ParticleFolder.add(params, "FlowPosFreq", 0, 0.5, 0.0001);
  ParticleFolder.add(params, "FlowTimeFreq", 0, 0.5, 0.0001);
  ParticleFolder.add(params, "MoveSpd", 0, 0.5, 0.0001);


}

function updateThree() {

  // update circle pos
  for (let i = 0; i < Circles.length; i++) {
    let circle = Circles[i];
    circle.update_pos();
  }
  // add particles to the circles
  while (particles.length < params.MAX_PARTICLE_NUMBER) {
    let random_circle = Math.floor(Math.random() * Circles.length);
    Circles[random_circle].addParticles();
  }

  // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.move();
    p.adjustVelocity(-0.005);
    p.age();
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }

  // then update the points
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

function getPoints(objects) {
  const vertices = new Float32Array(objects.length * 3);
  const colors = new Float32Array(objects.length * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load('assets/particle_texture.jpg');
  const material = new THREE.PointsMaterial({
    vertexColors: true,
    // sizeAttenuation: true,

    //opacity: 0.50,
    //transparent: true,

    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  // Points
  const points = new THREE.Points(geometry, material);
  return points;
}

function set_Up_Circles() {
  if (CirclePos.length > 0 || Circles.length > 0) {
    CirclePos = [];
    Circles = [];
  }
  for (let i = 0; i < params.Circle_Num; i++) {
    posStartX = random(-params.WORLD_WIDTH / 4, params.WORLD_WIDTH / 4);
    posStartY = params.WORLD_HEIGHT / 2;
    posStartZ = random(-params.WORLD_DEPTH / 4, params.WORLD_DEPTH / 4);
    posEndX = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
    posEndY = -params.WORLD_HEIGHT / 2;
    posEndZ = random(-params.WORLD_DEPTH / 2, params.WORLD_DEPTH / 2);
    CirclePos.push([[posStartX, posStartY, posStartZ], [posEndX, posEndY, posEndZ]]);
  }
  for (let i = 0; i < params.Circle_Num; i++) {
    let circle = new Circle()
      .set_pos()
      .set_size(random(20, 50));
    Circles.push(circle);
  }
}


// ===================================================================
class Circle {
  constructor() {
    this.pos = createVector();
  }
  set_pos() {
    let xPos = random(-params.WORLD_WIDTH / 2, params.WORLD_WIDTH / 2);
    let zPos = random(-params.WORLD_DEPTH / 2, params.WORLD_DEPTH / 2);
    let freq = 0.005;
    let noiseVal = noise(xPos * freq, zPos * freq);
    let yPos = map(noiseVal, 0, 1, -200, 200)
    this.pos = createVector(xPos, yPos, zPos);
    return this;
  }
  update_pos() {
    let freq = 0.005;
    let noiseVal = noise(this.pos.x * freq, this.pos.z * freq, frame * freq);
    let yPos = map(noiseVal, 0, 1, -150, 150)
    this.pos.y = yPos;
  }
  set_size(r) {
    this.radians = r;
    return this;
  }
  addParticles() {
    let randomAngle = random(2 * PI);
    let randomPosX = sin(randomAngle) * this.radians;
    let randomPosZ = cos(randomAngle) * this.radians;
    let particle = new Particle()
      .setPos(this.pos.x + randomPosX, this.pos.y, this.pos.z + randomPosZ)
    particles.push(particle);
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
    this.lifeReduction = random(0.003, 0.05);
    this.isDone = false;

    this.moveScl = random();

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };
    particles.push(this);
  }

  setPos(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setColor(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    return this;
  }
  setVel(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setScl(w, h = w, d = w) {
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }
  setFlowSpd(val) {
    this.flowSpd = val;
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
    if (this.pos.z > params.WORLD_DEPTH / 2) {
      this.pos.z = -params.WORLD_DEPTH / 2;
    }
  }
  disappear() {
    if (this.pos.z > params.WORLD_DEPTH / 2) {
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

  flow() {
    let posFreq = params.FlowPosFreq;
    let timeFreq = params.FlowTimeFreq;
    let xFreq = this.pos.x * posFreq + frame * timeFreq;
    let yFreq = this.pos.y * posFreq + frame * timeFreq;
    let zFreq = this.pos.z * posFreq + frame * timeFreq;
    let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
    let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
    force.normalize();
    // force.mult(this.flowSpd);
    force.mult(0.005)
    this.applyForce(force);
  }

  flow_up_down() {

  }
}

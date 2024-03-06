let params = {
  PARTICLE_NUMBER: 4000,
  particleNum: 0,
  color: "#FFFFFF",
  flow_value: 30, // for normal flow
  move_up: false
};

const WORLD_SIZE = 1000;
const WORLD_HEIGHT = 600;

let pointCloud;
let particles = [];
// waves: Wvel, Wlen, Wamp, noise_move, WfreqAdj = 1, WampAdj = 1 // Wvel: big => fast; Wlen: big => short
let wave_num = 7;
let waves = [];
// let waves = [[0.01, 0.007, 50, Math.random(100)], [0.02, 0.005, 50, Math.random(100)]];

function setupThree() {
  // initialize waves
  for (let i = 0; i < wave_num; i++) {
    Wvel = random(0.005, 0.03); // Wvel: big => fast; Wlen: big => short
    Wlen = random(0.001, 0.009);
    Wamp = random(30, 60);
    Wposy = random(-WORLD_HEIGHT / 2, WORLD_HEIGHT / 2);
    noise_move = random(100);
    waves.push([Wvel, Wlen, Wamp, Wposy, noise_move]);
  }

  // initialize particles
  for (let i = 0; i < params.PARTICLE_NUMBER; i++) {
    let p = new Particle()
      .setPos(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), 0, 0)
      .setVel(0, 0, 0);

    let randomNum = floor(random() * wave_num);
    p.setWave(waves[randomNum][0], waves[randomNum][1], waves[randomNum][2], waves[randomNum][3], waves[randomNum][4]);
    particles.push(p);
  }

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // GUI
  let folderBasic = gui.addFolder("WORLD BASIC");
  // folderBasic.open();
  folderBasic.add(params, "PARTICLE_NUMBER", 0, params.PARTICLE_NUMBER).step(1).listen();
  folderBasic.add(params, "particleNum").listen();
  folderBasic.addColor(params, 'color');

  let particleControl = gui.addFolder("PARTICLE CONTROL");
  particleControl.open();
  particleControl.add(params, "flow_value", 0, 200).step(1).listen();
  particleControl.add(params, "move_up");
}

function updateThree() {

  // new particles
  if (params.move_up == false) {
    while (particles.length < params.PARTICLE_NUMBER) {
      let p = new Particle()
        .setPos(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), 0, 0)
        .setVel(0, 0, 0);

      let randomNum = floor(random() * wave_num);
      p.setWave(waves[randomNum][0], waves[randomNum][1], waves[randomNum][2], waves[randomNum][3]);
      particles.push(p);
    }
  }

  // set GUI variables
  let c = color(params.color);

  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.setColor(red(c), green(c), blue(c));
    p.wave();
    p.flow();
    p.age();
    p.disappear();
    if (p.isDone) {
      particles.splice(i, 1);
      i--; // not flipped version
    }
  }

  if (params.move_up == true) {
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.moveUp(1);
      p.scatter();
      p.update();
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


// ==============================================================
class Particle {
  constructor() {
    this.pos = createVector();
    this.base_pos = createVector(0, 0, 0);
    this.vel = createVector();
    this.acc = createVector();

    this.lifespan = 1.0;
    this.lifeReduction = random(0.005, 0.0001);
    this.isDone = false;

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };

    // particles.push(this);
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
    return this;
  }
  setWave(Wvel, Wlen, Wamp, Wposy, noise_move, WfreqAdj = 1, WampAdj = 1) {
    this.Wpos = Wposy;
    this.Wvel = Wvel; // * frameCount // big = fast
    this.Wlen = Wlen; // * this.pos.x // big = short
    this.Wamp = Wamp;
    this.WfreqAdj = WfreqAdj;
    this.WampAdj = WampAdj;
    this.noise_move = noise_move;
    return this;
  }

  disappear() {
    if (this.pos.x > WORLD_SIZE / 2 || this.pos.x < - WORLD_SIZE / 2) {
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

  // normal
  wave() {
    let xFreq = this.pos.x * 0.05 + frame * 0.005;
    let noiseMove = map(noise(xFreq), 0, 1, -0.2, 0.6);
    let sinForFreq = sin(this.Wvel * frame) * noiseMove;
    this.Wfreq = (frame * this.Wvel + this.pos.x * this.Wlen) * this.WfreqAdj + sinForFreq;
    let sinValue = sin(this.Wfreq) * this.Wamp;
    this.pos.y = sinValue;
  }

  flow() {
    let xFreq1 = this.pos.x * 0.1 + frame * 0.005;
    let yFreq1 = this.pos.y * 0.1 + frame * 0.005;
    let zFreq1 = this.pos.z * 0.5 + frame * 0.005;
    let noiseValue = map(noise(xFreq1, yFreq1, zFreq1), 0.0, 1.0, -1.0, 1.0);
    let pos_adj = new p5.Vector(cos(frame * 0.005), sin(frame * 0.005), sin(frame * 0.005));
    pos_adj.normalize();
    let xFreq2 = this.pos.x * 0.05 + frame * 0.005 + 100;
    let yFreq2 = this.pos.y * 0.05 + frame * 0.005 + 100;
    let zFreq2 = this.pos.z * 0.05 + frame * 0.005 + 100;
    let noiseForMag = map(noise(xFreq2, yFreq2, zFreq2), 0.0, 1.0, -1.0, 1.0);
    pos_adj.mult(noiseValue * noiseForMag * params.flow_value);
    this.pos.add(pos_adj);
    this.pos.y += this.Wpos;
  }


  // variation
  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }
  scatter() {
    let xFreq = this.pos.x * 0.05 + frame * 0.005 + 1000;
    let yFreq = this.pos.y * 0.05 + frame * 0.005 + 1000;
    let noise_for_vel = map(noise(xFreq, yFreq), 0.0, 1.0, 0, 1);
    let noise_for_dirX = map(noise(xFreq, yFreq), 0.0, 1.0, -1, 1);
    let noise_for_dirY = map(noise(xFreq + 3000, yFreq + 3000), 0.0, 1.0, -200, 200);
    // let force = new p5.Vector(0, noise_for_dirY, 0);
    let force = new p5.Vector(noise_for_dirX, noise_for_dirY, 0);
    force.normalize();
    force.mult(noise_for_vel * 0.5);
    this.applyForce(force);
  }
  moveUp(spd) {
    let xFreq = this.pos.x * 0.005 + frame * 0.005 + 1000;
    let yFreq = this.pos.y * 0.05 + frame * 0.005 + 1000;
    let noise_moveup = map(noise(xFreq, yFreq), 0.0, 1.0, -0.5 * spd, 3 * spd);
    let force_up = new p5.Vector(0, noise_moveup, 0);
    this.applyForce(force_up);
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}
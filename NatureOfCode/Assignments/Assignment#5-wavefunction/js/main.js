let params = {
  PARTICLE_NUMBER: 3000,
  wave_particle_num: 1000,
  particle_num: 0,
  color: "#FFFFFF"
};

const WORLD_SIZE = 1000;

let pointCloud;
let particles = [];

function setupThree() {
  // initialize particles


  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  // GUI
  let folderBasic = gui.addFolder("WORLD BASIC");
  folderBasic.open();
  folderBasic.add(params, "PARTICLE_NUMBER", 0, params.PARTICLE_NUMBER).step(1).listen();
  folderBasic.add(params, "particle_num").listen();
  folderBasic.addColor(params, 'color');
}

// ===============================================================

function updateThree() {
  // set GUI variables
  let c = color(params.color);

  // update the Particles class
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.setColor(red(c), green(c), blue(c));
    p.move();
    p.flow();
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
  params.particle_num = particles.length;
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
function WaveParticles(wave_particle_num, Wvel, Wlen, Wamp, WfreqAdj = 1, WampAdj = 1) {
  for (let i = 0; i < params.PARTICLE_NUMBER; i++) {
    let p = new Particle()
      .setPos(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), 0, 0)
      .setVel(0, 0, 0);
    // let randomVal = random(-1, 1);
    // if (randomVal > 0) {
    //   p.setWave(0.01, 0.011, 50);
    // }
    // else {
    //   p.setWave(0.02, 0.01, 50);
    // }
    particles.push(p);
  }

  let sinForFreq = sin(Wvel * frame) * 0.4;
  Wfreq = (frame * Wvel + x * Wlen) * WfreqAdj + sinForFreq;
  //   let sinValue = sin(this.Wfreq) * this.Wamp;
  //   let sinForFreq = sin(this.Wvel * frame) * 0.4;
  //   this.Wfreq = (frame * this.Wvel + this.pos.x * this.Wlen) * this.WfreqAdj + sinForFreq;
  //   let sinValue = sin(this.Wfreq) * this.Wamp;
  //   this.pos.y = sinValue;
  // }

}

// ==============================================================
class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

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

  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }

  flow() {
    let xFreq = this.pos.x * 0.05 + frame * 0.005;
    let yFreq = this.pos.y * 0.05 + frame * 0.005;
    let noiseValue = map(noise(xFreq, yFreq), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(cos(frame * 0.005), sin(frame * 0.005), 0);
    force.normalize();
    force.mult(noiseValue * 0.01);
    this.applyForce(force);
  }
}

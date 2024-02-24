let params = {
  color: "#FFF"
};

let cubes = [];

function setupThree() {
  for (let i = 0; i < 100; i++) {
    // let cube = new Box(0, 0, 0);
    let cube = new Box()
      .setPos(0, 0, 0)
      .setVel()
      .setScl(20, 50)
      .setRot(random(-0.01, 0.01), random(-0.01, 0.01), random(-0.01, 0.01))
      .setRotVel(random(-0.01, 0.01), random(-0.01, 0.01), random(-0.01, 0.01));
    cubes.push(cube);
  }
  console.log(cubes[0].pos.x); //print mesh's position for debugging
}


function updateThree() {
  for (let c of cubes) {
    c.update();
    c.fall();
    c.move();
    c.rotate();
  }
  console.log(cubes[0].pos.x);
}


function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial({
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh); // ***
  return mesh;
}




// mesh is an attribute for the class
// need to have the update() to update the mesh to the position
// define the var at constructor; setup; update; 

class Box {
  constructor() {
    this.pos = createVector(); // ??? this.vel = new THREE.Vector3();
    this.vel = createVector();
    this.scl = createVector();
    this.rot = createVector();
    this.rotVel = createVector();
    this.mesh = getBox();
  }
  // ??? constructor with variables input

  setPos(x, y, z) {
    this.pos = createVector(x, y, z); //??? already createVector at constructor? why create another one here?
    return this; // ***
  }

  setVel() {
    this.vel = createVector(random(-5, 5), random(0, 10), random(-5, 5));
    return this;
  }

  setScl(min, max) {
    this.scl = createVector(random(min, max), random(min, max), random(min, max));
    return this;
  }

  setRot(x, y, z) { // angle
    this.rot = createVector(x, y, z);
    return this;
  }

  setRotVel(x, y, z) { // rotation velocity
    this.rotVel = createVector(x, y, z);
    return this;
  }

  fall() {
    this.vel.add(0, -0.05, 0);
  }

  move() {
    this.pos.add(this.vel);
  }

  rotate() {
    this.rot.add(this.rotVel);
  }

  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.set(this.rot.x, this.rot.y, this.rot.z);
    this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
}

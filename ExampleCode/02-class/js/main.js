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
      .setScl();
    cubes.push(cube);
  }
  // console.log(cubes);
}


function updateThree() {
  for (let c of cubes) {
    c.update();
    c.fall();
    c.move();
  }
}


function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh); // ***
  return mesh;
}




// mesh is an attribute for the class
// need to have the update() to update the mesh to the position

class Box { // don't need the display method for the class obj in 3js
  constructor() {
    this.pos = createVector(); // ??? this.vel = new THREE.Vector3(1, 1, 1)
    this.vel = createVector();
    this.scl = createVector(); // not a vector but use it to store the xyz value
    this.mesh = getBox(); // *** getBox will make a mesh and put it into the scene -- don't need 'display'
  }
  // ------------------------
  // remove the set functions and all put into the constructor
  // constructor() {
  //   this.pos = createVector(random(-500, 500), random(-500, 500), random(-500, 500));
  //   this.vel = createVector(random(-5, 5), random(-5, 5), random(-5, 5));
  //   this.mesh = getBox();
  // }
  // ------------------------
  // ??? constructor with variables input
  // constructor(x, y, z) {
  //   this.posX = x;
  //   this.posY = y;
  //   this.posZ = z;
  //   this.pos = createVector(this.posX, this.posY, this.posZ);
  //   this.vel = createVector(random(-5, 5), random(-5, 5), random(-5, 5));
  //   this.mesh = getBox();
  // }
  // ------------------------
  setPos(x, y, z) {
    this.pos = createVector(x, y, z); //??? already createVector at constructor? why create another one here?
    return this; // *** need return
  }

  setVel() {
    this.vel = createVector(random(-5, 5), random(0, 10), random(-5, 5));
    return this;
  }

  setScl() {
    this.scl = createVector(random(20, 50), random(20, 50), random(20, 50));
    return this;
  }

  fall() {
    this.vel.add(0, -0.05, 0);
  }

  move() {
    this.pos.add(this.vel);
  }

  update() {
    // this.mesh.position.set(this.posX, this.posY, this.posZ);
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
}

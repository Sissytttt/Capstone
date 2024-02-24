let params = {
  color: "#FFF"
};


function setupThree() {

  for (let i = 0; i < 5; i++) {
    layer = this.getLayer((i + 1) / 4);
    scene.add(layer);
    layer.position.set(1, 200 - (i * 50), 0); //(x, y, z);
    layer.scale.set(100, 100, 100);
    layer.rotation.z = Math.random() * 360 * Math.PI / 180;
    layer.rotation.x = Math.PI / 2;
  }
  // setup gui
  // gui.add(cube.scale, "x").min(1).max(200).step(0.1);
  // gui.add(cube.scale, "y").min(1).max(200).step(0.1);
  // gui.add(cube.scale, "z").min(1).max(200).step(0.1);
  // gui.addColor(params, "color");
}

function updateThree() {
  // cube.material.color.set(params.color);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}


function getLayer(size) {
  const geometry = new THREE.TorusGeometry(size, 0.25, 16, 5);
  const material = new THREE.MeshBasicMaterial({
    color: 0x0E9212,
    // side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}


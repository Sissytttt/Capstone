let params = {
  color: "#FFF"
};


let pointCloud;

function setupThree() {
  pointCloud = getPoints(100000);
  scene.add(pointCloud);
}

function updateThree() {
  // update the mesh
  //pointCloud.position.x += 1;
  //pointCloud.rotation.x += 0.01;
  //pointCloud.rotation.z += 0.02;

  // update the individual points
  let positionArray = pointCloud.geometry.attributes.position.array;
  for (let i = 0; i < positionArray.length; i += 3) {
    positionArray[i + 0] += random(-1, 1); //x
    positionArray[i + 1] += random(-1, 1); //y
    positionArray[i + 2] += random(-1, 1); //z
  }
  //https://threejs.org/docs/#manual/en/introduction/How-to-update-things
  pointCloud.geometry.setDrawRange(0, 1000);
  pointCloud.geometry.attributes.position.needsUpdate = true; // ***
}

function getPoints(maxNum) {
  const vertices = [];

  for (let i = 0; i < maxNum; i++) {
    const x = random(-1000, 1000);
    const y = random(-1000, 1000);
    const z = random(-1000, 1000);
    vertices.push(x, y, z);
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({
    color: 0xFFFF00
  });
  const points = new THREE.Points(geometry, material);
  return points;
}
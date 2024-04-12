function update_points() {
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
        size: random(1, 3),
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

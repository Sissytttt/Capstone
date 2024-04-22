function adjust_Camera_lookat(x = 0, y = 0, z = 0) {
    camera.position.x = params_basic.cameraX;
    camera.position.y = params_basic.cameraY;
    camera.position.z = params_basic.cameraZ;
    camera.lookAt(x, y, z);
}

function set_Camera(x, y, z = params_basic.cameraZ) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    camera.lookAt(0, 0, 0);
}

function move_Camera(x, y, z = params_basic.cameraZ) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    camera.lookAt(0, 0, 0);
}

// ***
function moveCameraTo(x, y, z = params_basic.cameraZ) {
    let targetPos = createVector(x, y, z);
    let moveVector = createVector(targetPos.x - camera.position.x, targetPos.y - camera.position.y, targetPos.z - camera.position.z);
    let moveSpd = 2;
    if (moveVector.mag() > moveSpd) {
        let stepVector = moveVector.normalize().mult(moveSpd);
        let nextPos = createVector(camera.position.x + stepVector.x, camera.position.y + stepVector.y, camera.position.z + stepVector.z);
        camera.position.set(nextPos.x, nextPos.y, nextPos.z);
    } else {
        camera.position.set(x, y, z);
    }
    camera.lookAt(0, 0, 0);
}

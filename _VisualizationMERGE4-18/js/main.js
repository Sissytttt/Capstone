let pointCloud;
let particles = [];

let mode = "NONE";
let play = false;
let CanChange = false; // need to wait canvasClean -> change the next mode

function setupThree() {
  setupFastSinCos();
  setup_Ps();
  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);
  display_particle_num();
}

// setup
document.addEventListener('keydown', onKeyDown);
function onKeyDown(event) {
  if (play == true) {
    if (event.key == " ") {
      mode = "NONE";
      play = false;
      return;
    } else {
      console.log("Please press space first");
      return;
    }
  }
  if (CanChange == false) {
    console.log("Please wait until all particles disappear to change mode");
    return;
  }
  CanChange = false;
  switch (event.key) {
    case " ":
      mode = "NONE";
      play = false;
      break;
    case "1":
      remove_all_GUIs();
      water_GUI_MOVEMENT();
      mode = "WATER";
      play = true;
      water_setup_lines();
      break;
    case "2":
      remove_all_GUIs();
      mountain_GUI_MOVEMENT();
      mode = "MOUNTAIN";
      play = true;
      mountain_setup_Ps();
      break;
    case "3":
      remove_all_GUIs();
      earth_GUI_MOVEMENT();
      mode = "EARTH";
      play = true;
      earth_setup_circles();
      earth_generate_Ps();
      break;
    case "4":
      remove_all_GUIs();
      thunder_GUI_MOVEMENT();
      mode = "THUNDER";
      play = true;
      thunder_setup_thunders();
      thunder_generate_Ps();
      break;
  }
}

function updateThree() {
  update_GUI();
  update_points();
  switch (mode) {
    case "NONE":
      particles_disappear();
      if (particles.length == 0) {
        CanChange = true;
      }
      break;
    case "WATER":
      water_generate_Ps();
      water_update_Ps();
      water_interaction_controller();
      break;
    case "MOUNTAIN":
      mountain_generate_Ps();
      mountain_update_Ps();
      mountain_interaction_controller();
      break;
    case "EARTH":
      earth_generate_Ps();
      earth_update_circles();
      earth_update_Ps();
      earth_interaction_controller();
      break;
    case "THUNDER":
      thunder_generate_Ps();
      thunder_update_Ps();
      thunder_update_thunders();
      thunder_interaction_controller();
      break;
  }
}



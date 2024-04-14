let pointCloud;
let particles = [];
// need to wait canvasClean -> change the next mode
let CanChange = false;
let mode = "NONE";

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
  switch (event.key) {
    case " ":
      mode = "NONE";
      break;
    case "1":
      remove_all_GUIs();
      water_GUI_MOVEMENT();
      mode = "WATER";
      water_setup_lines();
      break;
    case "2":
      remove_all_GUIs();
      mountain_GUI_MOVEMENT();
      mode = "MOUNTAIN";
      mountain_setup_Ps();
      break;
    case "3":
      remove_all_GUIs();
      earth_GUI_MOVEMENT();
      mode = "EARTH";
      earth_setup_circles();
      earth_generate_Ps();
      break;
    case "4":
      remove_all_GUIs();
      thunder_GUI_MOVEMENT();
      mode = "THUNDER";
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

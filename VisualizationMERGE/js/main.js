let pointCloud;
let particles = [];

// need to wait canvasClean -> change the next mode
let mode = "NONE";

function setupThree() {

  setup_Ps();

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  display_particle_num();
  // GUI_for_water();

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
      mode = "EARTH";
      break;
    case "4":
      mode = "THUNDER";
      break;
  }
}



function updateThree() {
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
      //
      break;
    case "THUNDER":
      //
      break;
  }

  update_GUI();
  update_points();
}

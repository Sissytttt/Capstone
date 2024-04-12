let pointCloud;
let particles = [];

// let mode = "NONE";
let mode = "NONE";

function setupThree() {

  setup_Ps();

  // Points
  pointCloud = getPoints(particles);
  scene.add(pointCloud);

  GUI_for_Movement();
  display_particle_num();
  // GUI_for_water();

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
      //
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


document.addEventListener('keydown', onKeyDown);
function onKeyDown(event) {
  switch (event.key) {
    case " ":
      mode = "NONE";
      break;
    case "1":
      mode = "WATER";
      setup_water_lines();
      break;
    case "2":
      mode = "MOUNTAIN";
      break;
    case "3":
      mode = "EARTH";
      break;
    case "4":
      mode = "THUNDER";
      break;
  }
} 

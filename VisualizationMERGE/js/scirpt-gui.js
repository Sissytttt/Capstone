function GUI_for_Movement() {
    let ControlFolder = gui.addFolder("CONTROL");
    ControlFolder.open();
    ControlFolder.add(control, "Weight", 0, 10, 0.1);
    ControlFolder.add(control, "Time", 0, 10, 0.1);
    ControlFolder.add(control, "Space", 0, 10, 0.1).onChange(update_space_int);
    ControlFolder.add(control, "Flow", 0, 10, 0.1);
}

function display_particle_num() {
    gui.add(params_basic, "Particles_in_scene").listen();
}


// ================= Update GUI ==================
function update_GUI() {
    params_basic.Particles_in_scene = particles.length;
}
// ================= Detailed GUI For Each Visualizations ====================
function GUI_for_water() {
    let folderBasic = gui.addFolder("WORLD BASIC");
    folderBasic.add(params_basic, "MAX_PARTICLE_NUMBER", 0, 20000).step(1);
    folderBasic.add(params_basic, "WORLD_WIDTH", 0, 2000, 10).onChange(setup_water);
    folderBasic.add(params_basic, "WORLD_HEIGHT", 0, 2000, 10).onChange(setup_water);
    folderBasic.add(params_basic, "WORLD_DEPTH", 0, 2000, 10).onChange(setup_water);

    let LineFolder = gui.addFolder("Line");
    LineFolder.add(water, "Line_Num", 1, 100, 1).onChange(setup_water);
    LineFolder.add(water, "BendMagnitude", 0, 80, 1);
    LineFolder.add(water, "BendLength", 0, 1, 0.001);
    LineFolder.add(water, "ChangeSpeed", 0, 1, 0.001);
    LineFolder.add(water, "BendDifference", 0, 1, 0.001);
    LineFolder.add(water, "Brightness", 0, 1, 0.001);
    LineFolder.add(water, "Brightness2", 0, 10, 0.001);

    let ParticleFolder = gui.addFolder("Particles");
    ParticleFolder.add(water, "FlowPosFreq", 0, 0.5, 0.0001);
    ParticleFolder.add(water, "FlowTimeFreq", 0, 0.5, 0.0001);
    ParticleFolder.add(water, "MoveSpd", 0, 0.5, 0.0001);
}

function display_particle_num() {
    gui.add(params_basic, "Particles_in_scene").listen();
}


// ================= Update GUI ==================
function update_GUI() {
    params_basic.Particles_in_scene = particles.length;
}
function remove_all_GUIs() {
    for (let folder in gui.__folders) {
        if (gui.__folders.hasOwnProperty(folder)) {
            gui.removeFolder(gui.__folders[folder]);
        }
    }
}
// ================= Detailed GUI For Each Visualizations ====================

// ======================== WATER ==========================
function water_GUI_MOVEMENT() {
    let water_ControlFolder = gui.addFolder("water_CONTROL");
    water_ControlFolder.open();
    water_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    water_ControlFolder.add(control, "Time", 0, 10, 0.1);
    water_ControlFolder.add(control, "Space", 0, 10, 0.1).onChange(update_space_int);
    water_ControlFolder.add(control, "Flow", 0, 10, 0.1);
}

function GUI_for_water() {
    let folderBasic = gui.addFolder("WORLD BASIC");
    folderBasic.add(params_basic, "MAX_PARTICLE_NUMBER", 0, 20000).step(1);
    folderBasic.add(params_basic, "WORLD_WIDTH", 0, 2000, 10).onChange(setup_water);
    folderBasic.add(params_basic, "WORLD_HEIGHT", 0, 2000, 10).onChange(setup_water);
    folderBasic.add(params_basic, "WORLD_DEPTH", 0, 2000, 10).onChange(setup_water);

    let LineFolder = gui.addFolder("Line");
    LineFolder.add(water_params, "Line_Num", 1, 100, 1).onChange(setup_water_params);
    LineFolder.add(water_params, "BendMagnitude", 0, 80, 1);
    LineFolder.add(water_params, "BendLength", 0, 1, 0.001);
    LineFolder.add(water_params, "ChangeSpeed", 0, 1, 0.001);
    LineFolder.add(water_params, "BendDifference", 0, 1, 0.001);
    LineFolder.add(water_params, "Brightness", 0, 1, 0.001);
    LineFolder.add(water_params, "Brightness2", 0, 10, 0.001);

    let ParticleFolder = gui.addFolder("Particles");
    ParticleFolder.add(water_params, "FlowPosFreq", 0, 0.5, 0.0001);
    ParticleFolder.add(water_params, "FlowTimeFreq", 0, 0.5, 0.0001);
    ParticleFolder.add(water_params, "MoveSpd", 0, 0.5, 0.0001);
}


// ======================= MOUNTAIN =========================
function mountain_GUI_MOVEMENT() {
    let mountain_ControlFolder = gui.addFolder("mountain_CONTROL");
    mountain_ControlFolder.open();
    mountain_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    mountain_ControlFolder.add(control, "Time", 0, 10, 0.1);
    mountain_ControlFolder.add(control, "Space", 0, 10, 0.1);
    let mountain_MoreControl = gui.addFolder("MORE");
    mountain_MoreControl.add(control, "ForceX", -5, 5, 0.1);
    mountain_MoreControl.add(control, "ForceY", -5, 5, 0.1);
}
function GUI_for_mountain() {
    let folderBasic = gui.addFolder("WORLD BASIC");
    folderBasic.add(mountain_params, "PARTICLE_NUMBER", 0, 20000).step(1).listen();
    folderBasic.add(mountain_params, "particleNum").listen();
    folderBasic.add(mountain_params, "WORLD_WIDTH", 0, 2000).step(10);
    folderBasic.add(mountain_params, "WORLD_HEIGHT", 0, 2000).step(10);
    folderBasic.addColor(mountain_params, 'color');

    let folderPattern = gui.addFolder("Pattern");
    folderPattern.add(mountain_params, "noisePosXFreq", 0, 10).step(0.0001); // big = not obvious patter
    folderPattern.add(mountain_params, "noisePosYFreq", 0, 10).step(0.0001); // big = not obvious patter

    let folderParticle = gui.addFolder("Particle");
    folderParticle.add(mountain_params, "velocity", 0, 10).step(0.1);
    folderParticle.add(mountain_params, "lifeReductionMin", 0, 0.01).step(0.0001);
    folderParticle.add(mountain_params, "lifeReductionMax", 0, 0.05).step(0.0001);

}




// ======================== EARTH ==========================
function earth_GUI_MOVEMENT() {
    let earth_ControlFolder = gui.addFolder("earth_CONTROL");
    earth_ControlFolder.open();
    earth_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    earth_ControlFolder.add(control, "Time", 0, 10, 0.1);
    earth_ControlFolder.add(control, "Space", 0, 10, 0.1);
    earth_ControlFolder.add(control, "Flow", 0, 10, 0.1);
}
function GUI_for_earth() {
    let CircleFolder = gui.addFolder("Circle");
    CircleFolder.add(earth_params, "Circle_Num", 1, 100, 1).onChange(earth_setup_circles);

    let ParticleFolder = gui.addFolder("Particles");
    ParticleFolder.add(earth_params, "FlowPosFreq", 0, 0.5, 0.0001);
    ParticleFolder.add(earth_params, "FlowTimeFreq", 0, 0.5, 0.0001);
    ParticleFolder.add(earth_params, "MoveSpd", 0, 0.5, 0.0001);
}

// ======================= THUNDER =========================
function thunder_GUI_MOVEMENT() {
    let thunder_ControlFolder = gui.addFolder("thunder_CONTROL");
    thunder_ControlFolder.open();
    thunder_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    thunder_ControlFolder.add(control, "Time", 0, 10, 0.1);
    thunder_ControlFolder.add(control, "Space", 0, 10, 0.1);
    thunder_ControlFolder.add(control, "Flow", 0, 10, 0.1);
}
function GUI_for_thunder() {
    let folderThunder = gui.addFolder("LINES CONTROL");
    folderThunder.add(thunder_params, "StartPoints", 1, 10, 1).listen();
    folderThunder.add(thunder_params, "AngleRange", 1, 90, 1).listen();
    folderThunder.add(thunder_params, "BranchAngleRange", 1, 90, 1).listen();
    folderThunder.add(thunder_params, "anglePossibility", 0, 1, 0.001).listen();
    folderThunder.add(thunder_params, "branchPossibility", 0, 0.5, 0.001).listen();
    folderThunder.add(thunder_params, "moveSpdMin", 0, 5, 0.1).listen();
    folderThunder.add(thunder_params, "moveSpdMax", 1, 10, 0.1).listen();
    folderThunder.add(thunder_params, "thickness", 1, 5, 0.1).listen();

    let folderParticle = gui.addFolder("PARTICLE CONTROL");
    folderParticle.add(thunder_params, "particleLifeSpan", 0, 2, 0.01).listen();
    folderParticle.add(thunder_params, "flowPosFreq", 0, 1, 0.001).listen();
    folderParticle.add(thunder_params, "flowTimeFreq", 0, 1, 0.001).listen();
    folderParticle.add(thunder_params, "flowSpd", 0, 0.1, 0.0001).listen();
}

// ======================== FIRE ==========================
function fire_GUI_MOVEMENT() {
    let fire_ControlFolder = gui.addFolder("fire_CONTROL");
    fire_ControlFolder.open();
    fire_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    fire_ControlFolder.add(control, "Time", 0, 10, 0.1);
    fire_ControlFolder.add(control, "Space", 0, 10, 0.1);
    fire_ControlFolder.add(control, "Flow", 0, 10, 0.1);
}


// ======================== LAKE ==========================
function lake_GUI_MOVEMENT() {
    let lake_ControlFolder = gui.addFolder("lake_CONTROL");
    lake_ControlFolder.open();
    lake_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    lake_ControlFolder.add(control, "Time", 0, 10, 0.1);
    lake_ControlFolder.add(control, "Space", 0, 10, 0.1);
    lake_ControlFolder.add(control, "Flow", 0, 10, 0.1);
}


// ======================= HEAVEN =========================
function heaven_GUI_MOVEMENT() {
    let heaven_ControlFolder = gui.addFolder("heaven_CONTROL");
    heaven_ControlFolder.open();
    heaven_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    heaven_ControlFolder.add(control, "Time", 0, 10, 0.1);
    heaven_ControlFolder.add(control, "Space", 0, 10, 0.1);
    heaven_ControlFolder.add(control, "Flow", 0, 10, 0.1);
}


// ======================== WIND ==========================
function wind_GUI_MOVEMENT() {
    let wind_ControlFolder = gui.addFolder("wind_CONTROL");
    wind_ControlFolder.open();
    wind_ControlFolder.add(control, "Weight", 0, 10, 0.1);
    wind_ControlFolder.add(control, "Time", 0, 10, 0.1);
    wind_ControlFolder.add(control, "Space", 0, 10, 0.1);
    wind_ControlFolder.add(control, "Flow", 0, 10, 0.1);
}
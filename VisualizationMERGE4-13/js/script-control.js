// map GUI values to detailed parameters

// ======================= WATER =========================
function water_interaction_controller() {
    // weight
    water_params.BendMagnitude = map(control.Weight, 0, 10, 10, 200);
    water_params.Brightness = map(control.Weight, 0, 10, 0.01, 2);
    water_params.Brightness2 = map(control.Weight, 0, 10, 1, 5);
    // time
    if (control.Time <= 5) {
        water_params.MoveSpd = map(control.Time, 0, 5, 0.0001, 0.02);
        water_params.sideForce = map(control.Time, 0, 5, 0.5, 1);
    }
    else {
        water_params.MoveSpd = map(control.Time, 5, 10, 0.02, 0.1);
        water_params.sideForce = map(control.Time, 0, 5, 1, 2);
    }

    // Space
    if (update_lineNum) {
        water_params.Line_Num = map(space_int, 0, 10 / 3, 10, 40);
        water_setup_lines();
        update_lineNum = false;
    }
    if (control.Space <= 4) {
        water_params.ChangeSpeed = map(control.Space, 0, 4, 0.01, 0.03);
    }
    else {
        water_params.ChangeSpeed = map(control.Space, 4, 10, 0.002, 0.01);
    }
    // flow
    if (control.Flow <= 5) {
        water_params.lifeReductionMin = map(control.Flow, 0, 5, 0.004, 0.006);
        water_params.lifeReductionMax = map(control.Flow, 0, 5, 0.01, 0.02);
    }
    else {
        water_params.lifeReductionMin = map(control.Flow, 5, 10, 0.006, 0.01);
        water_params.lifeReductionMax = map(control.Flow, 5, 10, 0.02, 0.05);
    }
}
function update_space_int() {
    let calc_space_int = floor(control.Space / 3);
    space_int_prev = space_int;
    if (calc_space_int != space_int) {
        space_int = calc_space_int;
    }
    if (space_int_prev != space_int) {
        update_lineNum = true;
    }
    else {
        update_lineNum = false;
    }
    console.log(calc_space_int);
}




// ======================= MOUNTAIN =========================
function mountain_interaction_controller() {
    // weight
    if (control.Weight < 4) {
        mountain_params.fade = false;
    }
    else if (control.Weight >= 7) {
        mountain_params.fade = true;
        mountain_params.lifeReductionMin = map(control.Weight, 10, 7, 0.001, 0.0008);
        mountain_params.lifeReductionMax = map(control.Weight, 10, 7, 0.005, 0.003);
    }
    else {
        mountain_params.fade = true;
        mountain_params.lifeReductionMin = map(control.Weight, 7, 4, 0.0005, 0.0005);
        mountain_params.lifeReductionMax = map(control.Weight, 7, 4, 0.01, 0.005);
    }

    // time
    // p.apply_outsideForce(mountain_params.outsideForce_strength);
    mountain_params.velocity = map(control.Time, 0, 10, 1, 10);

    // Space
    if (control.Space < 5) {
        mountain_params.WORLD_WIDTH = map(control.Space, 0, 5, 600, 1600);
    }
    else {
        mountain_params.WORLD_WIDTH = 1600;
    }

    // flow 
    // effect really not obvious *** because patterns are already formed.
    // flow value is small -- movement is fluent -- pattern is not obvious
    // if (control.Space <= 5) {
    //   mountain_params.rangeThreshold1 = map(control.Flow, 0, 5, 0.25, 0.2);
    //   mountain_params.rangeThreshold2 = map(control.Flow, 0, 5, 0.5, 0.5);
    //   mountain_params.rangeThreshold3 = map(control.Flow, 0, 5, 0.75, 0.8);
    // }
    // else {
    //   mountain_params.rangeThreshold1 = map(control.Flow, 5, 10, 0.2, 0.1);
    //   mountain_params.rangeThreshold2 = map(control.Flow, 5, 10, 0.5, 0.2);
    //   mountain_params.rangeThreshold3 = map(control.Flow, 5, 10, 0.8, 0.2);
    // }
}


// ======================== EARTH ==========================



// ======================= THUNDER =========================



// ======================== FIRE ==========================



// ======================== LAKE ==========================



// ======================= HEAVEN =========================



// ======================== WIND ==========================



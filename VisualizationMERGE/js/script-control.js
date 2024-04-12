// map GUI values to detailed parameters

// =============== WATER ================
function water_interaction_controller() {
    // weight
    water.BendMagnitude = map(control.Weight, 0, 10, 10, 100);
    water.Brightness = map(control.Weight, 0, 10, 0.01, 1);
    water.Brightness2 = map(control.Weight, 5, 10, 1, 5);
    // time
    if (control.Time <= 5) {
        water.MoveSpd = map(control.Time, 0, 5, 0.0001, 0.008);
    }
    else {
        water.MoveSpd = map(control.Time, 5, 10, 0.008, 0.05);
    }

    // Space
    if (update_lineNum) {
        water.Line_Num = map(space_int, 0, 10 / 3, 10, 40);
        setup_water();
        update_lineNum = false;
    }
    if (control.Space <= 4) {
        water.ChangeSpeed = map(space_int, 0, 5, 0.03, 0.01);
    }
    else {
        water.ChangeSpeed = map(space_int, 5, 10, 0.002, 0.01);
    }
    // flow
    if (control.Flow <= 5) {
        water.lifeReductionMin = map(control.Flow, 0, 5, 0.004, 0.006);
        water.lifeReductionMax = map(control.Flow, 0, 5, 0.01, 0.02);
    }
    else {
        water.lifeReductionMin = map(control.Flow, 5, 10, 0.006, 0.01);
        water.lifeReductionMax = map(control.Flow, 5, 10, 0.02, 0.05);
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
}




// =============== MOUNTAIN ================
function mountain_interaction_controller() { }



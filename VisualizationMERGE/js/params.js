let params_basic = {
    MAX_PARTICLE_NUMBER: 10000,
    Particles_in_scene: 0,
    WORLD_WIDTH: 2000,
    WORLD_HEIGHT: 1000,
    WORLD_DEPTH: 1000,
}
let water = {
    // line
    Line_Num: 10,
    BendMagnitude: 30,
    BendLength: 0.005, // do not show // noise(pos.y * BendLength + frame * ChangeSpeed)
    ChangeSpeed: 0.005, // noise(pos.y * BendAmount + frame * ChangeSpeed)
    BendDifference: 0.005, // do not show // noise(pos.x * BendDifference)
    Brightness: 1,
    Brightness2: 1,
    // particles
    FlowPosFreq: 0.005, // do not show // 
    FlowTimeFreq: 0.005,
    MoveSpd: 0.005,
    lifeReductionMin: 0.005,
    lifeReductionMax: 0.05,
};
let control = {
    Weight: 5,
    Time: 5, // acceleration
    Space: 5,
    Flow: 5,
}

// water
let LinePos = [];
let Lines = [];
let space_int = 0, space_int_prev = -1;
let update_lineNum = false;
let params_basic = {
    PARTICLE_NUMBER: 10000,
    Particles_in_scene: 0,
    WORLD_WIDTH: 1600,
    WORLD_HEIGHT: 900,
    WORLD_DEPTH: 600,
}

// ======================= WATER =========================
let water_params = {
    // line
    Line_Num: 10,
    BendMagnitude: 30,
    BendLength: 0.002, //  noise(pos.y * BendLength + frame * ChangeSpeed)
    ChangeSpeed: 0.01, // noise(pos.y * BendAmount + frame * ChangeSpeed)
    BendDifference: 0.005, // noise(pos.x * BendDifference)
    Brightness: 1,
    Brightness2: 1,
    sideForce: 3,
    // particles
    FlowPosFreq: 0.005,
    FlowTimeFreq: 0.005,
    MoveSpd: 0.01,
    lifeReductionMin: 0.005,
    lifeReductionMax: 0.05,
};
let control = {
    Weight: 5,
    Time: 5, // acceleration
    Space: 5,
    Flow: 5,
    ForceX: 0, // for mountain
    ForceY: 0, // for mountain
}

// water
let LinePos = [];
let Lines = [];
let space_int = 0, space_int_prev = -1;
let update_lineNum = false;



// ======================= MOUNTAIN =========================
let mountain_params = {
    PARTICLE_NUMBER: 10000,
    WORLD_WIDTH: 1600,
    // pattern
    noisePosXFreq: 0.004,
    noisePosYFreq: 0.01,
    rangeThreshold1: 0.2,
    rangeThreshold2: 0.5,
    rangeThreshold3: 0.8,
    // particle
    velocity: 4,
    fade: false,
    lifeReductionMin: 0.0001,
    lifeReductionMax: 0.005,

    outsideForce_strength: 1,
};




// ======================== EARTH ==========================



// ======================= THUNDER =========================



// ======================== FIRE ==========================



// ======================== LAKE ==========================



// ======================= HEAVEN =========================



// ======================== WIND ==========================

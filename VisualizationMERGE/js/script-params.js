let params_basic = {
    PARTICLE_NUMBER: 10000,
    Particles_in_scene: 0,
    WORLD_WIDTH: 1600,
    WORLD_HEIGHT: 900,
    WORLD_DEPTH: 1500,
}
let sinArray = [];
let cosArray = [];
let sinCosResolution = 360 * 2;
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

let earth_params = {
    Circle_Num: 30,
    BendMagnitude: 30,
    sizeMin: 400,
    sizeMax: 1000,
    breathAmplMin: 30,
    breathAmplMax: 100,
    breathFreq: 0.02,
    gaussianSD: 100,
    moveRangeMin: 100,
    moveRangeMax: 400,
    moveThreshold: 0.5, // 0~1, >threshold的比例是会有起伏的比例
    WaveFrameFreq: 0.004,
    WaveRadFreq: 0.01,
    WaveAngleFreq: 0.005, // don't know what this controls
    // 
    MoveSpd: 0.001,
    lifeReductionMin: 0.005,
    lifeReductionMax: 0.02,
};
let earth_circles = [];

// ======================= THUNDER =========================
let thunder_params = {
    StartPoints: 5,
    AngleRange: 30,
    thunderLifespan: 1,
    BranchAngleRange: 70,
    anglePossibility: 0.05,
    branchPossibility: 0.008,
    moveSpdMin: 0,
    moveSpdMax: 1,
    thickness: 1,
    //
    particleLifeSpan: 1.0,
    flowPosFreq: 0.05,
    flowTimeFreq: 0.005,
    flowSpd: 0.005,
    lifeReductionMin: 0.005,
    lifeReductionMax: 0.05,
};
let thunder_thunders = [];

// ======================== FIRE ==========================



// ======================== LAKE ==========================



// ======================= HEAVEN =========================



// ======================== WIND ==========================

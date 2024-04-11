/*
let mode = 0;

setupThree() {
    // set up some objects shared among the scenes
}

updateThree() {
    switch (mode) {
        case 1:
           updateScene1(); 
           break;
        case 2:
           updateScene2(); 
           break;
        case 3:
           updateScene3(); 
           break;
        ...
    }
}

event: keyPressed {
    mode = some value;
    // setup();
    switch (mode) {
        case 1:
           setupScene1(); 
           break;
        case 2:
           setupScene2(); 
           break;
        case 3:
           setupScene3(); 
           break;
        ...
    }
}







*/
// Questions:
// 1. floor animation 也要合并吗？
// 2. 可以分别写在几个file里面吗？比如class写一个，params写一个；要不然too messy & hard to organize
// 3. Do i need transition between different visualization mode? or just transition from floor-oneVisualization
//    if 'yes' : 在swtich的时候不太确实要怎么做。因为之前都是有一个setup_Particles()和一个update_Particles()
//              1. no smooth transition: clean everything (particles=[]) --> setup() --> update()
//              2. smooth transition: 
//                 1. still need to process the update function of the previouse class, to those Ps gradually die
//                 2. at the same time generate Ps from the new class
// finish - fade all

let params = {
    World_,
    WaterParam_,
    MountainParams_,
    EarthParams_,
    ThunderParams_,
    FireParams_,
    LakeParams_,
    HeavenParams_,
    WindParams_,
}

let Water_;
let Mountain_;
let Earth_;
let Thunder_;
let Fire_;
let Lake_;
let Heaven_;
let Wind_;

let pointCloud;
let particles = [];

function setupThree() {
    // setup pointCloud
    // setup GUI (4 movement parameters + particleNum)
}

function updateThree() {
    // update GUI
}

function getPoints() { }


// ================ FUNCTIONS =================
// ------- Water -------
function water_generate_Ps() { }
function water_update_Ps() { }
// ----- Mountain -----
function mountain_generate_Ps() { }
function mountain_update_Ps() { }


//  ================= SWITCH =================
document.addEventListener('keypress', KeyControl);
function KeyControl(event) {
    switch (event.key) {
        case '1': // Water
            // do setup
            water_generate_Ps();
            water_update_Ps();
            water_controller();
            break;
        case '2': // Mountain
            mountain_generate_Ps();
            mountain_update_Ps();
            mountain_controller();
            break;
        case '3': // Earth

            break;
        case '4': // Thunder

            break;
        case '5': // Fire

            break;
        case '6': // Lake

            break;
        case '7': // Heaven

            break;
        case '8': // Wind

            break;
    }
}


// =============== CLASSES ================
class ParticleBasic {
    constructor() {
        this.pos = createVector();
        this.vel = createVector();
        this.acc = createVector();

        this.scl = createVector(1, 1, 1);
        this.mass = this.scl.x * this.scl.y * this.scl.z;
        this.color = { r: 255, g: 255, b: 255 }; // ?

        this.lifespan = 1.0;
        this.lifeReduction = 0;
        this.isDone = false;
    }
    set_pos(x, y, z) { }
    set_vel(x, y, z) { }
    set_color(r, g, b) { } // ?
    set_scl(a, b, c) { } // ?
    set_lifeReduction(min, max) { }
    set_lifeSpan(lifeSpan) { }
    move() { }
    apply_force(force) { }
    flow(spd) { } // some might need to overwrite
    age() { }
    disappear() { } // check canvas boundary
}


// ---------- Fire ---------- 
class FireParticle extends ParticleBasic {
    constructor() { }

    set_move_up() { }
    moveup() { }
}

// ---------- Water ---------- 
class WaterParticle extends ParticleBasic {
    constructor() {
        this.moveScl = random();
    }
}
class Line {
    // generate WaterParticles
}

// ---------- Mountain ---------- 
class MountainParticle extends ParticleBasic {
    constructor() {
        this.forceScl = 1;
    }
    move_down(v) { }
    apply_outsideForce(scl) { }
}

// ---------- Earth ---------- 
class EarthParticle extends ParticleBasic {
    constructor() {
        this.angle = 0;
        this.rad = 0;
        this.moveRange = 0;
        this.moveScl = random();
    }
    push_to_particle(array) { }
    set_angle() { } // par在这个圆的什么位置
    set_rad() { }
    set_moveRange() { }
    wave() { }
}
class Circle {
    // generate EarthParticles
}

// ---------- Thunder ---------- 
class ThunderParticle extends ParticleBasic {
    constructor() {
        this.moveScl = random();
    }
    check_pos() { }
}
class Thunder {
    // generate LightningParticles
}



// ============== CONTROLLER ==============
// map GUI values to detailed parameters
function water_controller() { }
function mountain_controller() { }


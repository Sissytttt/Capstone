
function setup_Ps() {
    while (particles.length < params_basic.PARTICLE_NUMBER) {
        let particle = new ParticleBasic()
            .set_pos(random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2), random(-params_basic.WORLD_HEIGHT / 2, params_basic.WORLD_HEIGHT / 2), random(-params_basic.WORLD_DEPTH / 2, params_basic.WORLD_DEPTH / 2))
            .set_lifeReduction(0.1, 0.01);
        particles.push(particle);
    }
}
function particles_disappear() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.disappear();
    }
}

// ======================== WATER ==========================
function water_generate_Ps() {
    while (particles.length < params_basic.PARTICLE_NUMBER) {
        let random_line = Math.floor(Math.random() * Lines.length);
        Lines[random_line].add_NewParticle();
    }
}
function water_update_Ps() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.flow(water_params.FlowPosFreq, water_params.FlowTimeFreq, water_params.MoveSpd);
        p.move();
        p.age();
        if (p.isDone) {
            particles.splice(i, 1);
            i--;
        }
    }
}
function water_setup_lines() {
    if (LinePos.length > 0 || Lines.length > 0) {
        LinePos = [];
        Lines = [];
    }
    for (let i = 0; i < water_params.Line_Num; i++) {
        posX = random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2);
        posY = 0;
        posZ = random(-params_basic.WORLD_DEPTH / 2, params_basic.WORLD_DEPTH / 2);
        LinePos.push([posX, posY, posZ]);
    }
    for (let i = 0; i < water_params.Line_Num; i++) {
        let line = new WaterLineClass()
            .set_pos(...LinePos[i])
            .set_spd((random() < 0.5 ? 1 : -1) * water_params.ChangeSpeed * random(-0.7, 1.3));
        Lines.push(line);
    }
}

// ======================= MOUNTAIN =========================
function mountain_setup_Ps() {
    for (let i = 0; i < params_basic.PARTICLE_NUMBER; i++) {
        let p = new MountainParticle()
            .set_pos(random(-mountain_params.WORLD_WIDTH / 2, mountain_params.WORLD_WIDTH / 2), random(-params_basic.WORLD_HEIGHT / 2, params_basic.WORLD_HEIGHT / 2), 0)
            .set_lifeReduction(mountain_params.lifeReductionMin, mountain_params.lifeReductionMax)
        particles.push(p);
    }
}
function mountain_generate_Ps() {
    while (particles.length < params_basic.PARTICLE_NUMBER) {
        let p = new MountainParticle()
            .set_pos(random(-mountain_params.WORLD_WIDTH / 2, mountain_params.WORLD_WIDTH / 2), params_basic.WORLD_HEIGHT / 2, 0)
            .set_lifeReduction(mountain_params.lifeReductionMin, mountain_params.lifeReductionMax)
        particles.push(p);
    }
}
function mountain_update_Ps() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.move_down(mountain_params.velocity);
        p.apply_outsideForce(mountain_params.outsideForce_strength);
        p.move();
        p.check_boundary();
        p.remove();
        if (mountain_params.fade == true) {
            p.age();
        }
        p.remove();

    }
}





// ======================== EARTH ==========================



// ======================= THUNDER =========================



// ======================== FIRE ==========================



// ======================== LAKE ==========================



// ======================= HEAVEN =========================



// ======================== WIND ==========================
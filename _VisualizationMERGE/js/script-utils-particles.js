
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
        p.update_opacity();
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
        posZ = random(-params_basic.WORLD_DEPTH / 5, params_basic.WORLD_DEPTH / 5);
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
        p.update_opacity();
        p.check_boundary();
        p.remove();
        if (mountain_params.fade == true) {
            p.age();
        }
        p.remove();

    }
}


// ======================== EARTH ==========================
function earth_setup_circles() {
    for (let i = 0; i < earth_params.Circle_Num; i++) {
        let rAdj = abs(randomGaussian(0, earth_params.gaussianSD));
        if (rAdj > earth_params.sizeMax - earth_params.sizeMin) {
            rAdj = earth_params.sizeMax - earth_params.sizeMin;
        }
        let circle = new Circle()
            .set_rAdj(rAdj)
            .set_pos(0, 0, 0)
            .set_size(earth_params.sizeMin + rAdj)
            .set_breath_FreqAmpl(earth_params.breathFreq, earth_params.breathAmplMin, earth_params.breathAmplMax);
        earth_circles.push(circle);
    }
}
function earth_generate_Ps() {
    while (particles.length < params_basic.PARTICLE_NUMBER) {
        let random_circle = Math.floor(Math.random() * earth_circles.length);
        earth_circles[random_circle].addParticles();
    }
}
function earth_update_circles() {
    for (let i = 0; i < earth_circles.length; i++) {
        let circle = earth_circles[i];
        circle.breath();
        circle.update_pos();
        circle.set_breath_FreqAmpl(earth_params.breathFreq, earth_params.breathAmplMin, earth_params.breathAmplMax);
    }
}
function earth_update_Ps() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.wave();
        p.move();
        p.age();
        p.update_opacity();
        p.remove();
    }
}


// ======================= THUNDER =========================
function thunder_setup_thunders() {
    add_Lightning(1);
}
function thunder_generate_Ps() {
    add_Lightning(0.01);
    if (particles.length < params_basic.PARTICLE_NUMBER) {
        for (const thunder of thunder_thunders) {
            let noiseFreq = 0.05;
            let noiseRange = 10;
            let noiseValueX = noise(thunder.pos.x * noiseFreq, frame * noiseFreq);
            let noiseValueY = noise(thunder.pos.y * noiseFreq, frame * noiseFreq);
            let adjX = map(noiseValueX, 0, 1, -noiseRange, noiseRange);
            let adjY = map(noiseValueY, 0, 1, -noiseRange, noiseRange);
            let adj_x = random(-thunder_params.thickness, thunder_params.thickness);
            let adj_y = random(-thunder_params.thickness, thunder_params.thickness);
            let p = new ThunderParticle()
                .set_pos(thunder.pos.x + adjX + adj_x, thunder.pos.y + adjY + adj_y)
                .set_lifeReduction(thunder_params.lifeReductionMin, thunder_params.lifeReductionMax)
                .set_lifeSpan(thunder_params.particleLifeSpan)
                .set_vel(0, 0);
            particles.push(p);
        }
    }
}
function thunder_update_thunders() {
    for (let i = 0; i < thunder_thunders.length; i++) {
        let thunder = thunder_thunders[i];
        thunder.move();
        thunder.age();
        thunder.check_boundary();
        thunder.remove();
        thunder.changeAngle(thunder_params.anglePossibility);
        add_Branch(thunder, thunder_params.branchPossibility);
    }
}
function thunder_update_Ps() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.flow(thunder_params.flowSpd); //*** */
        p.move();
        p.age();
        p.check_boundary();
        p.update_opacity();
        p.remove();
    }
}
function add_Lightning(possibility) {
    if (random(1) < possibility) {
        thunder_thunders.push(
            new Thunder()
                .set_pos(random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2), random(-params_basic.WORLD_HEIGHT / 2, params_basic.WORLD_HEIGHT / 2), 0)
                .set_vel(random(-1, 1), random(-1, 1))
                .set_lifespan(thunder_params.thunderLifespan)
                .set_spd(random(thunder_params.moveSpdMin, thunder_params.moveSpdMax))
                .set_lifeReduction(random(0.001, 0.01))
        )
        // console.log(thunder_params.moveSpdMin, thunder_params.moveSpdMax);
    }
}
function add_Branch(thunder, possibility) {
    if (random(1) < (thunder.depth * possibility)) {
        let newThunder = new Thunder()
            .set_pos(thunder.pos.x, thunder.pos.y, thunder.pos.z)
            .set_vel(thunder.vel.x, thunder.vel.y, thunder.vel.z)
            .set_lifespan(thunder_params.thunderLifespan)
            .set_spd(random(thunder_params.moveSpdMin, thunder_params.moveSpdMax))
            .set_lifeReduction(random(0.001, 0.01))
            .reduce_depth(random(0.5))
        newThunder.adjust_age(random(0.5));
        newThunder.rotate(radians(random(-thunder_params.BranchAngleRange, thunder_params.BranchAngleRange)));
        thunder_thunders.push(newThunder);
        thunder.changeAngle(thunder_params.anglePossibility * 10);
        thunder.adjust_age(random(0.5));
        thunder.reduce_depth(random(0.5));
    }
}

// ======================== FIRE ==========================
function fire_setup_Ps() {
    while (particles.length < params_basic.PARTICLE_NUMBER) {
        generate_new_particle();
    }
}
function fire_generate_Ps() {
    while (particles.length < params_basic.PARTICLE_NUMBER) {
        if (random() < fire_params.proportion) {
            generate_new_particle();
        }
        else {
            add_upper_points();
        }
    }
}
function generate_new_particle() {
    let x = random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2);
    // let powFactor = 5;
    let powFactor = fire_params.distributionFactor;
    let distributionFreq = fire_params.distributionFreq;
    let noiseFreq = x * distributionFreq + frame * 0.005;
    let noiseValue = noise(noiseFreq);
    let threshold = map(pow(noiseValue, powFactor), 0, 1, 0, 1);
    let lifeReduction = map(noise(noiseFreq), 0, 1, 0.007, 0.001);
    let moveUp = map(noiseValue, 0, 1, 0, 1);
    if (random(1) < threshold) {
        let p = new FireParticle()
            .set_pos(x, 0 - params_basic.WORLD_HEIGHT / 2, 0)
            .set_lifeReduction(lifeReduction)
            .set_move_up(moveUp)
            .set_forceScl(noiseValue);
        particles.push(p);
    }
}
function fire_update_Ps() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.flow();
        p.moveup();
        p.move();
        p.apply_outsideForce(1);
        p.update_opacity(fire_params.opacityAdj);
        p.age();
        if (p.isDone || p.pos.y > params_basic.WORLD_HEIGHT / 2) {
            particles.splice(i, 1);
            i--; // not flipped version
        }
    }
}
function add_upper_points() {
    let distributionFreq = 0.01;
    let x = random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2);
    let y = random(-params_basic.WORLD_HEIGHT / 2, params_basic.WORLD_HEIGHT / 2);
    let xFreq = (x + 1000) * distributionFreq + sin(frame * 0.005);
    // let xFreq = x * distributionFreq + frame * 0.005;
    let yFreq = y * distributionFreq - frame * 0.005;
    let noiseValue = noise(xFreq, yFreq);
    let lifeReduction = map(noiseValue, 0, 1, fire_params.lifeReductionMin, fire_params.lifeReductionMax);
    let moveUp = map(noiseValue, 0, 1, 0, 1);
    if ((noiseValue > fire_params.areaSize)) {
        let p = new FireParticle()
            .set_pos(x, y, 0)
            .set_lifeReduction(lifeReduction)
            .set_move_up(moveUp)
            .set_forceScl(noiseValue);
        particles.push(p);
    }
}



// ======================== LAKE ==========================

function lake_set_waves() {
    if (lake_WavePos.length > 0) {
        lake_WavePos = [];
        lake_waves = []
    }
    for (let i = 0; i < lake_params.WaveNum; i++) { // Wvel, XoffsetAmp = 200, sinForFreqAmp = 0.005, sinForAmp_amp = 100)
        let sign = Math.random() < 0.5 ? -1 : 1;
        let Wvel = sign * random(0.8, 1.2); // * frameCount // big = fast
        let XoffsetAmp = random(100, 600);
        let timeOffset = floor(random(200));
        let sinForFreq_amp = random(0.7, 1.3);
        let sinForAmp_amp = random(0.7, 1.3);
        lake_WaveAttri.push([Wvel, XoffsetAmp, timeOffset, sinForFreq_amp, sinForAmp_amp]);
        WposX = 0;
        WposY = random(-params_basic.WORLD_HEIGHT / 4, params_basic.WORLD_HEIGHT / 4);
        WposZ = random(-params_basic.WORLD_DEPTH / 5, params_basic.WORLD_DEPTH / 5);
        lake_WavePos.push([WposX, WposY, WposZ]);
    }
    for (let i = 0; i < lake_params.WaveNum; i++) {
        let wave = new LakeWave(...lake_WaveAttri[i]).setPos(...lake_WavePos[i]);
        lake_waves.push(wave);
    }
}


function lake_generate_Ps() {
    while (particles.length < params_basic.PARTICLE_NUMBER) {
        let random_wave = Math.floor(Math.random() * lake_waves.length);
        lake_waves[random_wave].addNewParticle();
    }
}

function lake_update_Ps() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.flow();
        p.move();
        p.age();
        p.update_opacity();
        if (p.isDone) {
            particles.splice(i, 1);
            i--;
        }
    }
}


// ======================= HEAVEN =========================



// ======================== WIND ==========================









// ========================================================
function setupFastSinCos() {
    for (let i = 0; i < sinCosResolution; i++) {
        let deg = map(i, 0, sinCosResolution, 0, 360);
        let rad = radians(deg);
        sinArray.push(sin(rad));
        cosArray.push(cos(rad));
    }
}

function mSin(rad) {
    let angle = rad % TWO_PI;
    if (angle < 0) angle += TWO_PI;
    let index = floor(map(angle, 0, TWO_PI, 0, sinCosResolution));
    return sinArray[index];
}

function mCos(rad) {
    let angle = rad % TWO_PI;
    if (angle < 0) angle += TWO_PI;
    let index = floor(map(angle, 0, TWO_PI, 0, sinCosResolution));
    return cosArray[index];
}

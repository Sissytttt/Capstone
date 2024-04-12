function setup_Ps() {
    while (particles.length < params_basic.MAX_PARTICLE_NUMBER) {
        let particle = new ParticleBasic()
            .set_pos(random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2), random(-params_basic.WORLD_HEIGHT / 2, params_basic.WORLD_HEIGHT / 2), random(-params_basic.WORLD_DEPTH / 2, params_basic.WORLD_DEPTH / 2))
            .set_lifeReduction(0.1, 0.01);
        particles.push(particle);
    }
}
function particles_disappear() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.age();
        p.remove();
    }
}

// ------- Water -------
function water_generate_Ps() {
    while (particles.length < params_basic.MAX_PARTICLE_NUMBER) {
        let random_line = Math.floor(Math.random() * Lines.length);
        Lines[random_line].add_NewParticle();
    }
}
function water_update_Ps() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.flow(water.MoveSpd);
        p.move();
        p.age();
        if (p.isDone) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function setup_water_lines() {
    if (LinePos.length > 0 || Lines.length > 0) {
        LinePos = [];
        Lines = [];
    }

    for (let i = 0; i < water.Line_Num; i++) {
        posX = random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2);
        posY = 0;
        posZ = random(-params_basic.WORLD_DEPTH / 2, params_basic.WORLD_DEPTH / 2);
        LinePos.push([posX, posY, posZ]);
    }

    for (let i = 0; i < water.Line_Num; i++) {
        let line = new WaterLineClass()
            .set_pos(...LinePos[i])
            .set_spd((random() < 0.5 ? 1 : -1) * water.ChangeSpeed * random(-0.7, 1.3));
        Lines.push(line);
    }
}

// ----- Mountain -----
function mountain_generate_Ps() { }
function mountain_update_Ps() { }

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

        this.color = {
            r: 255,
            g: 255,
            b: 255
        };
    }
    set_pos(x, y, z) {
        this.pos = createVector(x, y, z);
        return this;
    }
    set_vel(x, y, z) {
        this.vel = createVector(x, y, z);
        return this;
    }
    set_color(r, g, b) { // ?
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
        return this;
    }
    set_scl(w, h = w, d = w) { // ?
        const minScale = 0.01;
        if (w < minScale) w = minScale;
        if (h < minScale) h = minScale;
        if (d < minScale) d = minScale;
        this.scl = createVector(w, h, d);
        this.mass = this.scl.x * this.scl.y * this.scl.z;
        return this;
    }
    set_lifeReduction(min, max) {
        this.lifeReduction = random(min, max);
        return this;
    }
    set_lifeSpan(lifeSpan) {
        this.lifeSpan = lifeSpan;
        return this;
    }
    move() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
    apply_force(f) {
        let force = f.copy();
        force.div(this.mass);
        this.acc.add(force);
    }
    age() {
        this.lifespan -= this.lifeReduction;
        if (this.lifespan <= 0) {
            this.lifespan = 0;
            this.isDone = true;
        }
    }
    remove() {
        if (this.isDone) {
            let index = particles.indexOf(this);
            if (index > -1) {
                particles.splice(index, 1);
            }
        }
    }
    flow(spd) { // some might need to overwrite
        let posFreq = water.FlowPosFreq;
        let timeFreq = water.FlowTimeFreq;
        let xFreq = this.pos.x * posFreq + frame * timeFreq;
        let yFreq = this.pos.y * posFreq + frame * timeFreq;
        let zFreq = this.pos.z * posFreq + frame * timeFreq;
        let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
        let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
        let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1.0, 1.0);
        let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
        force.normalize();
        force.mult(spd);
        this.apply_force(force);
    }
    disappear() { // when PLAY_VISUALIZATION == false, everything disappear

    }
    check_boundary() { // check canvas boundary
        // if (this.pos.x > params_basic.W)
    }

}


// ---------- Water ---------- 
class WaterParticle extends ParticleBasic {
    constructor() {
        super();
        // particles.push(this);
    }
}

class WaterLineClass {
    constructor() {
        this.pos = createVector();
        this.moveDirection = random()
        return this;
    }
    set_pos(x, y, z) {
        this.pos = createVector(x, y, z);
        return this;
    }
    set_spd(spd) {
        this.spd = spd;
        return this;
    }
    add_NewParticle() {
        let p_posy = random(-params_basic.WORLD_DEPTH / 2, params_basic.WORLD_HEIGHT / 2);
        let xFreq = this.pos.x * water.BendDifference
        let yFreq = p_posy * water.BendLength + frame * this.spd;
        let noiseWave = map(noise(yFreq, xFreq), 0, 1, - water.BendMagnitude, water.BendMagnitude); // 弯曲的变换
        let noiseValue = noise(yFreq, this.pos.x)
        let noiseBrightness;
        if (noiseValue < 0.2) {
            noiseBrightness = map(noiseValue, 0, 0.2, 0, 0.01) * water.Brightness2;
        }
        else if (noiseValue < 0.5) {
            noiseBrightness = map(noiseValue, 0.2, 0.5, 0, 0.05) * water.Brightness2;
        }
        else if (noiseValue < 0.7) {
            noiseBrightness = map(noiseValue, 0.5, 0.7, 0.05, 2) * water.Brightness;
        }
        else if (noiseValue < 1) {
            noiseBrightness = map(noiseValue, 0.7, 1, 1, 255) * water.Brightness;
        }

        let particle = new WaterParticle()
            .set_pos(this.pos.x + noiseWave, p_posy, this.pos.z)
            .set_color(noiseBrightness, noiseBrightness, noiseBrightness)
            .set_lifeReduction(water.lifeReductionMin, water.lifeReductionMax)
        particles.push(particle);

    }
}





/*

// ---------- Fire ---------- 
class FireParticle extends ParticleBasic {
    constructor() { }

    set_move_up() { }
    moveup() { }
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

*/


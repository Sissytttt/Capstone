
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
    age(lifeReduction = this.lifeReduction) {
        this.lifespan -= lifeReduction;
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
    flow(posFreq = 0.005, timeFreq = 0.005, spd = 0.01) { // some might need to overwrite
        let xFreq = this.pos.x * posFreq + frame * timeFreq;
        let yFreq = this.pos.y * posFreq + frame * timeFreq;
        let zFreq = this.pos.z * posFreq + frame * timeFreq;
        let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1, 1);
        let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -1, 1);
        let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1, 1);
        let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
        force.normalize();
        force.mult(spd);
        this.apply_force(force);
    }
    disappear() { // when PLAY_VISUALIZATION == false, everything disappear
        this.set_lifeReduction(0.05, 0.000001);
        this.age();
        this.flow();
        this.move();
        this.check_boundary();
        this.remove();
    }
    check_boundary() { // check canvas boundary
        // if (this.pos.x > params_basic.W)
        if (this.pos.x < - params_basic.WORLD_WIDTH / 2
            || this.pos.x > params_basic.WORLD_WIDTH / 2
            || this.pos.y < -params_basic.WORLD_HEIGHT / 2
            || this.pos.y > params_basic.WORLD_HEIGHT / 2
            || this.pos.z < -params_basic.WORLD_DEPTH / 2
            || this.pos.z > params_basic.WORLD_DEPTH / 2
        ) {
            this.isDone = true;
        }
    }

}


// ======================== WATER ==========================
class WaterParticle extends ParticleBasic {
    constructor() {
        super();
        // particles.push(this);
    }
    flow(posFreq = 0.05, timeFreq = 0.05, spd = 0.05) { //overwrite
        let xFreq = this.pos.x * posFreq + frame * timeFreq;
        let yFreq = this.pos.y * posFreq + frame * timeFreq;
        let zFreq = this.pos.z * posFreq + frame * timeFreq;
        let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -water_params.sideForce, water_params.sideForce);
        let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, -10, 10);
        let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1, 1);
        let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
        force.normalize();
        force.mult(spd);
        this.apply_force(force);
    }
}

class WaterLine {
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
        let p_posy = random(-params_basic.WORLD_HEIGHT / 2, params_basic.WORLD_HEIGHT / 2);
        let xFreq = this.pos.x * water_params.BendDifference
        let yFreq = p_posy * water_params.BendLength + frame * this.spd;
        let noiseWave = map(noise(yFreq, xFreq), 0, 1, - water_params.BendMagnitude, water_params.BendMagnitude); // 弯曲的变换
        let noiseValue = noise(yFreq, this.pos.x)
        let noiseBrightness;
        if (noiseValue < 0.2) {
            noiseBrightness = map(noiseValue, 0, 0.2, 0, 0.01) * water_params.Brightness2;
        }
        else if (noiseValue < 0.5) {
            noiseBrightness = map(noiseValue, 0.2, 0.5, 0, 0.05) * water_params.Brightness2;
        }
        else if (noiseValue < 0.7) {
            noiseBrightness = map(noiseValue, 0.5, 0.7, 0.05, 2) * water_params.Brightness;
        }
        else if (noiseValue < 1) {
            noiseBrightness = map(noiseValue, 0.7, 1, 1, 255) * water_params.Brightness;
        }

        let particle = new WaterParticle()
            .set_pos(this.pos.x + noiseWave, p_posy, this.pos.z)
            .set_color(noiseBrightness, noiseBrightness, noiseBrightness)
            .set_lifeReduction(water_params.lifeReductionMin, water_params.lifeReductionMax)
        particles.push(particle);

    }
}

// ======================= MOUNTAIN =========================
class MountainParticle extends ParticleBasic {
    constructor() {
        super();
        this.forceScl = 1;
    }
    move_down(v) {
        let moveFreqX = (-params_basic.WORLD_WIDTH + this.pos.x) * mountain_params.noisePosXFreq; // 整体 move downward
        let moveFreqY = (-params_basic.WORLD_HEIGHT + this.pos.y) * mountain_params.noisePosXFreq + frame * 0.01;
        let moveNoise = noise(moveFreqX, moveFreqY);
        let moveAdj;
        if (moveNoise < 0.4) {
            moveAdj = map(moveNoise, 0, 0.4, 0, 0.7);
        }
        else {
            moveAdj = map(moveNoise, 0.4, 1, 0.7, 1.2);
        }
        let velFreqX = (-params_basic.WORLD_WIDTH + this.pos.x + 1000) * 0.005; // each partile move downward
        let velFreqY = (-params_basic.WORLD_HEIGHT + this.pos.y + 1000) * 0.008 + moveAdj;
        let velNoise = noise(velFreqX, velFreqY);
        let vel;
        if (velNoise < mountain_params.rangeThreshold1) {
            vel = map(velNoise, 0, mountain_params.rangeThreshold1, 0 * v, 0.007 * v);
            this.forceScl = map(velNoise, 0, mountain_params.rangeThreshold1, 0, 0.007);
        }
        else if (velNoise < mountain_params.rangeThreshold2) {
            vel = map(velNoise, mountain_params.rangeThreshold1, mountain_params.rangeThreshold2, 0.01 * v, 0.2 * v);
            this.forceScl = map(velNoise, mountain_params.rangeThreshold1, mountain_params.rangeThreshold2, 0.01, 0.1);
        }
        else if (velNoise < mountain_params.rangeThreshold3) {
            vel = map(velNoise, mountain_params.rangeThreshold2, mountain_params.rangeThreshold3, 0.2 * v, 0.5 * v);
            this.forceScl = map(velNoise, mountain_params.rangeThreshold2, mountain_params.rangeThreshold3, 0.1, 0.3);
        }
        else {
            vel = map(velNoise, mountain_params.rangeThreshold3, 1, 0.5 * v, 1 * v);
            this.forceScl = map(velNoise, mountain_params.rangeThreshold3, 1, 0.3, 1);
        }
        this.vel.y = -vel;
    }
    apply_outsideForce(scl) {
        let forceY = 0;
        if (control.ForceY > 3) {
            forceY = map(control.ForceY, 3, 5, 100, 300);
        }
        let force = createVector(control.ForceX * this.forceScl, forceY * this.forceScl);
        force.mult(scl * 0.05);
        this.apply_force(force);
    }
}




// ======================== EARTH ==========================

class EarthParticle extends ParticleBasic {
    constructor() {
        super();
        this.angle = 0;
        this.rad = 0;
        this.moveRange = 0;
        // particles.push(this);
    }
    set_angle(angle) {
        this.angle = angle;
        return this;
    }
    set_rad(rad) {
        this.rad = rad;
        return this;
    }
    set_moveRange(val) {
        this.moveRange = val;
        return this;
    }
    wave() {
        let angleFreq = this.angle;
        let radFreq = this.rad * earth_params.WaveRadFreq;
        let frameFreq = frame * earth_params.WaveFrameFreq;
        let noiseVal = noise(angleFreq, radFreq, frameFreq);
        let yPos = 0;
        if (noiseVal > earth_params.moveThreshold) {
            yPos = map(noiseVal, earth_params.moveThreshold, 1, 0, this.moveRange);
        }
        this.pos.y = yPos;
    }
}

class Circle {
    constructor() {
        this.pos = createVector();
    }
    set_pos(x, y, z) {
        this.pos = createVector(x, y, z);
        return this;
    }
    update_pos() {
        let noiseVal = noise(this.pos.x * earth_params.WaveAngleFreq, this.pos.z * earth_params.WaveAngleFreq, frame * earth_params.WaveAngleFreq);
        let yPos = map(noiseVal, 0, 1, -150, 150)
        this.pos.y = yPos;
    }
    set_size(r) {
        this.radians = r;
        this.updatedR = this.radians;
        return this;
    }
    set_rAdj(rAdj) { // outer distance toward the base rad // remember for calculating breath ampl
        this.rAdj = rAdj;
        return this;
    }
    set_breath_FreqAmpl(freq, min, max) {
        let breathAmp = map(this.rAdj, 0, earth_params.sizeMax - earth_params.sizeMin, min, max);
        this.breathFreq = freq;
        this.breathAmpl = breathAmp;
        return this;
    }
    breath() { // update R
        this.updatedR = this.radians + mSin(frame * this.breathFreq) * this.breathAmpl;
    }
    addParticles() {
        let randomAngle = random(2 * PI);
        let randomPosX = mSin(randomAngle) * this.updatedR;
        let randomPosZ = mCos(randomAngle) * this.updatedR;
        let moveRange = map(this.radians, earth_params.sizeMin, earth_params.sizeMax, earth_params.moveRangeMin, earth_params.moveRangeMin);
        let particle = new EarthParticle()
            .set_pos(this.pos.x + randomPosX, this.pos.y, this.pos.z + randomPosZ)
            .set_lifeReduction(earth_params.lifeReductionMin, earth_params.lifeReductionMax)
            .set_angle(randomAngle)
            .set_rad(this.radians) // 粒子所在的相对大圆的角度位置，用于之后flow的noise的参数（连贯数值）
            .set_moveRange(moveRange);
        particles.push(particle);
    }
}


// ======================= THUNDER =========================

class ThunderParticle extends ParticleBasic {
    constructor() {
        super();
    }
}
class Thunder {
    constructor() {
        this.pos = createVector();
        this.vel = createVector();
        this.lifespan = 1;
        this.lifeReduction = random(0.004, 0.005);
        this.isDone = false;
        this.depth = 1;
    }
    set_pos(x, y, z = 0) {
        this.pos = createVector(x, y, z);
        return this;
    }
    set_vel(x, y, z = 0) {
        this.vel = createVector(x, y, z);
        return this;
    }
    set_lifeReduction(val) {
        this.lifeReduction = val;
        return this;
    }
    set_spd(spd) {
        this.vel.normalize();
        this.vel.mult(spd);
        return this;
    }
    set_lifespan(val) {
        this.lifespan = val;
        return this;
    }
    reduce_depth(val) {
        this.depth -= val;
        if (this.depth <= 0) {
            this.depth = 0;
            this.isDone = true;
        }
        return this;
    }
    age() {
        this.lifespan -= this.lifeReduction;
        if (this.lifespan <= 0) {
            this.lifespan = 0;
            this.isDone = true;
        }
    }
    adjust_age(val) {
        this.lifespan -= val;
    }
    changeAngle(possibility) {
        if (random(1) < possibility) {
            let angle = radians(random(-thunder_params.AngleRange, thunder_params.AngleRange));
            this.vel.rotate(angle);
        }
    }
    rotate(angle) {
        this.vel.rotate(angle);
    }
    move() {
        this.pos.add(this.vel);
    }
    check_boundary() { // check canvas boundary
        // if (this.pos.x > params_basic.W)
        if (this.pos.x < - params_basic.WORLD_WIDTH / 2
            || this.pos.x > params_basic.WORLD_WIDTH / 2
            || this.pos.y < -params_basic.WORLD_HEIGHT / 2
            || this.pos.y > params_basic.WORLD_HEIGHT / 2
            || this.pos.z < -params_basic.WORLD_DEPTH / 2
            || this.pos.z > params_basic.WORLD_DEPTH / 2
        ) {
            this.isDone = true;
        }
    }
    remove() {
        if (this.isDone) {
            let index = thunder_thunders.indexOf(this);
            if (index > -1) {
                thunder_thunders.splice(index, 1);
            }
        }
    }

}

// ======================== FIRE ==========================
class FireParticle extends ParticleBasic {
    constructor() {
        super();
    }

    set_move_up() { }
    moveup() { }
}


// ======================== LAKE ==========================



// ======================= HEAVEN =========================



// ======================== WIND ==========================




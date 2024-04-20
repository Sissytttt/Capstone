
class ParticleBasic {
    constructor() {
        this.isBasic = true;
        this.pos = createVector();
        this.vel = createVector();
        this.acc = createVector();

        this.scl = createVector(1, 1, 1);
        this.mass = this.scl.x * this.scl.y * this.scl.z;
        this.color = { r: 255, g: 255, b: 255 }; // ?
        this.opacity = 1;
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
    update_opacity() {
        this.opacity = this.lifespan;
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
        this.isBasic = false;
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
        this.isBasic = false;
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
        this.isBasic = false;
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
        this.isBasic = false;
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
        this.isBasic = false;
    }
    set_lifeReduction(val) { // overwrite
        this.lifeReduction = val;
        return this;
    }
    set_move_up(val) {
        this.moveUp = val;
        return this;
    }
    set_forceScl(val) {
        this.forceScl = val;
        return this;
    }
    moveup() {
        let forceUp = new p5.Vector(0, 1, 0);
        forceUp.mult(0.01);
        forceUp.mult(this.moveUp * fire_params.moveupSpd)
        this.apply_force(forceUp);
    }
    update_opacity(range) {
        if (this.lifespan < range) {
            let xFreq = this.pos.x * 0.003 + frame * 0.05;
            let yFreq = this.pos.y * 0.003 + frame * 0.05;
            let zFreq = this.pos.z * 0.005 + frame * 0.05;
            let opcacityReduction = noise(xFreq, yFreq, zFreq);
            this.opacity -= opcacityReduction;
        }
        else {
            this.opacity = this.lifespan;
        }
    }
    flow() {
        let xFreq = this.pos.x * 0.03 + frame * 0.05;
        let yFreq = this.pos.y * 0.05 + frame * 0.05;
        let zFreq = this.pos.z * 0.05 + frame * 0.05;
        let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -fire_params.flowForceX, fire_params.flowForceX);
        let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, - fire_params.flowForceY, fire_params.flowForceY);
        let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -fire_params.flowForceZ, fire_params.flowForceZ);
        let force = new p5.Vector(noiseValue1, noiseValue2, noiseValue3);
        force.normalize();
        force.mult(fire_params.flowSpd);
        this.apply_force(force);
    }
    apply_outsideForce(scl) {
        let force = createVector(control.ForceX * this.forceScl, 0);
        let scale = 0;
        if (this.forceScl > 0.5) {
            scale = map(this.forceScl, 0.5, 1, 0, 1);
            force.mult(scl * 0.005 * scale);
            this.apply_force(force);
        }
    }

}


// ======================== LAKE ==========================
class LakeParticle extends ParticleBasic {
    constructor() {
        super();
        this.isBasic = false;
    }
    set_movingDir(val) {
        this.moveingDir = val;
        return this;
    }
    flow() {
        let xFreq = this.pos.x * 0.005 + frame * 0.005;
        let yFreq = this.pos.y * 0.005 + frame * 0.005;
        let zFreq = this.pos.z * 0.005 + frame * 0.005;
        let noiseValue1 = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1, 1);
        let noiseValue2 = map(noise(xFreq + 1000, yFreq + 1000, zFreq + 1000), 0.0, 1.0, 0, 1);
        let noiseValue3 = map(noise(xFreq + 2000, yFreq + 2000, zFreq + 2000), 0.0, 1.0, -1, 1);
        let force = new p5.Vector(noiseValue1, noiseValue2 * this.moveingDir, noiseValue3);
        force.normalize();
        force.mult(0.005);
        this.apply_force(force);
    }
}

class LakeWave {
    constructor(Wvel, XoffsetAmp = 200, timeOffset, sinForFreqAmp = 0.005, sinForAmp_amp = 100) {
        this.vel = Wvel; // * frameCount // big = fast
        this.Xoffset = XoffsetAmp;
        this.timeOffset = timeOffset;
        this.amp_freqSin = sinForFreqAmp;
        this.AmpSin = sinForAmp_amp;
        return this;
    }

    setPos(x, y, z) {
        this.pos = createVector(x, y, z);
        return this;
    }

    addNewParticle() {
        let p_posx = random(-params_basic.WORLD_WIDTH / 2, params_basic.WORLD_WIDTH / 2);
        let freq = frame * 0.01 + this.timeOffset;
        // let sinXoffset = sin(freq) * 100 - 800;
        // let sinForFreq = sin(freq) * 0.003;
        // let ampl = noise(freq) * 300;
        let sinXoffset = (mSin(freq) + noise(freq + this.Xoffset)) * this.Xoffset - params_basic.WORLD_WIDTH / 2;
        let sinForFreq = mSin(freq) * this.amp_freqSin * lake_params.WampFreqSin;
        let ampl = noise(freq) * this.AmpSin * lake_params.Wamplitude;
        let mainSineFreq = (p_posx + sinXoffset) * sinForFreq;
        let sinValue = mSin(mainSineFreq) * ampl;
        let particle = new LakeParticle()
            .set_pos(p_posx, (this.pos.y * lake_params.WposScatter) + sinValue, this.pos.z)
            .set_movingDir(sinValue)
            .set_lifeReduction(lake_params.lifeReductionMin, lake_params.lifeReductionMax)
            .set_vel(this.vel * lake_params.Wvel);
        particles.push(particle);
    }
}

// ======================= HEAVEN =========================



// ======================== WIND ==========================




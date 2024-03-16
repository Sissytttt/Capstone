// Copyright (c) 2018-2023 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// ------------------- Notes ----------------------
// ------- Changes -------
// 1. Organized the code
//    merget the two classes and arrays of "node" & "simple_node" 

// ------- Problem -------
// 1. The space visualization is not working well, not sure why, but it is worse than the first version
// 2. for calculating the place, not sure should I also just use the upper body parts (arms) for the calculation, or just keep what I have for now (distance between two wrists and ankles.)

// ------- TODO -------
// 1. visualize flow
// 2. smooth the data

// ------ Reminder ------
// 1. need calibration when mapping the values

// ------------------------------------------------



let video;
let width = 640, height = 480;
let bodypose;
let bodyPoints_info = {  // the points I want to get form the pose array, with info about their type and mass
  "nose": { "type": "node", "mass": 2 },        // type "node" are those I'm going to calculate their vel, acc, jer
  "left_shoulder": { "type": "node", "mass": 3 },
  "right_shoulder": { "type": "node", "mass": 3 },
  "left_elbow": { "type": "node", "mass": 2 },
  "right_elbow": { "type": "node", "mass": 2 },
  "left_wrist": { "type": "node", "mass": 1 },
  "right_wrist": { "type": "node", "mass": 1 },
  "left_hip": { "type": "simple", "mass": 3 },   // type "simple" are those I only need to get their pos and score
  "right_hip": { "type": "simple", "mass": 3 },
  "right_foot_index": { "type": "simple", "mass": 2 },
  "left_foot_index": { "type": "simple", "mass": 2 },
  "torso": { "type": "simple_needCal", "mass": 4 }, // I only need the position, but I can't directly get it from the pose array; instead, I need to calculate it.
};
let keypoints = {}; // "name": Node instance

// pose array get from ml5
let poses = [];
let prev_poses = [];

let WEIGHT, SPACE, TIME, FLOW;
let MAPD_WEIGHT, MAPD_SPACE, MAPD_TIME, MAPD_FLOW; // mapped value; mapping them to (0, 10)
let MAX_ACC_BODYPART; // body part that has max ACC value

// use for mapping the values; need calibration *** 
let max_weight = 3000;
let min_weight = 0;
let max_distance = 500000;
let min_distance = 0;
let max_time = 100;
let min_time = 0;
let max_flow = 100;
let min_flow = 0;

function preload() {
  //Load the bodypose model.
  bodypose = ml5.bodypose("BlazePose");
}

function setup() {
  createCanvas(640, 480);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Start detecting poses in the webcam video
  bodypose.detectStart(video, gotPoses);

  // Setup keypoints object
  for (const point in bodyPoints_info) {
    keypoints[point] = new Node(point);
  }
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // setup nodes
  if (poses.length >= 1) {
    let pose = poses[0];
    setKeypointsPos(pose);
    setTorsoPos();
    display(keypoints);
  }

  calcVals();
  visSpace(0, 200);
  visTime(30, 50);
  visWeight(0, height);

  // print to see the value when doing the calibration
  // console.log("WEIGHT", WEIGHT);
  // console.log("SPACE", SPACE);
  // console.log("TIME", TIME);
  // console.log("FLOW", FLOW);
}


// Callback function for when bodypose outputs data
function gotPoses(results) {
  prev_poses = poses;
  poses = results;
}


// -------------- setup keypoints object -----------------
function setKeypointsPos(pose_array) {
  for (let i = 0; i < pose_array.keypoints.length; i++) {
    let point = pose_array.keypoints[i];
    if (point.name in keypoints && keypoints[point.name] != undefined) {
      keypoints[point.name].setPos(point.x, point.y, point.z);
      keypoints[point.name].setScore(point.score);
      if (bodyPoints_info[point.name]["type"] == "node") {
        keypoints[point.name].setMass(bodyPoints_info[point.name]["mass"]);
        keypoints[point.name].calcVel();
        keypoints[point.name].calcAcc();
        keypoints[point.name].calcJer();
        keypoints[point.name].calcEnergy();
      }
    }
  }
}

function display(keypoints_array) {
  for (const points in keypoints_array) {
    fill(0, 255, 0);
    noStroke();
    circle(keypoints_array[points].pos.x, keypoints_array[points].pos.y, 10);
  }
}

//setup simple points (torso)
function setTorsoPos() {
  if (keypoints["left_hip"] != null && keypoints["right_hip"] != null && keypoints["right_shoulder"] != null && keypoints["left_shoulder"] != null) {
    let vector1 = keypoints["left_hip"].pos;
    let vector2 = keypoints["right_hip"].pos;
    let vector3 = keypoints["right_shoulder"].pos;
    let vector4 = keypoints["left_shoulder"].pos;
    let sumX = vector1.x + vector2.x + vector3.x + vector4.x;
    let sumY = vector1.y + vector2.y + vector3.y + vector4.y;
    let sumZ = vector1.z + vector2.z + vector3.z + vector4.z;
    keypoints["torso"].setPos(sumX / 4, sumY / 4, sumZ / 4);
  }
}

// ---------------- calculation -----------------

function calcVals() {
  WEIGHT = calcWeight();
  SPACE = calcSpace();
  let timeResult = calcTime();
  TIME = timeResult.TIME;
  MAX_ACC_BODYPART = timeResult.MAX_ACC_BODYPART;
  FLOW = calcFlow();
}

function calcWeight() {
  total_energy = 0;
  total_item_num = 0;
  for (const bodypart in keypoints) {
    if (keypoints[bodypart].score > 0.75) {
      total_energy += keypoints[bodypart].energy;
      total_item_num += 1;
    }
  }
  let ave_energy = total_energy / total_item_num;
  return ave_energy;
}

function calcSpace() {
  if ("left_wrist" in keypoints && "right_wrist" in keypoints && "left_foot_index" in keypoints && "right_foot_index" in keypoints) {
    let left_wrist = keypoints["left_wrist"];
    let right_wrist = keypoints["right_wrist"];
    let left_foot = keypoints["left_foot_index"];
    let right_foot = keypoints["right_foot_index"];

    let dist1 = left_wrist.pos.dist(right_foot.pos);
    let dist2 = right_wrist.pos.dist(left_foot.pos);
    let space = dist1 * dist2;

    return space;
  }
}

function calcTime() { // Time = max(Mass * Acc)
  let max_time = 0;
  let max_bodypart = null;
  for (const bodypart in keypoints) {
    if (keypoints[bodypart].acc.mag() !== 0) {
      let mass_mult_acc = keypoints[bodypart].mass * keypoints[bodypart].acc.mag();
      if (mass_mult_acc > max_time) {
        max_time = mass_mult_acc;
        max_bodypart = keypoints[bodypart].name;
      }
    }
  }
  return { TIME: max_time, MAX_ACC_BODYPART: max_bodypart };
}

function calcFlow() {
  let total_jerk = 0;
  for (const bodypart in keypoints) {
    if (keypoints[bodypart].jer.mag() !== 0) {
      total_jerk += keypoints[bodypart].jer.mag();
    }
  }
  return total_jerk;
}

// ------------------ map value -------------------
function mapVals() {
  MAPD_WEIGHT = mapWeight(1, 10);
  MAPD_SPACE = mapSpace(1, 10);
  MAPD_TIME = mapTime(1, 10);
  MAPD_FLOW = mapFlow(1, 10);
}

function mapWeight(min, max) {
  let mapped_weight = map(WEIGHT, min_weight, max_weight, min, max);
  return mapped_weight;
}

function mapSpace(min, max) {
  let mapped_space = map(SPACE, min_distance, max_distance, min, max);
  return mapped_space;
}

function mapTime(min, max) {
  let mapped_time = map(TIME, min_time, max_time, min, max);
  return mapped_time;
}

function mapFlow(min, max) {
  let mapped_flow = map(FLOW, min_flow, max_flow, min, max);
  return mapped_flow;
}

// -----------------Visualization------------------

function visWeight(min, max) {
  if (WEIGHT != null) {
    MAPD_WEIGHT = mapWeight(min, max);
    noStroke();
    fill(247, 184, 1);
    rect(0, height, 50, -MAPD_WEIGHT);
  }
  else {
    stroke(247, 184, 1);
    noFill();
    rect(0, height, 50, 10);
  }
}

function visSpace(min, max) {
  MAPD_SPACE = mapSpace(max, min);
  if (keypoints["torso"].pos.mag() != 0 && MAPD_SPACE != null) {
    let center = keypoints["torso"].pos;
    noStroke;
    fill(61, 52, 139);
    circle(center.x, center.y, MAPD_SPACE);
  }
}

function visTime(min, max) {
  MAPD_TIME = mapTime(min, max);
  let alpha = mapTime(100, 255);
  if (MAX_ACC_BODYPART != null) {
    let circle_pos = keypoints[MAX_ACC_BODYPART].pos;
    fill(241, 135, 1, alpha);
    circle(circle_pos.x, circle_pos.y, MAPD_TIME);
  }
}

function visFlow() {
  //
}


// --------------------- CLASS -----------------------
class Node {
  constructor(name) {
    this.name = name;

    this.isSimple = true;
    this.pos = createVector();
    this.score = 0;

    this.prev_pos = createVector();
    this.vel = createVector();
    this.prev_vel = createVector();
    this.acc = createVector();
    this.prev_acc = createVector();
    this.jer = createVector();
    this.mass = 0;
    this.energy = 0;
  }

  setScore(score) {
    this.score = score;
  }

  setMass(m) {
    this.mass = m;
  }

  setPos(x, y, z) {
    if (this.pos.mag() !== 0) {
      this.prev_pos.set(this.pos);
    }
    this.pos.set(x, y, z);
  }

  calcVel() {
    if (this.vel.mag() !== 0) {
      this.prev_vel.set(this.vel);
    }
    if (this.prev_pos.mag() !== 0) {
      this.vel.set(p5.Vector.sub(this.pos, this.prev_pos)); // dist ∝ v?
    }
  }

  calcAcc() {
    if (this.acc.mag() !== 0) {
      this.prev_acc.set(this.acc);
    }
    if (this.vel.mag() !== 0 && this.prev_vel.mag() !== 0) {
      this.acc.set(p5.Vector.sub(this.vel, this.prev_vel)); // ∝ a
    }
  }

  calcJer() {
    let dist = this.acc.dist(this.prev_acc);
    this.jer.set(p5.Vector.sub(this.acc, this.prev_acc)); // ∝ j
  }

  calcEnergy() {
    // dist ∝ v
    if (this.vel.mag() > 0) {
      this.energy = this.mass * this.vel.mag() * this.vel.mag();
    }
    else {
      this.energy = 0;
    }
    return this.energy;
  }
}


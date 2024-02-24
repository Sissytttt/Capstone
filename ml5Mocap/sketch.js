// Copyright (c) 2018-2023 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


// ------ Questions ------
// 1. z value is not obvious -- (-1, 1)?
// 2. all the calculated values are too fluctuated


// ------ Reminder ------
// 1. need calibration when mapping the values


// -------- TODO --------
// visualizating flow
// confidence 0.75 - weight average > sum
// 就上半身的点
// lerp - smooth / ave



let video;
let width = 640, height = 480;
let bodypose;
let get_points = ["nose", "left_wrist", "right_wrist", "left_foot_index", "right_foot_index"];
// let get_points = ["nose"];
let mass_arr = { nose: 3, left_wrist: 2, right_wrist: 2, left_foot_index: 4, right_foot_index: 4 };
let poses = [];
let prev_poses = [];
let keypoints = {};
let simple_keypoints = { "left_hip": null, "right_hip": null, "right_shoulder": null, "left_shoulder": null, "torso": null };
let WEIGHT, SPACE, TIME, FLOW;
let MAPD_WEIGHT, MAPD_SPACE, MAPD_TIME, MAPD_FLOW;
let MAX_ACC_BODYPART; // body part that has max ACC value



function preload() {
  //Load the bodypose model.
  bodypose = ml5.bodypose("BlazePose");
}

function setup() {
  createCanvas(width, height);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Start detecting poses in the webcam video
  bodypose.detectStart(video, gotPoses);

  // Setup keypoints object
  for (const bodypart of get_points) {
    keypoints[bodypart] = new Node(bodypart);
  }

  for (const bodypart in simple_keypoints) {
    simple_keypoints[bodypart] = new SimpleNode(bodypart);
  }
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);
  // setup nodes
  if (prev_poses.length >= 1 && poses.length >= 1) {
    let pose = poses[0];
    let prev_pose = prev_poses[0];

    setKeypointsPos(pose, prev_pose);
    setupNodes(keypoints);
    setTorsoPos();
    display(keypoints);
  }

  calcVals();
  console.log("WEIGHT", WEIGHT);
  // console.log("SPACE", SPACE);
  // console.log("TIME", TIME);
  // console.log("FLOW", FLOW);
  // console.log("MAPDWEIGHT", MAPD_WEIGHT);
  // console.log("MAPDSPACE", MAPD_SPACE);
  // console.log("MAPDTIME", MAPD_TIME);
  // console.log("MAPDFLOW", MAPD_FLOW);
  // mapVals();
  visSpace(0, 200);
  visTime(30, 50);
  visWeight(0, height);

}


// Callback function for when bodypose outputs data
function gotPoses(results) {
  prev_poses = poses;
  poses = results;
}


// --------------setup keypoints-----------------
// -------keypoints array & simple keypoints array--------
function setKeypointsPos(pose_array, prev_pose_array) {
  for (let i = 0; i < pose_array.keypoints.length; i++) {
    let point = pose_array.keypoints[i];
    if (point.name in keypoints) {
      if (point.score > 0.1) {
        keypoints[point.name].setPos(point.x, point.y, point.z);
      }
    }
    if (point.name in simple_keypoints) {
      if (point.score > 0.1) {
        simple_keypoints[point.name].setPos(point.x, point.y, point.z);
      }
    }
  }
}

//setup keypoints array
function setupNodes(keypoints_array) {
  for (const points in keypoints_array) {
    keypoints_array[points].setMass(mass_arr[points]);
    keypoints_array[points].calcVel();
    keypoints_array[points].calcAcc();
    keypoints_array[points].calcJer();
    // keypoints_array[points].display();
    keypoints_array[points].calcEnergy();
  }
  image(video, 0, 0, width, height);
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
  if (simple_keypoints["left_hip"] != null && simple_keypoints["right_hip"] != null && simple_keypoints["right_shoulder"] != null && simple_keypoints["left_shoulder"] != null) {
    let vector1 = simple_keypoints["left_hip"].pos;
    let vector2 = simple_keypoints["right_hip"].pos;
    let vector3 = simple_keypoints["right_shoulder"].pos;
    let vector4 = simple_keypoints["left_shoulder"].pos;
    let sumX = vector1.x + vector2.x + vector3.x + vector4.x;
    let sumY = vector1.y + vector2.y + vector3.y + vector4.y;
    let sumZ = vector1.z + vector2.z + vector3.z + vector4.z;
    simple_keypoints["torso"].setPos(sumX / 4, sumY / 4, sumZ / 4);
  }
}

// ---------------- calculation -----------------

function calcVals() {
  WEIGHT = calcWeight();
  SPACE = calcSpace();
  let timeResult = calcTime();
  TIME = timeResult.TIME;
  MAX_ACC_BODYPART = timeResult.MAX_ACC_BODYPART;
  // console.log(TIME);
  FLOW = calcFlow();
}

function calcWeight() {
  total_energy = 0;
  for (const bodypart in keypoints) {
    total_energy += keypoints[bodypart].energy;
  }
  return total_energy;
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


function calcTime() { // Time = mas(Mass * Acc)
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
  // console.log(max_bodypart);
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
  let max_weight = 40000; // need calibration ***
  let min_weight = 0;
  let mapped_weight = map(WEIGHT, min_weight, max_weight, min, max);
  return mapped_weight;
}

function mapSpace(min, max) {
  let max_distance = 500000; // need calibration ***
  let min_distance = 0;
  let mapped_space = map(SPACE, min_distance, max_distance, min, max);
  return mapped_space;
}

function mapTime(min, max) {
  let max_time = 100; // need calibration ***
  let min_time = 0;
  let mapped_time = map(TIME, min_time, max_time, min, max);
  return mapped_time;
}

function mapFlow(min, max) {
  let max_flow = 100; // need calibration ***
  let min_flow = 0;
  let mapped_flow = map(FLOW, min_flow, max_flow, min, max);
  return mapped_flow;
}

// -----------------Visualization------------------
// color palette: Blue(61, 52, 139); Purple(118, 120, 237); Yellow(247, 184, 1); Orange(241, 135, 1); Red(243, 91, 4)
// TODO: 可以在visualization 里面call map，把visualization要用的参数穿进去 -- 比如vis time（acc）可以map成颜色alpha值（0-255）

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

// Visualizing Space -- a circle centered at torso
function visSpace(min, max) {
  MAPD_SPACE = mapSpace(min, max);
  if (simple_keypoints["torso"].pos.mag() != 0 && MAPD_SPACE != null) {
    let center = simple_keypoints["torso"].pos;
    stroke(61, 52, 139);
    fill(61, 52, 139);
    // noFill;
    circle(center.x, center.y, MAPD_SPACE);
  }
}

function visTime(min, max) {
  MAPD_TIME = mapTime(min, max);
  let alpha = mapTime(100, 255);
  if (MAX_ACC_BODYPART != null) {
    console.log(MAX_ACC_BODYPART);
    // console.log(TIME);
    let circle_pos = keypoints[MAX_ACC_BODYPART].pos;
    // console.log(circle_pos.toString());
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
    this.pos = createVector();
    this.prev_pos = createVector();
    this.vel = createVector();
    this.prev_vel = createVector();
    this.acc = createVector();
    this.prev_acc = createVector();
    this.jer = createVector();

    this.mass = 0;
    this.energy = 0;
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


// ------for points only need to get position------
class SimpleNode {
  constructor(name) {
    this.name = name;
    this.pos = createVector();
  }

  setPos(x, y, z) {
    this.pos.set(x, y, z);
  }
}


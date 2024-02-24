/*
Thomas Sanchez Lengeling.
 http://codigogenerativo.com/
 
 KinectPV2, Kinect for Windows v2 library for processing
 
 3D Skeleton.
 Some features a not implemented, such as orientation
 */

import KinectPV2.KJoint;
import KinectPV2.*;
import oscP5.*;
import netP5.*;

KinectPV2 kinect;

OscP5 oscP5;
NetAddress myRemoteLocation;

boolean recording = true;
//boolean emptyLine = true;

float zVal = 300;
float rotX = PI;

Table table;

float Lhand_x = 0;
float Lhand_y = 0;
float Lhand_z = 0;

float Rhand_x = 0;
float Rhand_y = 0;
float Rhand_z = 0;

float Rfoot_x = 0;
float Rfoot_y = 0;
float Rfoot_z = 0;

float Lfoot_x = 0;
float Lfoot_y = 0;
float Lfoot_z = 0;

float PLhand_x = 0;
float PLhand_y = 0;
float PLhand_z = 0;

float PRhand_x = 0;
float PRhand_y = 0;
float PRhand_z = 0;



// ----------------------calc---------------------
float vLhand;
float vRhand;
float V_all;
String Energy;

float dist1;
float dist2;
float product;
String Space;

OscMessage M_space;
OscMessage M_energy;


void setup() {
  size(1024, 768, P3D);

  kinect = new KinectPV2(this);
  oscP5 = new OscP5(this,12000);
  
  kinect.enableColorImg(true);

  //enable 3d  with (x,y,z) position
  kinect.enableSkeleton3DMap(true);

  kinect.init();
  myRemoteLocation = new NetAddress("127.0.0.1",12000);
  
  
  //--------------table raw data setup-----------------
  table = new Table();
  table.addColumn("id");
  table.addColumn("frameCount");
 
  
  ////----------------table calc data set up ----------------
  table.addColumn("vLhand");
  table.addColumn("vRhand");
  table.addColumn("V_all");
  table.addColumn("Space");
  
}

void draw() {
  background(0);
  delay(100); // interval is 0.1s
  image(kinect.getColorImage(), 0, 0, 320, 240);

  M_space = new OscMessage("/Space");
  M_energy = new OscMessage("/Energy");
  
  
  //translate the scene to the center 
  pushMatrix();
  translate(width/2, height/2, 0);
  scale(zVal);
  rotateX(rotX);

  ArrayList<KSkeleton> skeletonArray =  kinect.getSkeleton3d();
  fill(255, 0, 0);
  //individual JOINTS
  

  if (recording == true){
  for (int i = 0; i < skeletonArray.size(); i++) {
    KSkeleton skeleton = (KSkeleton) skeletonArray.get(i);
    if (skeleton.isTracked()) {
      KJoint[] joints = skeleton.getJoints();
      //Draw body
      color col  = skeleton.getIndexColor();
      stroke(col);
      //drawBody(joints);
      PLhand_x = Lhand_x;
      PLhand_y = Lhand_y;
      PLhand_z = Lhand_z;

      PRhand_x = Rhand_x;
      PRhand_y = Rhand_y;
      PRhand_z = Rhand_z;
      
      Lhand_getCoord(joints);
      Rhand_getCoord(joints);
      Lfoot_getCoord(joints);
      Rfoot_getCoord(joints);
      
     calc();
     //save_data();
     send_data();
    }
  }
  }

  popMatrix();



  text(frameRate, 50, 50);
}


// ----------------------------hand-------------------------------
void Lhand_getCoord (KJoint[] joints) {
      Lhand_x = joints[KinectPV2.JointType_HandLeft].getX();
      Lhand_y = joints[KinectPV2.JointType_HandLeft].getY();
      Lhand_z = joints[KinectPV2.JointType_HandLeft].getZ();
      //println("Lhand", Lhand_x, Lhand_y, Lhand_z);
}

void Rhand_getCoord (KJoint[] joints) {
      Rhand_x = joints[KinectPV2.JointType_HandRight].getX();
      Rhand_y = joints[KinectPV2.JointType_HandRight].getY();
      Rhand_z = joints[KinectPV2.JointType_HandRight].getZ();
      //println("Rhand", Rhand_x, Rhand_y, Rhand_z);
}

// ----------------------------foot-------------------------------
void Lfoot_getCoord (KJoint[] joints) {
      Lfoot_x = joints[KinectPV2.JointType_FootLeft].getX();
      Lfoot_y = joints[KinectPV2.JointType_FootLeft].getY();
      Lfoot_z = joints[KinectPV2.JointType_FootLeft].getZ();
      //println("Lfoot", Lfoot_x, Lfoot_y, Lfoot_z);
}
void Rfoot_getCoord (KJoint[] joints) {
      Rfoot_x = joints[KinectPV2.JointType_FootRight].getX();
      Rfoot_y = joints[KinectPV2.JointType_FootRight].getY();
      Rfoot_z = joints[KinectPV2.JointType_FootRight].getZ();

}

void drawPoint(float x, float y, float z){
      noStroke();
      pushMatrix();
      translate(x, y, z);
      ellipse(0, 0, 70, 70);
      popMatrix();
}

void drawline(float x1, float y1, float z1, float x2, float y2, float z2){
  line(x1, y1, z1, x2, y2, z2);
}



// ----------------calculate-------------------
void calc(){
  // --------------------Energy-------------------------
  vLhand = dist(PLhand_x, PLhand_y, PLhand_z, Lhand_x, Lhand_y, Lhand_z);
  vRhand = dist(PRhand_x, PRhand_y, PRhand_z, Rhand_x, Rhand_y, Rhand_z);
  V_all = vLhand + vRhand;
  if(V_all >= 1){
    V_all = 0.99;
  }
  V_all = V_all *10;
  Energy = nf(V_all, 0, 2);
  //println("v-all", V_all);
  //println("Energy", Energy);
  
    // ----------------------Space--------------------------
  dist1 = dist(Lhand_x, Lhand_y, Lhand_z, Rfoot_x, Rfoot_y, Rfoot_z);
  dist2 = dist(Rhand_x, Rhand_y, Rhand_z, Lfoot_x, Lfoot_y, Lfoot_z);
  product = dist1*dist2;
  product = product*10;
  product = product / 4;
  if (product >= 10){
    product = 9.9;
  }
  Space = nf(product, 0, 2);
  println("Space", Space);
}


// -------------------save data ---------------------
void save_data (){
      TableRow newRow = table.addRow();
      newRow.setInt("id", table.getRowCount() - 1);
      newRow.setString("frameCount", str(frameCount));
      
      
      
      // ------------------------calculated data-----------------------
      newRow.setString("vLhand", str(vLhand));
      newRow.setString("vRhand", str(vRhand));
      newRow.setString("V_all", Energy);
      newRow.setString("Space", Space);
      saveTable(table, "data/new.csv");
    }

void send_data(){
  M_space.add(int(Space)); /* add an int to the osc message */
  M_energy.add(int(Energy)); /* add an int to the osc message */
  oscP5.send(M_space, myRemoteLocation); 
  oscP5.send(M_energy, myRemoteLocation); 
}

  

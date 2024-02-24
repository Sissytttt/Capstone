/*
Thomas Sanchez Lengeling.
 http://codigogenerativo.com/

 KinectPV2, Kinect for Windows v2 library for processing

 Skeleton color map example.
 Skeleton (x,y) positions are mapped to match the color Frame
 */


import KinectPV2.KJoint;
import KinectPV2.*;

KinectPV2 kinect;

Table table;

float Lhand_x;
float Lhand_y;
float Lhand_z;

float Rhand_x;
float Rhand_y;
float Rhand_z;

float Rfoot_x;
float Rfoot_y;
float Rfoot_z;

float Lfoot_x;
float Lfoot_y;
float Lfoot_z;


// ----------------------calc---------------------
PVector vLhand;
PVector vRhand;
PVector vLfoot;
PVector vRfoot;
PVector v1;
PVector v2;
float innerProduct;
float peak_num;

float zVal = 300;
float rotX = PI;
void setup() {
  
  //------------canvas setup----------------
  size(1920, 1080, P3D);
  
  //------------kinect setup----------------
  kinect = new KinectPV2(this);
  kinect.enableSkeletonColorMap(true);
  kinect.enableColorImg(true);
  kinect.enableSkeleton3DMap(true);
  kinect.init();
  //--------------table raw data setup-----------------
  table = new Table();
  table.addColumn("id");
  table.addColumn("frameCount");
  
  table.addColumn("Lhand_x");
  table.addColumn("Lhand_y");
  table.addColumn("Lhand_z");
  
  table.addColumn("Rhand_x");
  table.addColumn("Rhand_y");
  table.addColumn("Rhand_z");
  
  table.addColumn("Lfoot_x");
  table.addColumn("Lfoot_y");
  table.addColumn("Lfoot_z");

  table.addColumn("Rfoot_x");
  table.addColumn("Rfoot_y");
  table.addColumn("Rfoot_z");
  
  //----------------table calc data set up ----------------
  table.addColumn("v1_x");
  table.addColumn("v1_y");
  table.addColumn("v1_z");
  table.addColumn("v2_x");
  table.addColumn("v2_y");
  table.addColumn("v2_z");
  table.addColumn("innerProduct");
}

void draw() {
  background(0);
  delay(100); // interval is 0.1s
  image(kinect.getColorImage(), 0, 0, width, height);
  pushMatrix();
  translate(width/2, height/2, 0);
  scale(zVal);
  rotateX(rotX);
  ArrayList<KSkeleton> skeletonArray =  kinect.getSkeletonColorMap();

  //individual JOINTS
  for (int i = 0; i < skeletonArray.size(); i++) {
    KSkeleton skeleton = (KSkeleton) skeletonArray.get(i);
    if (skeleton.isTracked()) {
      KJoint[] joints = skeleton.getJoints();
      color col  = skeleton.getIndexColor();
      fill(col);
      stroke(col);
      //drawBody(joints);
      //drawLhand(joints);
      //drawRhand(joints);
      
      Lhand_getCoord(joints);
      Rhand_getCoord(joints);
      Lfoot_getCoord(joints);
      Rfoot_getCoord(joints);
      
      drawPoint(Lfoot_x, Lfoot_y, Lfoot_z);
      drawPoint(Rfoot_x, Rfoot_y, Rfoot_z);
      drawPoint(Lhand_x, Lhand_y, Lhand_z);
      drawPoint(Rhand_x, Rhand_y, Rhand_z);
      

     //drawBone(joints, KinectPV2.JointType_HandLeft, KinectPV2.JointType_FootRight);
     //drawBone(joints, KinectPV2.JointType_FootLeft, KinectPV2.JointType_HandRight);
     
     //println("Rfoot", Rfoot_x, Rfoot_y, Rfoot_z);
     //println("Lfoot", Lhand_x, Lhand_y, Lhand_z);
     calc();
     save_data();

     
    }

  }
  popMatrix();

  fill(255, 0, 0);
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


//----------------draw joint------------------
//void drawJoint(KJoint[] joints, int jointType) {
//  pushMatrix();
//  translate(joints[jointType].getX(), joints[jointType].getY(), joints[jointType].getZ());
//  ellipse(0, 0, 25, 25);
//  popMatrix();
//}
void drawPoint(float x, float y, float z){
      noStroke();
      pushMatrix();
      translate(x, y, z);
      ellipse(0, 0, 70, 70);
      popMatrix();
}

//draw bone
//void drawBone(KJoint[] joints, int jointType1, int jointType2) {
//  pushMatrix();
//  translate(joints[jointType1].getX(), joints[jointType1].getY(), joints[jointType1].getZ());
//  ellipse(0, 0, 25, 25);
//  popMatrix();
//  line(joints[jointType1].getX(), joints[jointType1].getY(), joints[jointType1].getZ(), joints[jointType2].getX(), joints[jointType2].getY(), joints[jointType2].getZ());
//}
void drawline(float x1, float y1, float z1, float x2, float y2, float z2){
  line(x1, y1, z1, x2, y2, z2);
}



// ----------------calculate-------------------
void calc(){
  // ----------------------------
  vLfoot = new PVector(Lfoot_x, Lfoot_y, Lfoot_z);
  vRfoot = new PVector(Rfoot_x, Rfoot_y, Rfoot_z);
  vLhand = new PVector(Lhand_x, Lhand_y, Lhand_z);
  vRhand = new PVector(Rhand_x, Rhand_y, Rhand_z);
  //println(vLfoot.x, vLfoot.y, vLfoot.z);
  v1 = PVector.sub(vLfoot, vRhand);
  v2 = PVector.sub(vRfoot, vLhand);
  innerProduct = v1.dot(v2);
  //println(innerProduct);
  
}

// -------------------save data ---------------------
void save_data (){
      TableRow newRow = table.addRow();
      newRow.setInt("id", table.getRowCount() - 1);
      newRow.setString("frameCount", str(frameCount));
      
      // ------------------------raw data------------------------
      newRow.setString("Lhand_x", str(Lhand_x));
      newRow.setString("Lhand_y", str(Lhand_y));
      newRow.setString("Lhand_z", str(Lhand_z));
      newRow.setString("Rhand_x", str(Rhand_x));
      newRow.setString("Rhand_y", str(Rhand_y));
      newRow.setString("Rhand_z", str(Rhand_z));
      newRow.setString("Lfoot_x", str(Lfoot_x));
      newRow.setString("Lfoot_y", str(Lfoot_y));
      newRow.setString("Lfoot_z", str(Lfoot_z));
      newRow.setString("Rfoot_x", str(Rfoot_x));
      newRow.setString("Rfoot_y", str(Rfoot_y));
      newRow.setString("Rfoot_z", str(Rfoot_z));
      
      // ------------------------calculated data-----------------------
      newRow.setString("v1_x", str(v1.x));
      newRow.setString("v1_y", str(v1.y));
      newRow.setString("v1_z", str(v1.z));
      newRow.setString("v2_x", str(v2.x));
      newRow.setString("v2_y", str(v2.y));
      newRow.setString("v2_z", str(v2.z));
      
      newRow.setString("innerProduct", str(innerProduct));
      
      
      saveTable(table, "data/new.csv");
    }


  

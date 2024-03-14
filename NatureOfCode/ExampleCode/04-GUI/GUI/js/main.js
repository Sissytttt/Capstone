// GUI NOTES
// 1. 在最前面定义一个object，里面是左右要gui控制的variable
// 2. 在setupThree里面setup GUI “gui.add(params, "var", min, max, step);”
//    可以设置folder，在folder里面加var “let folder = gui.addFolder("NAME");” 也可以设置初始open
// 3. 在updateThree/各种function里面使用这些var - 直接call “params.var"
// 4. update GUI: 在updateThree里面通过params.var = 某个变量，来更新GUI的数值（比如当前有多少个粒子）


// --------- define GUI variables ---------
let params = {
  x: 100,
  y: 100,
  z: 100,
  color: "#FFF",
  wireframe: false,
};

let cube;

function setupThree() {
  cube = getBox();
  scene.add(cube);

  cube.position.set(1, 0, 0); //(x, y, z);
  cube.scale.x = 100;
  cube.scale.y = 100;
  cube.scale.z = 100;

  // ----------- set up GUI -----------
  let folderScale = gui.addFolder("SCALE");
  folderScale.open();
  folderScale.add(params, "x", -200, 200, 0.1);
  folderScale.add(params, "y").min(1).max(200).step(0.1);
  folderScale.add(params, "z").min(1).max(200).step(0.1);
  gui.add(params, "wireframe");
  gui.addColor(params, "color");

  //

  let Factors = gui.addFolder("FACTORS");
  Factors.open();
  Factors.add(params, "distributionFactor", 1, 5).step(0.1).listen(); // 程序里有变化的可以加listen；可以更新数值的变化 -- to monitor the value
  Factors.add(params, "distributionFreq", 0.01, 0.06).step(0.001).listen(); // 单纯从外界获取数值，程序没有更新的话 可以不listen

  // on change - listen to the parametor change
  Factors.add(params, "...", min, max, step).onChange(function () { console.log("change") });
  Factors.add(params, "...", min, max, step).onChange(function_name()); // define a function
}

function updateThree() {

  // ----------- set varables -----------
  cube.material.color.set(params.color);
  cube.material.wireframe = params.wireframe;
  cube.scale.set(params.x, params.y, params.z);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
}

function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

// 如果有class的话
// class里面可以单写一个class的method 叫做update_params
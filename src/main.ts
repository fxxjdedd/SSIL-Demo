import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSG } from "three-csg-ts";
import * as dat from "dat.gui";

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// 调试配置对象
const debugObject = {
  wireframe: true,
  showHelpers: true,
};

// 创建 GUI
const gui = new dat.GUI();
const debugFolder = gui.addFolder("Debug");
debugFolder
  .add(debugObject, "wireframe")
  .name("线框模式")
  .onChange((value) => {
    // 更新所有材质的线框模式
    const meshes = [
      floor,
      backWall,
      leftWall,
      bedFrame,
      mattress,
      headboard,
      pillow,
      leftNightstand,
      rightNightstand,
      benchSeat,
      tableTop,
      tableLeg,
    ];

    meshes.forEach((mesh) => {
      if (
        mesh.material instanceof THREE.MeshBasicMaterial ||
        mesh.material instanceof THREE.MeshStandardMaterial
      ) {
        mesh.material.wireframe = value;
      }
    });
  });

debugFolder
  .add(debugObject, "showHelpers")
  .name("显示辅助器")
  .onChange((value) => {
    axesHelper.visible = value;
    gridHelper.visible = value;
    parallelLightHelper.visible = value;
    pointLightHelper.visible = value;
  });

debugFolder.open();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 3, 3);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 添加环境光和方向光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 添加平行光
const parallelLight = new THREE.DirectionalLight(0xffffff, 0);
parallelLight.position.set(-3, 3, -2);
parallelLight.castShadow = true;
scene.add(parallelLight);

// 可视化平行光
const parallelLightHelper = new THREE.DirectionalLightHelper(
  parallelLight,
  0.5,
  0xffaa00
);
scene.add(parallelLightHelper);

// 添加点光源
const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
pointLight.position.set(0, 0, -0.5);
pointLight.castShadow = true;
scene.add(pointLight);

// 可视化点光源
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.3, 0x00aaff);
scene.add(pointLightHelper);

// 添加辅助器
const axesHelper = new THREE.AxesHelper(5);
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(axesHelper);
scene.add(gridHelper);

// 加载地板贴图
const textureLoader = new THREE.TextureLoader();
const woodTexture = textureLoader.load("/wood_floor_diff_1k.jpg");
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(2, 2); // 让木纹重复，效果更自然

// 创建地板
const floorGeometry = new THREE.BoxGeometry(4, 0.2, 4);
const floorMaterial = new THREE.MeshStandardMaterial({
  map: woodTexture,
  roughness: 0.6,
  metalness: 0.1,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1.5;
floor.receiveShadow = true;
scene.add(floor);

// 创建墙壁
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xefe5d8, // 温暖浅米色，和木地板更协调
  roughness: 0.9, // 增加粗糙度
  metalness: 0.0, // 降低金属感
  envMapIntensity: 0.5,
});

// 天花板
const ceilingGeometry = new THREE.PlaneGeometry(4, 4);
const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial.clone());
ceiling.rotation.x = Math.PI / 2; // 旋转90度使平面朝下
ceiling.position.set(0, 0.9, 0); // 降低天花板高度
ceiling.receiveShadow = true; // 接收阴影
ceiling.castShadow = true; // 投射阴影
scene.add(ceiling);

// 为了更好地观察阴影效果，设置平行光的阴影参数
parallelLight.shadow.mapSize.width = 2048;
parallelLight.shadow.mapSize.height = 2048;
parallelLight.shadow.camera.near = 0.1;
parallelLight.shadow.camera.far = 15;
parallelLight.shadow.camera.left = -5;
parallelLight.shadow.camera.right = 5;
parallelLight.shadow.camera.top = 5;
parallelLight.shadow.camera.bottom = -5;

// 后墙
const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.4, 0.2),
  wallMaterial
);
backWall.position.z = -2;
backWall.position.y = -0.3; // 降低位置以保持底部对齐
backWall.position.x = 0.1;
backWall.receiveShadow = true;
backWall.castShadow = true;
scene.add(backWall);

// 右墙
const rightWall = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 2.4, 4),
  wallMaterial
);
rightWall.position.x = 2;
rightWall.position.y = -0.3;
rightWall.position.z = 0.1;
rightWall.receiveShadow = true;
rightWall.castShadow = true;
scene.add(rightWall);

// 前墙
const frontWall = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.4, 0.2),
  wallMaterial
);
frontWall.position.z = 2;
frontWall.position.y = -0.3;
frontWall.position.x = 0.1;
frontWall.receiveShadow = true;
frontWall.castShadow = true;
scene.add(frontWall);

// 左墙（带窗户）
const leftWallGeometry = new THREE.BoxGeometry(0.2, 2.4, 4);
const windowGeometry = new THREE.BoxGeometry(0.3, 1.2, 1.2);

// 创建墙和窗户的网格
const leftWallMesh = new THREE.Mesh(leftWallGeometry, wallMaterial);
const windowMesh = new THREE.Mesh(windowGeometry);

// 重要：将两个网格都放在原点进行布尔运算
windowMesh.position.set(0, 0.3, 0);

// 执行布尔减法操作
const leftWallCSG = CSG.fromMesh(leftWallMesh);
const windowCSG = CSG.fromMesh(windowMesh);
const finalWallCSG = leftWallCSG.subtract(windowCSG);

// 创建最终的墙面网格
// const leftWall = CSG.toMesh(finalWallCSG, leftWallMesh.matrix);
const leftWall = leftWallMesh;
leftWall.material = wallMaterial;
leftWall.position.x = -2;
leftWall.position.y = -0.3;
leftWall.position.z = 0.1;
leftWall.receiveShadow = true;
leftWall.castShadow = true;
scene.add(leftWall);

// 床组
const bedGroup = new THREE.Group();
bedGroup.position.set(0, 0, 0.3);

// 床架
const bedFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.25, 2.0),
  new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
bedFrame.position.set(0, -1.375, -1.2);
bedFrame.castShadow = true;
bedGroup.add(bedFrame);

// 床垫
const mattress = new THREE.Mesh(
  new THREE.BoxGeometry(1.7, 0.18, 1.9),
  new THREE.MeshStandardMaterial({ color: 0xeeeeee })
);
mattress.position.set(0, -1.16, -1.2);
mattress.castShadow = true;
bedGroup.add(mattress);

// 床头板
const headboard = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1.2, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
headboard.position.set(0, -0.9, -2.15);
headboard.castShadow = true;
bedGroup.add(headboard);

// 枕头
const pillow = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.09, 0.3),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
pillow.position.set(0, -1.07, -2);
pillow.castShadow = true;
bedGroup.add(pillow);

scene.add(bedGroup);

// 左床头柜
const leftNightstand = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.6, 0.4),
  new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
leftNightstand.position.set(-1.15, -1.2, -1.8);
leftNightstand.castShadow = true;
scene.add(leftNightstand);

// 右床头柜
const rightNightstand = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.6, 0.4),
  new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
rightNightstand.position.set(1.15, -1.2, -1.8);
rightNightstand.castShadow = true;
scene.add(rightNightstand);

// 床尾长凳
const benchSeat = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 0.45, 0.4),
  new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
benchSeat.position.set(0, -1.275, 0.3);
benchSeat.castShadow = true;
scene.add(benchSeat);

// 圆桌
const tableGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 32);
const tableTopMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
const tableTop = new THREE.Mesh(tableGeometry, tableTopMaterial);
tableTop.position.set(1.5, -1.2, 0);
tableTop.castShadow = true;

const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
const tableLeg = new THREE.Mesh(legGeometry, tableTopMaterial);
tableLeg.position.set(1.5, -1.55, 0);
tableLeg.castShadow = true;

const tableGroup = new THREE.Group();
tableGroup.add(tableTop);
tableGroup.add(tableLeg);
tableGroup.position.set(-2.5, 0.5, 1.0);
scene.add(tableGroup);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// 处理窗口大小变化
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

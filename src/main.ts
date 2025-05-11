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
const parallelLight = new THREE.DirectionalLight(0xffe4c4, 0.8);
parallelLight.position.set(-3, 3, -2);
parallelLight.castShadow = true;
scene.add(parallelLight);

// 可视化平行光
const parallelLightHelper = new THREE.DirectionalLightHelper(
  parallelLight,
  0.5,
  0xffe4c4
);
scene.add(parallelLightHelper);

// 添加点光源
const pointLight = new THREE.PointLight(0xffe8d6, 1.2, 10);
pointLight.position.set(0, -0.25, 0.25);
pointLight.castShadow = true;
scene.add(pointLight);

// 可视化点光源
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.3, 0xffe8d6);
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
const wallMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xefe5d8,
  roughness: 0.2,
  metalness: 0.1,
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide, // 双面渲染
  transmission: 0.6, // 透光度
  thickness: 0.2, // 厚度
  clearcoat: 1.0, // 清漆涂层
});

// 天花板使用不透明材质
const ceilingMaterial = new THREE.MeshStandardMaterial({
  color: 0xefe5d8,
  roughness: 0.9,
  metalness: 0.0,
  envMapIntensity: 0.5,
});

// 天花板
const ceilingGeometry = new THREE.PlaneGeometry(4, 4);
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.set(0, 0.9, 0);
ceiling.receiveShadow = true;
ceiling.castShadow = true;
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
  new THREE.BoxGeometry(4, 2.4, 0.05),
  wallMaterial
);
backWall.position.z = -2;
backWall.position.y = -0.3; // 降低位置以保持底部对齐
backWall.position.x = 0.0;
backWall.receiveShadow = true;
backWall.castShadow = true;
scene.add(backWall);

// 右墙
const rightWall = new THREE.Mesh(
  new THREE.BoxGeometry(0.05, 2.4, 3.99),
  wallMaterial
);
rightWall.position.x = 2;
rightWall.position.y = -0.3;
rightWall.position.z = 0.0;
rightWall.receiveShadow = true;
rightWall.castShadow = true;
scene.add(rightWall);

// 前墙
const frontWall = new THREE.Mesh(
  new THREE.BoxGeometry(3.99, 2.4, 0.05),
  wallMaterial
);
frontWall.position.z = 2;
frontWall.position.y = -0.3;
frontWall.position.x = 0;
frontWall.receiveShadow = true;
frontWall.castShadow = true;
scene.add(frontWall);

// 左墙（带窗户）
const leftWallGeometry = new THREE.BoxGeometry(0.05, 2.4, 4);
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
leftWall.position.z = 0;
leftWall.receiveShadow = true;
leftWall.castShadow = true;
scene.add(leftWall);

// 床组
const bedGroup = new THREE.Group();
bedGroup.position.set(0, 0, 0.3);

// 家具材质
const furnitureMaterial = new THREE.MeshStandardMaterial({
  color: 0xf2f2f2, // 更灰白的颜色
  roughness: 0.6, // 稍微降低粗糙度使表面更细腻
  metalness: 0.05, // 降低金属感
});

// 创建一个稍微不同的材质用于床垫和枕头
const beddingMaterial = new THREE.MeshStandardMaterial({
  color: 0xfafafa, // 纯白偏灰
  roughness: 0.5,
  metalness: 0.05,
});

// 床架
const bedFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.25, 2.0),
  furnitureMaterial
);
bedFrame.position.set(0, -1.375, -1.2);
bedFrame.castShadow = true;
bedGroup.add(bedFrame);

// 床垫
const mattress = new THREE.Mesh(
  new THREE.BoxGeometry(1.7, 0.18, 1.9),
  beddingMaterial // 使用床上用品材质
);
mattress.position.set(0, -1.16, -1.2);
mattress.castShadow = true;
bedGroup.add(mattress);

// 床头板
const headboard = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1.2, 0.1),
  furnitureMaterial
);
headboard.position.set(0, -0.9, -2.15);
headboard.castShadow = true;
bedGroup.add(headboard);

// 枕头
const pillow = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.15, 0.44),
  beddingMaterial // 使用床上用品材质
);
pillow.position.set(0.35, -1.07, -1.9);
pillow.castShadow = true;
bedGroup.add(pillow);

// 枕头
const pillow2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.15, 0.44),
  beddingMaterial // 使用床上用品材质
);
pillow2.position.set(-0.35, -1.07, -1.9);
pillow2.castShadow = true;
bedGroup.add(pillow2);

scene.add(bedGroup);

// 左床头柜
const leftNightstand = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.6, 0.4),
  furnitureMaterial
);
leftNightstand.position.set(-1.15, -1.2, -1.8);
leftNightstand.castShadow = true;
scene.add(leftNightstand);

// 右床头柜
const rightNightstand = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.6, 0.4),
  furnitureMaterial
);
rightNightstand.position.set(1.15, -1.2, -1.8);
rightNightstand.castShadow = true;
scene.add(rightNightstand);

// 床尾长凳
const benchSeat = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 0.45, 0.4),
  furnitureMaterial
);
benchSeat.position.set(0, -1.275, 0.3);
benchSeat.castShadow = true;
scene.add(benchSeat);

// 圆桌
const tableGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 32);
const tableTop = new THREE.Mesh(tableGeometry, furnitureMaterial);
tableTop.position.set(1.5, -1.2, 0);
tableTop.castShadow = true;

const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
const tableLeg = new THREE.Mesh(legGeometry, furnitureMaterial);
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

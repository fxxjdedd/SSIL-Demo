import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 3, 3);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 添加环境光和方向光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 创建地板
const floorGeometry = new THREE.BoxGeometry(4, 0.2, 4);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080,
  roughness: 0.8,
  metalness: 0.2,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1.5;
floor.receiveShadow = true;
scene.add(floor);

// 创建墙壁
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.7,
  metalness: 0.1,
});

// 后墙
const backWall = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.2), wallMaterial);
backWall.position.z = -2;
backWall.position.y = 0;
backWall.position.x = 0.1;
backWall.receiveShadow = true;
scene.add(backWall);

// 左墙
const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4), wallMaterial);
leftWall.position.x = -2;
leftWall.position.y = 0;
leftWall.position.z = 0.1;
leftWall.receiveShadow = true;
scene.add(leftWall);

// 加载床模型
const loader = new GLTFLoader();
loader.load(
  "/realistic_bed_3d_model.glb",
  (gltf) => {
    const bed = gltf.scene;
    // 调整床的位置和大小
    bed.position.set(0, -1.5, -0.6);
    bed.scale.set(1.3, 1.3, 1.3);
    bed.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(bed);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error happened", error);
  }
);

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

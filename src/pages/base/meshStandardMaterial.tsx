import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import gsap from "gsap";
import doorImg from "@/assets/textures/door/color.jpg";

let scene: any, camera: any, mesh: any, renderer: any, clock: any;
let controls: any, material: any;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let sphere: any, plane: any, torus: any;

/**
 * MeshStandardMaterial
 * https://www.bilibili.com/video/BV1wY4y1h765?p=12&vd_source=20228976b5cae10e63993b33b1a27fa0
 *
 * 材质用于在几何图形的每个可见像素上添加颜色
 * 决定每个像素颜色的算法写在称为着色器的程序中
 * Three.js 有许多带有预制着色器的内置材质
 */
export default class Materials extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new THREE.Clock();

    // 生成场景
    scene = new THREE.Scene();

    // 透视相机
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(1, 1, 2);
    scene.add(camera);

    // 渲染
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // this.initStandardMaterial();

    this.initBasicMaterial();
  };

  initStandardMaterial = () => {
    // /*
    // materials
    material = new THREE.MeshStandardMaterial({
      metalness: 0.7,
      roughness: 0.2,
      envMapIntensity: 1.0,
    });
    // material.metalness = 0.45;
    // material.roughness = 0.65;

    // 环境贴图
    const profix = "../assets/";
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMapTexture = cubeTextureLoader.load([
      require(profix + "/textures/environmentMaps/0/px.jpg"),
      require(profix + "/textures/environmentMaps/0/nx.jpg"),
      require(profix + "/textures/environmentMaps/0/py.jpg"),
      require(profix + "/textures/environmentMaps/0/ny.jpg"),
      require(profix + "/textures/environmentMaps/0/pz.jpg"),
      require(profix + "/textures/environmentMaps/0/nz.jpg"),
    ]);
    // 允许应用简单的纹理
    material.envMap = envMapTexture;

    // 使用door纹理
    // material.map = textureLoader;
    // */

    sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
    sphere.position.x = -1.5;

    plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

    torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 16, 32), material);
    torus.position.x = 1.5;

    scene.add(sphere, plane, torus);

    // light
    const ambiLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambiLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    this.initGui();
  };

  initBasicMaterial = () => {
    const textureLoader = new THREE.TextureLoader().load(doorImg);
    material = new THREE.MeshBasicMaterial();
    material.map = textureLoader;

    sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
    sphere.position.x = -1.5;

    plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

    torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 16, 32), material);
    torus.position.x = 1.5;

    scene.add(sphere, plane, torus);

    sphere.geometry.setAttribute("uv2", new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2));
    plane.geometry.setAttribute("uv2", new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));
    torus.geometry.setAttribute("uv2", new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2));

    // material.aoMap = doorAmbientOcclusionTexture;
    // material.aoMapIntensity = 1;
    // todo
  };

  animation() {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime;
    plane.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    plane.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  /**
   *
   */
  initGui = () => {
    const gui = new dat.GUI();
    // 添加调整（在创建材料之后）
    gui.add(material, "metalness").min(0).max(1).step(0.0001);
    gui.add(material, "roughness").min(0).max(1).step(0.0001);
  };

  render() {
    return <div id="webgl"></div>;
  }
}

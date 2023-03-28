import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import * as dat from "lil-gui";
import gsap from "gsap";

import matcapsImg from "@/assets/textures/matcaps/1.png";
import matcapsImg2 from "@/assets/textures/matcaps/2.png";
import matcapsImg3 from "@/assets/textures/matcaps/3.png";
import matcapsImg4 from "@/assets/textures/matcaps/4.png";
import matcapsImg5 from "@/assets/textures/matcaps/5.png";
import matcapsImg6 from "@/assets/textures/matcaps/6.png";
import matcapsImg7 from "@/assets/textures/matcaps/7.png";
import matcapsImg8 from "@/assets/textures/matcaps/8.png";

let canvas: any;
let scene: any, camera: any, mesh: any, renderer: any, clock: any;
let controls: any;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let sphere: any, plane: any, torus: any;

/**
 * 材质
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
    canvas = document.getElementById("webgl");

    clock = new THREE.Clock();

    // 生成场景
    scene = new THREE.Scene();

    // const material = this.initBaseMaterial()
    // const material: any = this.initNormalMaterial();
    const material: any = this.initMatcapMaterial();

    sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
    sphere.position.x = -1.5;

    plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

    torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 16, 32), material);
    torus.position.x = 1.5;

    scene.add(sphere, plane, torus);

    // 透视相机
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100000);
    camera.position.z = 2;
    camera.position.x = 1;

    // 渲染
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);
  };

  initBaseMaterial = () => {
    const textureLoader = new THREE.TextureLoader().load(matcapsImg);
    const material = new THREE.MeshBasicMaterial({
      // map: textureLoader,
    });
    // material.color = new THREE.Color("white");
    // material.wireframe = true; // 以 1px 的细线显示构成几何图形的三角形

    // 透明度
    // material.transparent = true;
    // material.opacity = 0.5;
    // // 纹理透明度
    material.transparent = true;
    material.alphaMap = textureLoader;

    material.side = THREE.BackSide;
    return material;
  };
  initNormalMaterial = () => {
    const material = new THREE.MeshNormalMaterial({});
    material.flatShading = true;
    return material;
  };
  initMatcapMaterial = () => {
    // const matcapTexture = new THREE.TextureLoader().load(matcapsImg3);
    const url = require("../assets/" + "textures/environmentMaps/0/px.jpg");
    const matcapTexture = new THREE.TextureLoader().load(url);
    const material = new THREE.MeshMatcapMaterial({});
    material.matcap = matcapTexture;
    return material;
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

  render() {
    return <div id="webgl"></div>;
  }
}

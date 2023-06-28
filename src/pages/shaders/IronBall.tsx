import fragmentShader from "@/assets/shaders/ball_fragmentShader.glsl";
import vertexShader from "@/assets/shaders/ball_vertexShader.glsl";
import * as dat from "lil-gui";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene: any, camera: any, renderer: any, clock: any;
let controls: any, material: any;

export default class ShaderComp extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new THREE.Clock();

    // 生成场景
    scene = new THREE.Scene();

    // 透视相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.set(0.25, -0.25, 1);
    camera.position.set(4, 1, 12);
    scene.add(camera);

    // 渲染
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    this.initMaterial();
    // this.initGui();
  };

  // 控制波动
  // initGui() {
  //   let gui = new dat.GUI();
  //   console.log("material", material);
  //   gui.add(material.uniforms.uFrequency.value, "x").min(0).max(20).step(0.01).name("frequencyX");
  //   gui.add(material.uniforms.uFrequency.value, "y").min(0).max(20).step(0.01).name("frequencyY");
  // }

  /**
   * 波动的平面
   * uniforms -> uFrequency  波动平面 频率
   */
  initMaterial = () => {
    const textureLoader = new THREE.TextureLoader();

    const geometry = new THREE.PlaneGeometry(6, 6, 1, 1);
    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        // uFrequency: { value: 10 }, // 波动平面
        // uFrequency: { value: new THREE.Vector2(10, 5) }, // 随意设置波动点
        // uTime: { value: 0 }, // 动起来
        // uColor: { value: new THREE.Color("orange") }, // 颜色
        // uTexture: { value: textureLoader.load(matcapsImg) }, // 纹理
      },
      side: THREE.DoubleSide,
    });

    let plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
  };

  resize() {
    window.addEventListener("resize", () => {
      // Update camera
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  animation() {
    // Update controls
    controls.update();
    // Render
    renderer.render(scene, camera);
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

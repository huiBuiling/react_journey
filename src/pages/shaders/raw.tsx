import fragmentShader from "@/assets/shaders/raw_fragmentShader.glsl";
import vertexShader from "@/assets/shaders/raw_vertexShader.glsl";
import * as dat from "lil-gui";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import matcapsImg from "@/assets/shaders/textures/china.jpg";

let scene: any, camera: any, renderer: any, clock: any;
let controls: any, material: any;

export default class RawShader extends Component {
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
    camera.position.set(1, 1, 2);
    scene.add(camera);

    // 渲染
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // this.initMaterial2();
    // this.initMaterial();

    this.initMaterial3();
    this.initGui();
  };

  // 控制波动
  initGui() {
    let gui = new dat.GUI();
    console.log("material", material);
    gui.add(material.uniforms.uFrequency.value, "x").min(0).max(20).step(0.01).name("frequencyX");
    gui.add(material.uniforms.uFrequency.value, "y").min(0).max(20).step(0.01).name("frequencyY");
  }

  /**
   * 简单shader
   */
  initMaterial = () => {
    /**
     * PlaneGeometry(1, 1, 32, 32)
     * 注意后两位参数, 否则 shader 看不出效果
     */
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true, // 线框
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
  };

  /**
   * 波动的平面
   * uniforms -> uFrequency  波动平面 频率
   */
  initMaterial3 = () => {
    const textureLoader = new THREE.TextureLoader();

    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true, // 线框
      uniforms: {
        // uFrequency: { value: 10 }, // 波动平面
        uFrequency: { value: new THREE.Vector2(10, 5) }, // 随意设置波动点
        uTime: { value: 0 }, // 动起来
        uColor: { value: new THREE.Color("orange") }, // 颜色
        uTexture: { value: textureLoader.load(matcapsImg) }, // 纹理
      },
    });

    let plane = new THREE.Mesh(geometry, material);
    plane.scale.y = 2 / 3; // 缩放，更柔和
    scene.add(plane);
  };

  /**
   * 随机尖峰 + 着色
   */
  initMaterial2 = () => {
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true, // 线框
    });

    // 随机尖峰
    const count = geometry.attributes.position.count;
    const randoms = new Float32Array(count);
    // 使用随机数填充数组
    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random();
    }
    // 添加到几何体的属性中
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
  };

  resize() {
    window.addEventListener("resize", () => {
      // Update sizes
      window.innerWidth = window.innerWidth;
      window.innerHeight = window.innerHeight;

      // Update camera
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  animation() {
    const elapsedTime = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsedTime;

    // // Update objects
    // sphere.rotation.y = 0.1 * elapsedTime;
    // cube.rotation.y = 0.1 * elapsedTime;
    // torus.rotation.y = 0.1 * elapsedTime;

    // sphere.rotation.x = 0.15 * elapsedTime;
    // cube.rotation.x = 0.15 * elapsedTime;
    // torus.rotation.x = 0.15 * elapsedTime;

    // Update controls
    controls.update();
    // Render
    renderer.render(scene, camera);
    // Call tick again on the next frame
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

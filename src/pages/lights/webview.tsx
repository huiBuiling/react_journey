import { Component } from "react";

import { Clock, Scene, PerspectiveCamera, WebGLRenderer, sRGBEncoding, LoadingManager } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as TWEEN from "@tweenjs/tween.js";
import * as dat from "lil-gui";

import "./style.scss";

let scene: any, camera: any, renderer: any, clock: any;
let controls: any, material: any;

/**
 * 光和影
 * https://github.com/dragonir/threejs-odessey/tree/master/03-shadow
 * https://juejin.cn/post/7148969678642102286
 */
export default class LightAndShadow extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();

    // 透视相机
    camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.set(0.25, -0.25, 1);
    camera.position.set(19, 1.54, -0.1);
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer({
      canvas: document.querySelector("#canvas-container") || undefined,
      antialias: true,
      alpha: true,
      // 提示用户代理怎样的配置更适用于当前的WebGL环境
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器是否在渲染每一帧之前自动清除其输出
    renderer.autoClear = true;
    // 定义渲染器的输出编码
    renderer.outputEncoding = sRGBEncoding;
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    this.initMaterial();
    // this.initLoading();
    // this.initGui();
  };

  // 控制波动
  // initGui() {
  //   let gui = new dat.GUI();
  //   console.log("material", material);
  //   gui.add(material.uniforms.uFrequency.value, "x").min(0).max(20).step(0.01).name("frequencyX");
  //   gui.add(material.uniforms.uFrequency.value, "y").min(0).max(20).step(0.01).name("frequencyY");
  // }

  initMaterial = () => {};

  initModel = () => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/public");
    dracoLoader.preload();
    const gltfLoader = new GLTFLoader();
    // gltfLoader.setCrossOrigin("anonymous");
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/model/russell.glb", // mushy_buddy girl russell gem_ring2
      (gltf: any) => {
        const model = gltf.scene;
        scene.add(model);

        dracoLoader.dispose();
      }
      // (xhr) => {
      //   console.log("xhr", xhr);
      //   // loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
      //   // console.log("loadProgress", xhr, xhr.loaded, xhr.total);
      //   // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      // }
    );
  };

  // 初始化加载管理器
  // initLoading() {
  // const loadingManager = new LoadingManager();
  // loadingManager.onLoad = () => {
  //   const yPosition = { y: 0 };
  //   const ftsLoader = document.querySelector(".lds-roller");
  //   const loadingCover = document.getElementById("loading-text-intro");
  // 隐藏加载页面动画
  // let tween = new TWEEN.Tween(yPosition)
  //   .to({ y: 100 }, 900)
  //   .easing(TWEEN.Easing.Quadratic.InOut)
  //   .start()
  //   .onUpdate(() => {
  //     loadingCover?.style.setProperty("transform", `translate(0, ${yPosition.y}%)`);
  //   })
  //   .onComplete(function () {
  //     loadingCover?.parentNode?.removeChild(loadingCover);
  //     TWEEN.remove(tween);
  //   });
  // // 第一个页面相机添加入场动画
  // tween = new TWEEN.Tween(camera.position.set(0, 4, 2))
  //   .to({ x: 0, y: 2.4, z: 5.8 }, 3500)
  //   .easing(TWEEN.Easing.Quadratic.InOut)
  //   .start()
  //   .onComplete(function () {
  //     TWEEN.remove(tween);
  //     document.querySelector(".header")?.classList.add("ended");
  //     document.querySelector(".description")?.classList.add("ended");
  //   });
  // ftsLoader?.parentNode?.removeChild(ftsLoader);
  // window.scroll(0, 0);
  // };
  // }

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
    return (
      <div className="shadow_page">
        {/*  style={{ display: "none" }} */}
        <div id="loading-text-intro">
          <p>Loading</p>
        </div>
        {/* style={{ visibility: "hidden" }} */}
        <div className="content">
          <nav className="header ">
            {" ended "}
            <a href="https://github.com/dragonir/threejs-odessey" className="active a">
              <span>首页</span>
            </a>
            <a href="https://github.com/dragonir/threejs-odessey" className="a">
              <span>关于</span>
            </a>
            <a href="https://github.com/dragonir/threejs-odessey" className="a">
              <span>作品</span>
            </a>
            <a href="https://github.com/dragonir/threejs-odessey" className="a">
              <span>我的</span>
            </a>
            <a href="https://github.com/dragonir/threejs-odessey" className="a">
              <span>更多</span>
            </a>
            <div className="cursor"></div>
          </nav>
          <section className="section first">
            <div className="info"></div>
            <canvas id="canvas-container" className="webgl"></canvas>
          </section>
          {/* <section className="section second">
            <div className="second-container"></div>
            <canvas id="canvas-container-details" className="webgl"></canvas>
          </section> */}
        </div>
      </div>
    );
  }
}

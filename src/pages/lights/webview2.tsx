import { Component } from "react";

import {
  Clock,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  // 输出编码
  sRGBEncoding,
  // 加载
  LoadingManager,
  // 感光材质
  MeshPhongMaterial,
  DirectionalLight,
  PointLight,
  // 辅助
  PointLightHelper,
  Box3,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as TWEEN from "@tweenjs/tween.js";
import * as dat from "lil-gui";

import "./style.scss";

let scene: any, camera: any, renderer: any, clock: any;
let controls: any, material: any;
let loadingManager: any;
let pointLight: PointLight,
  directionLight: DirectionalLight,
  cursor = { x: 0, y: 0 },
  _cursor: any,
  previousTime = 0;

/**
 * 光和影
 * https://github.com/dragonir/threejs-odessey/tree/master/03-shadow
 * https://juejin.cn/post/7148969678642102286
 */

interface IProps {}
interface IState {
  isLoading: Boolean;
}
export default class LightAndShadow extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    this.init();
    this.animation();
    this.initCursor();
  }

  init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();

    // 透视相机
    camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    // camera.position.set(19, 1.54, -0.1);
    // scene.translateY(-150); //沿着Y轴下方平移距离100
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer({
      canvas: document.querySelector("#canvas-container") || undefined,
      antialias: true,
      // alpha: true,
      // // 提示用户代理怎样的配置更适用于当前的WebGL环境
      // powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器是否在渲染每一帧之前自动清除其输出
    // renderer.autoClear = true;
    // 定义渲染器的输出编码
    renderer.outputEncoding = sRGBEncoding;
    renderer.render(scene, camera);

    // Controls
    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.addEventListener("change", () => {
    //   // console.log(`output->change`, pointLight.position);
    // });

    _cursor = document.querySelector(".cursor");

    this.initLoading();
    this.initLight();
    this.initModel();
    this.initGui();
  };

  // 控制波动
  initGui() {
    let gui = new dat.GUI();
    console.log("pointLight", pointLight.position);
    // gui.add(directionLight.position, "x").min(-200).max(800).step(0.1).name("directionLight_x");
    // gui.add(directionLight.position, "y").min(-200).max(800).step(0.1).name("directionLight_y");
    // gui.add(directionLight.position, "z").min(-200).max(800).step(0.1).name("directionLight_z");

    gui.add(pointLight.position, "x").min(-800).max(800).step(0.1).name("pointLight_x");
    gui.add(pointLight.position, "y").min(-800).max(800).step(0.1).name("pointLight_y");
    gui.add(pointLight.position, "z").min(-800).max(800).step(0.1).name("pointLight_z");
  }

  // 鼠标移动时添加虚拟光标
  initCursor = () => {
    window.addEventListener(
      "mousemove",
      (event) => {
        event.preventDefault();
        cursor.x = event.clientX / window.innerWidth - 0.5;
        cursor.y = event.clientY / window.innerHeight - 0.5;
        // 鼠标移动时添加虚拟光标
        // console.log("cursor", cursor);
        _cursor.style.cssText = `left: ${event.clientX}px; top: ${event.clientY}px;`;
      },
      false
    );
  };

  // 光源
  initLight = () => {
    // 直射光 照亮后面
    directionLight = new DirectionalLight(0xffffff, 0.8);
    // directionLight.position.set(-100, 200, -100);
    directionLight.position.set(-100, 0, -100);
    scene.add(directionLight);

    // 点光源 400 -> 太小值没效果
    pointLight = new PointLight(0x88ffee, 2.7, 400, 3);
    pointLight.position.set(106, 210, 72); // z:35.3
    scene.add(pointLight);
    const pointLightHelper = new PointLightHelper(pointLight, 15);
    scene.add(pointLightHelper);
  };

  // 模型加载
  initModel = () => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/public");
    dracoLoader.setDecoderConfig({ type: "js" });
    const gltfLoader = new GLTFLoader(loadingManager); // loadingManager
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/model/mushy_buddy.glb", // mushy_buddy statue
      (gltf: any) => {
        let model = gltf.scene;
        console.log("model", model);

        // const box = new Box3().setFromObject(model); // 获取模型的包围盒
        // const size = box.getSize(new Vector3());
        // const pos = box.getCenter(new Vector3());
        // console.log("box", size, pos);
        // model.position.y = -pos.y;
        // const height = box.max.y;
        // const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360)); // 360
        // camera.position.set(pos.x, pos.y, dist * 1.5); // fudge factor so you can see the boundaries
        // console.log("1", camera.position);

        model.traverse((obj: any) => {
          // 去除模型原有材质，添加感光材质
          if (obj?.isMesh) {
            material = obj.material;
            obj.material = new MeshPhongMaterial({ shininess: 100 });
          }
        });

        scene.add(model);
        // material.dispose();
        dracoLoader.dispose();
      },
      (xhr) => {
        // console.log("xhr", xhr);
        // loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (err) => {
        console.log("err", err);
      }
    );
  };

  // 初始化加载管理器
  initLoading = () => {
    const _self = this;
    loadingManager = new LoadingManager();

    // 此函数在加载开始时被调用
    loadingManager.onStart = function (url: any, itemsLoaded: any, itemsTotal: any) {
      console.log("Started loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
    };

    loadingManager.onLoad = function () {
      console.log("Loading complete!");
    };

    // 此方法加载每一个项，加载完成时进行调用
    loadingManager.onProgress = function (url: any, itemsLoaded: any, itemsTotal: any) {
      console.log("Loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
    };
    // 此方法将在任意项加载错误时，进行调用
    loadingManager.onError = function (url: any) {
      console.log("There was an error loading " + url);
    };

    // 所有的项目加载完成后将调用此函数。默认情况下，该函数是未定义的，除非在构造函数中传入
    loadingManager.onLoad = function () {
      console.log(11111111111112);
      const yPosition = { y: 0 };
      const ftsLoader = document.querySelector(".lds-roller");
      const loadingCover = document.getElementById("loading-text-intro");
      // 隐藏加载页面动画
      const tween = new TWEEN.Tween(yPosition)
        .to({ y: 100 }, 900)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onUpdate(() => {
          loadingCover?.style.setProperty("transform", `translate(0, ${yPosition.y}%)`);
        })
        .onComplete(function () {
          loadingCover?.parentNode?.removeChild(loadingCover);
          TWEEN.remove(tween);
          _self.setState({ isLoading: false });
        });
      // 第一个页面相机添加入场动画
      const tween2 = new TWEEN.Tween(camera.position.set(10, 0, 0))
        .to({ x: 5.397631049156189, y: 164.96800056555696, z: 760.3392831164882 }, 3500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function () {
          TWEEN.remove(tween2);
          _self.setState({ isLoading: false });
        });
      tween.start();
      tween2.start();
      window.scroll(0, 0);
    };
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
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    const parallaxY = cursor.y;
    const parallaxX = cursor.x;
    // 点光源位置
    // pointLight.position.y += (parallaxY * 4 + pointLight.position.y - 2) * deltaTime;
    // pointLight.position.x -= (parallaxX * 8 - pointLight.position.x) * 2 * deltaTime;

    // camera.position.z -= (parallaxY / 3 + camera.position.z) * 2 * deltaTime;
    // camera.position.x += (parallaxX / 3 - camera.position.x) * 2 * deltaTime * 70;
    // camera.position.z -= 1;
    console.log(
      "first",
      (parallaxX / 3 - camera.position.x) * 2 * deltaTime * 70
      // pointLight.position,
      // camera.position
    );

    // let deltaTime = clock.getDelta();
    //   根据当前滚动的scrolly，去设置相机移动的位置
    // camera.position.y = -(window.scrollY / window.innerHeight) * 30;
    // camera.position.x += (cursor.x * 5 - camera.position.x) * deltaTime * 5;

    TWEEN.update(); // !!!
    // controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    const { isLoading } = this.state;
    return (
      <div className="shadow_page">
        {/*  style={{ display: "none" }} */}
        <div className="lds-roller" style={{ display: isLoading ? "block" : "none" }}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div id="loading-text-intro" style={{ display: isLoading ? "flex" : "none" }}>
          <p>Loading</p>
        </div>
        {/* style={{ visibility: "hidden" }} */}
        <div className="content">
          <nav className={`header ${isLoading ? "" : "ended"}`}>
            {/* <a href="https://github.com/dragonir/threejs-odessey" className="active a">
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
            </a> */}
            <div className="cursor"></div>
          </nav>
          <section className="section first">
            <div className="info">
              <h2 className="name">DRAGONIR</h2>
              <h1 className="title">THREE.JS ODESSEY</h1>
              <p className="description">&nbsp;</p>
            </div>
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

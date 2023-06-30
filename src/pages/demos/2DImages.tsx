import { Component } from "react";

import {
  Clock,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  // 输出编码
  sRGBEncoding,
  DirectionalLight,
  DirectionalLightHelper,
  AmbientLight,
  TextureLoader,
  Group,
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  PlaneGeometry,
  MeshPhysicalMaterial,
  MeshPhongMaterial,
  DoubleSide,
  Box3,
  Vector3,
  Color,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import TWEEN from "@tweenjs/tween.js";
import * as dat from "lil-gui";
import BackgroundImg from "@/assets/textures/2d/background.png";
// import BackgroundImg from "@/assets/textures/2d/bg.jpg";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any,
  layerGroup: any,
  layers: any[],
  aspect = 18;
let ambientLight: AmbientLight, directionLight: DirectionalLight;
let dialogBox: any = null,
  step = 0;

/**
 * 二维图片具有3D效果
 * https://www.wolai.com/6xAtAwPABZW5iH8bfRVkGA
 *
 * 参考：https://juejin.cn/post/7067344398912061454
 */

interface IProps {}
interface IState {
  // isLoading: Boolean;
}
export default class LightAndShadow extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      // isLoading: true,
    };
  }

  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    container = document.getElementById("container");
    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器的输出编码
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    clock = new Clock();
    // 生成场景
    scene = new Scene();
    // 添加背景图片
    scene.background = new TextureLoader().load(BackgroundImg);
    // 透视相机
    camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(12, 0, 0);
    // camera.position.set(0, 0, 12);
    camera.lookAt(new Vector3(0, 0, 0));
    scene.add(camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true; // 禁用摄像机平移
    controls.enablePan = false; // 阻尼
    // 垂直旋转角度限制
    controls.minPolarAngle = 1.5;
    controls.maxPolarAngle = 1.7;
    // 水平旋转角度限制
    controls.minAzimuthAngle = -0.5; // 向右
    controls.maxAzimuthAngle = 0.3; // 向左

    controls.addEventListener("change", () => {
      console.log(`output->change`, controls);
    });

    // IMAGE ARRAY
    layers = [
      require(`../../assets/textures/2d/download.png`),
      require(`../../assets/textures/2d/layer_1.png`),
      require(`../../assets/textures/2d/layer_2.png`),
      require(`../../assets/textures/2d/layer_3.png`),
      require(`../../assets/textures/2d/layer_4.png`),
      require(`../../assets/textures/2d/layer_5.png`),
      require(`../../assets/textures/2d/layer_6.png`),
      require(`../../assets/textures/2d/layer_7.png`),
    ];

    this.addLight();
    this.addGroup();
    this.addBoom();
    this.addGui();
    this.addAnimation();
  };

  addGroup() {
    layerGroup = new Group();
    let aspect = 18;
    for (let i = 0; i < layers.length; i++) {
      let mesh = new Mesh(
        new PlaneGeometry(10.41, 16),
        // new PlaneGeometry(5.41, 8),
        new MeshPhysicalMaterial({
          map: new TextureLoader().load(layers[i]),
          transparent: true,
          side: DoubleSide,
        })
      );
      mesh.position.set(0, 0, i);
      mesh.scale.set(1 - i / aspect, 1 - i / aspect, 1 - i / aspect);
      layerGroup.add(mesh);

      // 文字
      if (i === 5) {
        mesh.material.metalness = 0.6;
        mesh.material.emissive = new Color(0x55cfff);
        mesh.material.emissiveIntensity = 1.6;
        mesh.material.opacity = 0.9;
      }
      // 会话框
      if (i === 6) {
        mesh.scale.set(1.5, 1.5, 1.5);
        dialogBox = mesh;
        dialogBox.position.x = 5;
        // console.log("dialogBox", dialogBox.position);
      }
    }

    // layerGroup.scale.set(1.2, 1.2, 1.2);
    scene.add(layerGroup);
  }

  addBoom() {
    const boom = new Mesh(
      new PlaneGeometry(15, 11),
      new MeshPhongMaterial({
        map: new TextureLoader().load(require("../../assets/textures/2d/boom.png")),
        transparent: true,
        shininess: 160,
        specular: new Color(0xff6d00),
        opacity: 0.7,
      })
    );
    // boom.scale.set(0.8, 0.8, 0.8);
    boom.position.set(0, 1.2, -3);
    layerGroup.add(boom);
  }

  // 控制波动
  addGui() {
    let gui = new dat.GUI();
    gui.add(directionLight.position, "x").min(-50).max(50).step(1).name("pointLight_x");
    gui.add(directionLight.position, "y").min(-50).max(50).step(1).name("pointLight_y");
    gui.add(directionLight.position, "z").min(-50).max(50).step(1).name("pointLight_z");
    // 颜色
    gui.addColor(directionLight, "color").onChange((val: string) => {
      directionLight.color.set(val);
    });

    gui.add(controls, "minPolarAngle").min(-10).max(10).step(0.1).name("minPolarAngle");
    gui.add(controls, "maxPolarAngle").min(-10).max(10).step(0.1).name("maxPolarAngle");
    gui.add(controls, "minAzimuthAngle").min(-6).max(6).step(0.1).name("minAzimuthAngle");
    gui.add(controls, "maxAzimuthAngle").min(-6).max(6).step(0.1).name("maxAzimuthAngle");
  }

  // 光源
  addLight = () => {
    const cube = new Mesh(new BoxGeometry(0.6, 0.6, 0.6), new MeshLambertMaterial({}));
    cube.position.set(0, 0, 7);
    // scene.add(cube);

    // 直射光
    directionLight = new DirectionalLight(0x3a2622, 1);
    directionLight.position.set(-9, -8, 50);
    // directionLight.position.set(10, 10, 30); // 位置
    // directionLight.target = cube; // 设置光源照射的对象target，光的照射终点会跟随着物体移动
    directionLight.castShadow = true; // 设置灯光的阴影属性
    // 获取该光源产生的shadow，并设置参数
    directionLight.shadow.mapSize.width = 512 * 12;
    directionLight.shadow.mapSize.height = 512 * 12;
    directionLight.shadow.camera.top = 100;
    directionLight.shadow.camera.bottom = -50;
    directionLight.shadow.camera.left = -50;
    directionLight.shadow.camera.right = 100;
    scene.add(directionLight);
    // scene.add(directionLight.target);

    const helper = new DirectionalLightHelper(directionLight, 5, 0xfc5280);
    scene.add(helper);

    // 环境光
    ambientLight = new AmbientLight(0xdddddd); // 0xfc5280
    scene.add(ambientLight);
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
    TWEEN.update(); // !!!
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);

    step += 0.01;
    dialogBox.position.x = 2 - Math.cos(step);
    dialogBox.position.y = -0.6 + Math.abs(Math.sin(step));
  }

  addAnimation() {
    console.log(`1111111`);
    const tween = new TWEEN.Tween(camera.position)
      .to({ x: 0, y: 0, z: 16 }, 1600)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
      .onUpdate(function (object) {
        console.log("object", object);
        camera.position.x = object.x;
        camera.position.y = object.y;
        camera.position.z = object.z;
      })
      .onComplete(function () {
        controls.enabled = true;
        TWEEN.remove(tween);
      });

    tween.start();
  }

  render() {
    return <div id="container"></div>;
  }
}

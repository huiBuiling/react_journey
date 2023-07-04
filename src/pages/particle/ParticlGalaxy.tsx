import { Component } from "react";

// import LegacyJSONLoader from "@/assets/particle/LegacyJSONLoader";
import * as TWEEN from "@tweenjs/tween.js";
import * as dat from "lil-gui";
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  // 输出编码
  sRGBEncoding,
  TextureLoader,
  // VertexColors,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any,
  layerGroup: any,
  layers: any[],
  aspect = 18;
let ambientLight: AmbientLight, directionLight: DirectionalLight;
let dialogBox: any = null,
  step = 0;
let geometry: any,
  around: any,
  aroundMaterial: any,
  aroundPoints: any,
  textureLoader,
  gradient: any,
  material: any,
  particles: any;

let parameters: {
  count: number;
  size: number;
  radius: number;
  branches: number;
  spin: number;
  randomness: number;
  randomnessPower: number;

  insideColor: string;
  outsideColor: string;
} = {
  count: 10000,
  size: 0.02,
  radius: 5, // 半径
  branches: 3,
  spin: 1, // 偏转角度 3
  randomness: 0.2, // 扩散值
  randomnessPower: 3,

  insideColor: "#4D90FE",
  outsideColor: "#E94242",
};

/**
 * 粒子: 基础显示
 * https://juejin.cn/post/7113574687271026724
 */

interface IProps {}
interface IState {
  // isLoading: Boolean;
}
export default class ParticlGalaxy extends Component<IProps, IState> {
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
    container.appendChild(renderer.domElement);

    // 生成场景
    scene = new Scene();
    // 雾化
    // scene.fog = new FogExp2(0x000000, 0.001);
    // 透视相机
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.set(3.6, 3.6, 3.6);
    camera.position.set(4, 5, 4);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    // 初始化贴图
    textureLoader = new TextureLoader();
    // 圆点
    gradient = textureLoader.load(require("../../assets/particle/gradient.png"));

    this.initPointsMesh();
    this.addEventFun();
    this.addGui();
  };

  // 初始化载体粒子体系
  initPointsMesh() {
    if (particles) {
      geometry.dispose();
      material.dispose();
      scene.remove(particles);
    }

    // 初始化geometry
    geometry = new BufferGeometry();
    const position = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    // 渐变色
    const colorInside = new Color(parameters.insideColor);
    const colorOutside = new Color(parameters.outsideColor);
    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      // position[i3] = (Math.random() - 0.5) * 3;
      // position[i3 + 1] = (Math.random() - 0.5) * 3;
      // position[i3 + 2] = (Math.random() - 0.5) * 3;

      // 形成一条直线
      const radius = Math.random() * parameters.radius;
      // position[i3] = radius;
      // position[i3 + 1] = 0;
      // position[i3 + 2] = 0;

      // 3条直线
      // const branchesAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
      // position[i3] = Math.cos(branchesAngle) * radius;
      // position[i3 + 1] = 0;
      // position[i3 + 2] = Math.sin(branchesAngle) * radius;

      // 3条线 添加弧度
      const branchesAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
      const spinAngle = radius * parameters.spin; // 角度
      // position[i3] = Math.cos(branchesAngle + spinAngle) * radius;
      // position[i3 + 1] = 0;
      // position[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius;

      // 添加随机扩散
      // const randomX = (Math.random() - 0.5) * parameters.randomness * radius;
      // const randomY = (Math.random() - 0.5) * parameters.randomness * radius;
      // const randomZ = (Math.random() - 0.5) * parameters.randomness * radius;

      // position[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX;
      // position[i3 + 1] = randomY;
      // position[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ;

      // 优化扩散
      const randomX =
        Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomY =
        Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomZ =
        Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

      position[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX;
      position[i3 + 1] = randomY;
      position[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ;

      // 单色
      // colors[i3] = 1;
      // colors[i3 + 1] = 0;
      // colors[i3 + 2] = 0;

      // 渐变色
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    geometry.setAttribute("position", new BufferAttribute(position, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));

    // Material
    material = new PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: AdditiveBlending,
      // color: 0x14b8ff,

      // 要为每个顶点设置颜色，所以需要将 vertexColors 设置为 true
      vertexColors: true,
      // map: gradient,
    });

    // material.vertexColors = VertexColors;
    particles = new Points(geometry, material);
    scene.add(particles);
  }

  // 添加监听
  addEventFun() {
    //事件监听
    // document.addEventListener("mousedown", onDocumentMouseDown, false);
    // document.addEventListener("mousewheel", onDocumentMouseWheel, false);
    // document.addEventListener("keydown", onDocumentKeyDown, false);
    window.addEventListener("resize", this.onWindowResize, false);
  }

  // 控制波动
  addGui() {
    let gui = new dat.GUI();
    gui.add(controls, "autoRotate");
    gui.add(controls, "autoRotateSpeed", 0.1, 10, 0.01);

    gui.add(parameters, "count", 100, 100000, 100).onFinishChange(this.initPointsMesh);
    gui.add(parameters, "size", 0.001, 0.1, 0.001).onFinishChange(this.initPointsMesh);
    gui.add(parameters, "radius", 0.01, 20, 0.01).onFinishChange(this.initPointsMesh);
    gui.add(parameters, "branches", 2, 20, 1).onFinishChange(this.initPointsMesh);
    gui.add(parameters, "spin", -5, 5, 0.001).onFinishChange(this.initPointsMesh);
    gui.add(parameters, "randomness", 0, 2, 0.001).onFinishChange(this.initPointsMesh);
    gui.add(parameters, "randomnessPower", 1, 10, 0.001).onFinishChange(this.initPointsMesh);
    gui.addColor(parameters, "insideColor").onFinishChange(this.initPointsMesh);
    gui.addColor(parameters, "outsideColor").onFinishChange(this.initPointsMesh);
  }

  onWindowResize() {
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
    // this.updateAnimation();
    TWEEN.update(); // !!!
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  // updateAnimation() {
  //   const tween = new TWEEN.Tween(parameters)
  //     .to(
  //       {
  //         count: 10000,
  //         size: 0.02,
  //         radius: 5, // 半径
  //         branches: 3,
  //         spin: 3, // 偏转角度 3
  //         randomness: 0.2, // 扩散值
  //         randomnessPower: 3,
  //         insideColor: "#4D90FE",
  //         outsideColor: "#E94242",
  //       },
  //       900
  //     )
  //     .easing(TWEEN.Easing.Quadratic.InOut)
  //     .start()
  //     .onUpdate(() => {
  //       // parameters = { ...parameters, spin: 3 };
  //       console.log("first", parameters);
  //       this.initPointsMesh();
  //     })
  //     .onComplete(function () {
  //       TWEEN.remove(tween);
  //     });

  //   tween.start();
  // }

  render() {
    return <div id="container"></div>;
  }
}

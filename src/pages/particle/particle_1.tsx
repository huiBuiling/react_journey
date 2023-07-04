import { Component } from "react";

// import LegacyJSONLoader from "@/assets/particle/LegacyJSONLoader";
import * as dat from "lil-gui";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  FogExp2,
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
let controls: any;
let geometry: any, gradient: any, textureLoader, material: any, particles: any;

let parameters: { count: number; size: number } = {
  count: 2000,
  size: 0.03,
};

/**
 * 粒子: 基础显示
 * https://juejin.cn/post/7113574687271026724
 */

interface IProps {}
interface IState {
  // isLoading: Boolean;
}
export default class Particle extends Component<IProps, IState> {
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
    scene.fog = new FogExp2(0x000000, 0.001);
    // 透视相机
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(6, 2, 1);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
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
    // 随机色
    var colorArray = new Float32Array([Math.random(), Math.random(), Math.random()]);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      position[i3] = (Math.random() - 0.5) * 3;
      position[i3 + 1] = (Math.random() - 0.5) * 3;
      position[i3 + 2] = (Math.random() - 0.5) * 3;
    }
    geometry.setAttribute("position", new BufferAttribute(position, 3));
    // geometry.setAttribute("color", 0xffffff * Math.random());

    // Material
    material = new PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: AdditiveBlending,
      // color: 0xffffff * Math.random(),
      color: 0x14b8ff,
      // transparent: true,
      // opacity: 1,
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

    gui.add(parameters, "count", 100, 1000000, 100).onFinishChange(this.initPointsMesh);
    gui.add(parameters, "size", 0.001, 0.1, 0.001).onFinishChange(this.initPointsMesh);
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
    // TWEEN.update(); // !!!
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container"></div>;
  }
}

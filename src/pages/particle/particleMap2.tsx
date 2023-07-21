import { Component } from "react";
// import LegacyJSONLoader from "@/assets/particle/LegacyJSONLoader";
import * as dat from "lil-gui";
import {
  // VertexColors,
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Clock,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Spherical,
  Sprite,
  SpriteMaterial,
  sRGBEncoding,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  PCFShadowMap,
  DirectionalLight,
  PointLight,
} from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let container: any,
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  render2d: CSS2DRenderer,
  clock: any;
let controls: any;
let group: Group, textureLoader: TextureLoader;
let satelliteGroup: any,
  radius: number = 5,
  groupDots: any;
let PiontAnimationArr: any[];
/**
 * 地球
 * https://www.yii666.com/blog/345973.html
 * https://github.com/RainManGO/3d-earth
 */

interface IProps {}
interface IState {
  // isLoading: Boolean;
}
export default class Particl extends Component<IProps, IState> {
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

  // 初始化 webgl渲染器（WebGLRenderer）
  initRender() {
    container = document.getElementById("container");
    // 渲染
    renderer = new WebGLRenderer({
      antialias: true, // 是否执行抗锯齿
      alpha: true, // 画布是否包含alpha（透明度）缓冲区: true -> 值为0, 默认值为false -> 值为1
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = PCFShadowMap;
    // 定义渲染器的输出编码
    // renderer.outputEncoding = sRGBEncoding;
    container.appendChild(renderer.domElement);
  }

  // 初始化 css2d 渲染器（CSS2DRenderer）
  initCSS2Render() {
    render2d = new CSS2DRenderer();
    render2d.setSize(window.innerWidth, window.innerHeight);
    render2d.domElement.style.position = "absolute";
    render2d.domElement.style.top = "0px";
    render2d.domElement.tabIndex = 0;
    render2d.domElement.className = "CSSRender2d";
  }

  // 初始化控制器
  initControls() {
    // !注意：使用的是 render2d
    // const controlConfig = {
    //   minZoom: ,
    //   maxZoom: ,
    //   minPolarAngle: ,
    //   maxPolarAngle: ,
    // }
    controls = new OrbitControls(camera, render2d.domElement);
    controls.addEventListener("change", () => {
      console.log(`output->change`, camera.position);
    });

    // controls.minZoom = controlConfig.minZoom;
    // controls.maxZoom = controlConfig.maxZoom;
    // controls.minPolarAngle = controlConfig.minPolarAngle;
    // controls.maxPolarAngle = controlConfig.maxPolarAngle;
  }

  init = () => {
    clock = new Clock();

    this.initRender();
    this.initCSS2Render();

    // 生成场景
    scene = new Scene();
    scene.background = new Color(0x020924);
    // scene.fog = new Fog(0x020924, 200, 1000);
    // 透视相机
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(30, 26, 10);
    scene.add(camera);

    // let gui = new dat.GUI();
    this.initControls();
    this.initLight();
    this.addEventFun();

    textureLoader = new TextureLoader();
    //
    this.initEarth();

    //
  };

  /**
   * 添加圆形几何体对象
   * 为几何体贴图
   */
  initEarth() {
    const _texture = textureLoader.load("/textures/3dmap/earth.png");
    const earthGgeometry = new SphereGeometry(50, 100, 100);
    const earthMaterial = new MeshBasicMaterial({
      map: _texture,
      color: new Color("#C70000"),
      opacity: 1,
    });
    const earthMesh = new Mesh(earthGgeometry, earthMaterial);
    scene.add(earthMesh);
  }

  /**
   * 平行光 DirectionalLight
   * 点光源 PointLight
   * 半球光 HemisphereLight
   * 环境光 AmbientLight
   * 地球的贴图是这种发光材质，需要光照来打效果
   */
  initLight() {
    // 平行光
    var directionalLight = new DirectionalLight(0x80b5ff, 1);
    directionalLight.position.set(-250, 250, 100);
    scene.add(directionalLight);

    // 点光
    var pointLight = new PointLight(0x80d4ff, 1);
    pointLight.position.set(-250, 250, 100);
    scene.add(pointLight);

    // 半球光
    var hemisphereLight = new HemisphereLight(0xffffff, 0x3d6399, 1);
    hemisphereLight.position.set(-250, 250, 100);
    scene.add(hemisphereLight);

    //环境光
    var ambient = new AmbientLight(0x002bff, 0.8);
    scene.add(ambient);
  }

  // 添加监听
  addEventFun() {
    //事件监听
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  // 控制波动
  addGui() {
    // let gui = new dat.GUI();
    // gui.add(earthPoints.position, "x").min(-800).max(800).step(1).name("x");
    // gui.add(earthPoints.position, "y").min(-800).max(800).step(1).name("y");
    // gui.add(earthPoints.position, "z").min(-800).max(800).step(1).name("z");
  }

  onWindowResize() {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animation() {
    // TWEEN.update(); // !!!

    // 光圈标注动画
    if (PiontAnimationArr?.length) {
      // this.PiontAnimation();
    }

    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container"></div>;
  }
}

import { Component } from "react";
// import LegacyJSONLoader from "@/assets/particle/LegacyJSONLoader";
import * as dat from "lil-gui";
import {
  // VertexColors,
  AdditiveBlending,
  BufferGeometry,
  Clock,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
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
  DirectionalLightHelper,
  PointLight,
  PointLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  AmbientLight,
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

// 灯光
let directionalLight: DirectionalLight,
  pointLight: PointLight,
  hemisphereLight: HemisphereLight,
  ambientLight: AmbientLight;

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
    container.appendChild(render2d.domElement);
  }

  // 初始化控制器
  initControls() {
    // !注意：使用的是 render2d
    const controlConfig = {
      minZoom: 0.5,
      maxZoom: 2,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 2,
    };
    controls = new OrbitControls(camera, render2d.domElement);
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    controls.minZoom = controlConfig.minZoom;
    controls.maxZoom = controlConfig.maxZoom;
    controls.minPolarAngle = controlConfig.minPolarAngle;
    controls.maxPolarAngle = controlConfig.maxPolarAngle;
  }

  init = () => {
    clock = new Clock();

    this.initRender();
    this.initCSS2Render();

    // 生成场景
    scene = new Scene();
    scene.background = new Color(0x020924);
    scene.fog = new Fog(0x020924, 200, 1000);

    // 透视相机
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(50, 26, 10);
    scene.add(camera);

    // let gui = new dat.GUI();
    this.initControls();

    this.addEventFun();

    textureLoader = new TextureLoader();
    //
    // this.initPoint();
    this.initEarth();

    this.initLight();
    this.addGui();
  };

  /**
   * 星空背景
   */
  initPoint() {
    const positions = [];
    const colors = [];
    const geometry = new BufferGeometry();
    for (var i = 0; i < 10000; i++) {
      var vertex = new Vector3();
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      positions.push(vertex.x, vertex.y, vertex.z);
      var color = new Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    const texture = textureLoader.load(`/textures/other/gradient.png`, (texture) => {
      texture.encoding = sRGBEncoding;
      texture.flipY = false;
    });

    const starsMaterial = new PointsMaterial({
      map: texture,
      size: 1,
      transparent: true,
      opacity: 1,
      vertexColors: true, //true：且该几何体的colors属性有值，则该粒子会舍弃第一个属性--color，而应用该几何体的colors属性的颜色
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });

    let stars = new Points(geometry, starsMaterial);
    stars.scale.set(300, 300, 300);
    scene.add(stars);
  }

  /**
   * 添加圆形几何体对象
   * 为几何体贴图
   */
  initEarth() {
    const _texture = textureLoader.load("/textures/3dmap/earth.png");
    const earthGgeometry = new SphereGeometry(14, 100, 100);
    const earthMaterial = new MeshLambertMaterial({
      map: _texture,
      // color: new Color("#C70000"),
      // opacity: 1,
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
    directionalLight = new DirectionalLight(0x80b5ff, 8);
    directionalLight.position.set(-26, 249, 33);
    scene.add(directionalLight);
    // 平行光助手
    const directLH = new DirectionalLightHelper(directionalLight, 5);
    scene.add(directLH);

    // 点光源
    pointLight = new PointLight(0x80d4ff, 22);
    pointLight.position.set(-105, -183, 151);
    scene.add(pointLight);
    // 点光源助手
    const pointLightHelper = new PointLightHelper(pointLight, 15);
    scene.add(pointLightHelper);

    // 半球光
    hemisphereLight = new HemisphereLight(0xffffff, 0x3d6399, 1.5);
    hemisphereLight.position.set(300, -360, -518);
    scene.add(hemisphereLight);
    // 半球光助手
    const hemisLH = new HemisphereLightHelper(hemisphereLight, 15);
    scene.add(hemisLH);

    // 环境光
    ambientLight = new AmbientLight(0x002bff, 0.8);
    scene.add(ambientLight);
  }

  // 添加监听
  addEventFun() {
    //事件监听
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  // 控制波动
  addGui() {
    let gui = new dat.GUI();
    let cameraFolder = gui.addFolder("相机");
    cameraFolder.add(camera.position, "x").min(-800).max(800).step(1).name("x");
    cameraFolder.add(camera.position, "y").min(-800).max(800).step(1).name("y");
    cameraFolder.add(camera.position, "z").min(-800).max(800).step(1).name("z");

    let lightFolder = gui.addFolder("灯光");
    // 平行光
    lightFolder.add(directionalLight.position, "x").min(-800).max(800).step(1).name("平行光_x");
    lightFolder.add(directionalLight.position, "y").min(-800).max(800).step(1).name("平行光_y");
    lightFolder.add(directionalLight.position, "z").min(-800).max(800).step(1).name("平行光_z");
    lightFolder.add(directionalLight, "intensity").min(0).max(80).step(1).name("平行光_强度");
    //添加gui颜色控件按钮
    lightFolder.addColor(directionalLight, "color").onChange((val: any) => {
      directionalLight.color = new Color(val);
      console.log("directionalLight", directionalLight);
    });
    // 点光源
    lightFolder.add(pointLight.position, "x").min(-800).max(800).step(1).name("点光源_x");
    lightFolder.add(pointLight.position, "y").min(-800).max(800).step(1).name("点光源_y");
    lightFolder.add(pointLight.position, "z").min(-800).max(800).step(1).name("点光源_z");
    lightFolder.add(pointLight, "intensity").min(0).max(80).step(1).name("点光源_强度");
    //添加gui颜色控件按钮
    lightFolder.addColor(pointLight, "color").onChange((val: any) => {
      pointLight.color = new Color(val);
      console.log("pointLight", pointLight);
    });
    // 半球光
    lightFolder.add(hemisphereLight.position, "x").min(-800).max(800).step(1).name("半球光_x");
    lightFolder.add(hemisphereLight.position, "y").min(-800).max(800).step(1).name("半球光_y");
    lightFolder.add(hemisphereLight.position, "z").min(-800).max(800).step(1).name("半球光_z");
    lightFolder.add(hemisphereLight, "intensity").min(0).max(80).step(1).name("半球光_强度");
    //添加gui颜色控件按钮
    lightFolder.addColor(hemisphereLight, "color").onChange((val: any) => {
      hemisphereLight.color = new Color(val);
      console.log("hemisphereLight", hemisphereLight);
    });
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

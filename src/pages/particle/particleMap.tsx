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
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any;
let group: Group, textureLoader: TextureLoader;
let satelliteGroup: any,
  radius: number = 5,
  groupDots: any;
/**
 * 绚丽地球
 * https://joy1412.cn/pages/threejsearth/#%E5%8A%A8%E6%80%81%E6%98%9F%E7%A9%BA%E8%83%8C%E6%99%AF%E4%BB%8B%E7%BB%8D
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

  init = () => {
    clock = new Clock();
    container = document.getElementById("container");
    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器的输出编码
    // renderer.outputEncoding = sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 生成场景
    scene = new Scene();
    scene.background = new Color(0x020924);
    scene.fog = new Fog(0x020924, 200, 1000);
    // 透视相机
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(5, -20, 200);
    // camera.position.set(-44.71, -173.71829664983076, 90.81687760650826);

    camera.lookAt(0, 3, 0);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2;
    controls.enablePan = true;
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });
    group = new Group();
    satelliteGroup = new Group();
    textureLoader = new TextureLoader();

    this.initLight();
    this.addEventFun();
    // 星空背景
    this.initPoint();
    // 地球
    this.initEarth();
    // 光晕
    this.initHALO();
    // 光圈
    this.initAperture();
    // 卫星
    this.initSatellite();
  };

  initLight() {
    const ambientLight = new AmbientLight(0xcccccc, 1.1);
    scene.add(ambientLight);
    var directionalLight = new DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(1, 0.1, 0).normalize();
    var directionalLight2 = new DirectionalLight(0xff2ffff, 0.2);
    directionalLight2.position.set(1, 0.1, 0.1).normalize();
    scene.add(directionalLight);
    scene.add(directionalLight2);
    var hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.2);
    hemiLight.position.set(0, 1, 0);
    scene.add(hemiLight);
    var directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(1, 500, -20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 18;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -52;
    directionalLight.shadow.camera.right = 12;
    scene.add(directionalLight);
  }

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

    const textureLoader = new TextureLoader();
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
    // scene.add(stars);
  }

  // 地球模型
  initEarth() {
    textureLoader.load("/textures/other/earth2.jpg", (texture) => {
      const globeGgeometry = new SphereGeometry(50, 100, 100);
      const globeMaterial = new MeshStandardMaterial({ map: texture, color: new Color("#ffffff"), opacity: 1 });
      const globeMesh = new Mesh(globeGgeometry, globeMaterial);

      group.rotation.set(0.5, 2.9, 0.1);
      group.add(globeMesh);
      scene.add(group);
    });
  }

  // 光晕效果
  initHALO() {
    const texture = textureLoader.load("/textures/other/aperture.jpg");
    const spriteMaterial = new SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.23,
      depthWrite: false,
    });
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(50 * 3, 32 * 3, 1);
    group.add(sprite);
  }

  // 卫星 * 2
  initSatellite() {
    const texture = textureLoader.load("/textures/other/satellite3.png");
    // 设置两个卫星坐标
    const p1 = new Vector3(-40, 65, 0);
    const p2 = new Vector3(13, 0, 0);
    const points = [p1, p2];
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new PointsMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide,
      // 图片太小，一直没看到效果，原来是这里控制，其实就是粒子大小
      size: 13, // 显示大小控制
      depthWrite: false,
      // color: new Color("#ffffff"),
    });
    const earthPoints = new Points(geometry, material);
    satelliteGroup.add(earthPoints);

    earthPoints.position.x = 80;
    satelliteGroup.rotation.set(1.9, 0.5, 1);
  }

  // 光圈
  initAperture() {
    textureLoader.load("/textures/other/quan.png", (texture) => {
      const geometry = new PlaneGeometry(180, 180);
      const material = new MeshLambertMaterial({
        map: texture,
        transparent: true, // 很重要, 使用背景透明的png贴图，注意开启透明计算
        // side: DoubleSide, // 双面可见
        depthWrite: false, // 禁止写入深度缓冲区数据
      });
      const mesh = new Mesh(geometry, material);
      satelliteGroup.add(mesh);
      scene.add(satelliteGroup);
      scene.add(mesh);
    });
  }

  initLightPillar() {
    // var e = (new r.xc).load(u)
    //   , n = this;
    const _self = this;
    [
      {
        lng: 86.39895905468748,
        lat: 45.15923349468924,
      },
      {
        lng: 106.54041,
        lat: 29.40268,
      },
    ].forEach((item) => {
      console.log("item", this.lglt2xyz(item.lng, item.lat));
      // const r = this.lglt2xyz(item.lng, item.lat),
      //   i = this.createLightPillar(r);
      //   groupDots.add(i);
      // const a = this.createLightWaveMesh(r, e);
      // i.add(a);
    });
  }

  create() {
    const plane = new PlaneGeometry(50, 200);
    const material = new MeshPhongMaterial({
      //设置矩形网格模型的纹理贴图(光柱特效)
      map: textureLoader.load("光柱.png"),
      // 双面显示
      side: DoubleSide,
      // 开启透明效果，否则颜色贴图map的透明不起作用
      transparent: true,
    });
    const mesh = new Mesh(plane, material);
    scene.add(mesh);
  }

  lglt2xyz(lng: number, lat: number) {
    const theta = (90 + lng) * (Math.PI / 180);
    const phi = (90 - lat) * (Math.PI / 180);
    return new Vector3().setFromSpherical(new Spherical(radius, phi, theta));
  }

  createPointMesh(pos: any, texture: any) {
    const planGeometry = new PlaneGeometry(180, 180);
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true, //使用背景透明的png贴图，注意开启透明计算
      // side: THREE.DoubleSide, //双面可见
      depthWrite: false, //禁止写入深度缓冲区数据
    });
    var mesh = new Mesh(planGeometry, material);
    var size = 5 * 0.04; //矩形平面Mesh的尺寸
    mesh.scale.set(size, size, size); //设置mesh大小
    //设置mesh位置
    mesh.position.set(pos.x, pos.y, pos.z);
    // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
    var coordVec3 = new Vector3(pos.x, pos.y, pos.z).normalize();
    // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
    var meshNormal = new Vector3(0, 0, 1);
    // 四元数属性.quaternion表示mesh的角度状态
    //.setFromUnitVectors();计算两个向量之间构成的四元数值
    mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
    return mesh;
  }

  // 添加监听
  addEventFun() {
    //事件监听
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  // 控制波动
  addGui() {
    let gui = new dat.GUI();
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

    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container"></div>;
  }
}

import { Component } from "react";
// import LegacyJSONLoader from "@/assets/particle/LegacyJSONLoader";
import * as dat from "lil-gui";
import {
  WebGLRenderer,
  PerspectiveCamera,
  PCFShadowMap,
  Clock,
  Color,
  Fog,
  // VertexColors,
  AdditiveBlending,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  // 星空
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  sRGBEncoding,
  TextureLoader,
  Vector3,
  // 灯光
  DirectionalLight,
  DirectionalLightHelper,
  PointLight,
  PointLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  AmbientLight,
  //  绘制世界轮廓
  BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  // 标注
  PlaneGeometry,
  MathUtils,
  Spherical,
  // 线
  ShaderMaterial,
  CubicBezierCurve3,
  Line,
  LineDashedMaterial,
  Ray,
  // 点击
  Raycaster,
  Vector2,
} from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import TWEEN from "@tweenjs/tween.js";
import VertexShader from "./map/vertex.glsl";
import FragmentShader from "./map/fragment.glsl";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

//引入国家边界数据
import pointArr from "./map/world";

//
let container: any,
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  render2d: CSS2DRenderer,
  clock: any;
let controls: any;
let earthGroup: Group, group: Group, textureLoader: TextureLoader;

let PiontAnimationArr: any[];

let earthMesh: any; // 地图
const radius = 14; // 圆半径
let sprite: any, // 光晕对象
  obj = {
    scale: 3.928, // 光晕缩放
  },
  cityGroup: Group, // 城市数组
  cityWaveMeshGroup: Mesh[] = []; // 波动圈数组

// 灯光
let directionalLight: DirectionalLight,
  pointLight: PointLight,
  hemisphereLight: HemisphereLight,
  ambientLight: AmbientLight;

// 线
let linesMaterial: ShaderMaterial[] = [], // 飞线材质数组，主要区分颜色
  linesGroup: any,
  lineTime = 0;

// 城市数据
const cityList = {
  北京: { name: "北京", longitude: 116.3, latitude: 39.9 },
  上海: { name: "上海", longitude: 121, latitude: 31.0 },
  西安: { name: "西安", longitude: 108, latitude: 34 },
  成都: { name: "成都", longitude: 103, latitude: 31 },
  乌鲁木齐: { name: "乌鲁木齐", longitude: 87.0, latitude: 43.0 },
  拉萨: { name: "拉萨", longitude: 91.06, latitude: 29.36 },
  广州: { name: "广州", longitude: 113.0, latitude: 23.06 },
  哈尔滨: { name: "哈尔滨", longitude: 127.0, latitude: 45.5 },
  沈阳: { name: "沈阳", longitude: 123.43, latitude: 41.8 },
  武汉: { name: "武汉", longitude: 114.0, latitude: 30.0 },
  海口: { name: "海口", longitude: 110.0, latitude: 20.03 },
  纽约: { name: "纽约", longitude: -74.5, latitude: 40.5 },
  伦敦: { name: "伦敦", longitude: 0.1, latitude: 51.3 },
  巴黎: { name: "巴黎", longitude: 2.2, latitude: 48.5 },
  开普敦: { name: "开普敦", longitude: 18.25, latitude: -33.5 },
  悉尼: { name: "悉尼", longitude: 151.1, latitude: -33.51 },
  东京: { name: "东京", longitude: 139.69, latitude: 35.69 },
  里约热内卢: { name: "里约热内卢", longitude: -43.11, latitude: -22.54 },
};

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

    // 灯光
    this.initLight();

    //
    textureLoader = new TextureLoader();
    earthGroup = new Group();
    // 星空
    this.initPoint();
    // 地球
    this.initEarth();
    // 绘制世界轮廓
    this.drawOutline();
    // 大气层光晕
    this.initHALO(obj.scale);
    // 云层
    this.addEarthClouds();
    // 标注
    // const _data = this.lon2xyz(radius, 116.2, 39.55);
    // console.log("_data", _data);
    cityGroup = new Group();
    cityGroup.renderOrder = 3;

    earthGroup.add(cityGroup);
    scene.add(earthGroup);

    // 城市点位标注
    // console.log(Object.values(cityList));
    Object.values(cityList).forEach((item) => {
      // console.log("cityMark", item.name, this.lon2xyz(radius, item.longitude, item.latitude));
      this.cityMark(item);
    });

    // 点击
    window.addEventListener("click", this.getObj);
    window.addEventListener("onmouseover", this.getObj);

    // 旋转地球到中国位置
    this.positioningChina();

    // 飞线
    const LineData: { _from: string; _to: string }[] = [
      {
        _from: "开普敦",
        _to: "巴黎",
      },

      {
        _from: "悉尼",
        _to: "东京",
      },
      {
        _from: "伦敦",
        _to: "纽约",
      },
      {
        _from: "拉萨",
        _to: "巴黎",
      },
      {
        _from: "北京",
        _to: "乌鲁木齐",
      },
      {
        _from: "哈尔滨",
        _to: "海口",
      },
      {
        _from: "广州",
        _to: "上海",
      },
      {
        _from: "广州",
        _to: "东京",
      },
      {
        _from: "东京",
        _to: "西安",
      },
    ];

    linesGroup = new Group();
    LineData.map((item) => {
      console.log(item);
      this.addFlyLine(item);
    });
    // this.addFlyLine(LineData[0]);
    earthGroup.add(linesGroup);

    // console.log("cityWaveMeshGroup", cityWaveMeshGroup);
    this.addGui();
  };

  /**
   * 定位到中国位置显示
   * 旋转地球到中国位置, 且放大
   */
  positioningChina() {
    const startRotateY = (3.15 * Math.PI) / 2;
    const startZoom = -18;
    const endRotateY = 3.3 * Math.PI;
    const endZoom = 4;
    const _anim = new TWEEN.Tween({
      rotateY: startRotateY,
      zoom: startZoom,
    })
      .to({ rotateY: endRotateY, zoom: endZoom }, 3000) //.to({rotateY: endRotateY, zoom: endZoom}, 10000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function (object: any) {
        if (earthGroup) {
          earthGroup.rotation.set(0, object.rotateY, 0);
          _anim2.start(3200);
        }
      });

    _anim.start();

    const _anim2 = new TWEEN.Tween(earthGroup.scale)
      .to({ x: 2, y: 2, z: 2 }, 5000) //.to({rotateY: endRotateY, zoom: endZoom}, 10000)
      .easing(TWEEN.Easing.Quintic.Out)
      .onUpdate(function (object: any) {
        // TWEEN.remove(_anim);
        // TWEEN.remove(_anim2);
      });
  }

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
    const earthGgeometry = new SphereGeometry(radius, 100, 100);
    const earthMaterial = new MeshLambertMaterial({
      map: _texture,
      // color: new Color("#C70000"),
      // opacity: 1,
    });
    earthMesh = new Mesh(earthGgeometry, earthMaterial);
    earthMesh.renderOrder = 1;
    earthGroup.add(earthMesh);
    scene.add(earthGroup);
  }

  /**
   * 绘制世界轮廓 -> 两点绘制贝塞尔曲线的方法
   * threejs 通过 LineLoop 和世界点数据，可以绘制多边形 -> 利用此原理绘制国家边界
   * LineLoop和Line功能一样，区别在于首尾顶点相连，轮廓闭合，
   * 但是绘制条数太多会用性能问题，LineSegments 是一条线绘制，提高性能，需要复制顶点
   */
  drawOutline() {
    // 创建一个Buffer类型几何体对象
    const geometry = new BufferGeometry();
    // 类型数组创建顶点数据
    const vertices = new Float32Array(pointArr);
    // 创建属性缓冲区对象, 3个为一组，表示一个顶点的 xyz 坐标
    const attribute = new BufferAttribute(vertices, 3);
    // 设置几何体attributes属性的位置属性
    geometry.attributes.position = attribute;
    // 线条渲染几何体顶点数据, 材质对象
    const material = new LineBasicMaterial({
      color: 0x7aa5a5, //线条颜色
      // color: 0xc90000,
    });
    let line = new LineSegments(geometry, material); //间隔绘制直线
    const _radius = radius + 0.01;
    line.scale.set(_radius, _radius, _radius); // 对应球面半径是1，需要缩放R倍
    line.renderOrder = 2;
    earthGroup.add(line);
  }

  /**
   * 大气层光晕
   */
  initHALO(scale: number) {
    const texture = textureLoader.load("/textures/other/aperture.jpg");
    const spriteMaterial = new SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.23,
      depthWrite: false,
    });
    sprite = new Sprite(spriteMaterial);
    sprite.scale.set(radius * obj.scale, radius * obj.scale, 1);
    scene.add(sprite);
  }

  /**
   * 添加地球云层
   */
  addEarthClouds() {
    const _texture = textureLoader.load("/textures/3dmap/earth_cloud.png");
    const earthCludsGgeometry = new SphereGeometry(radius, 100, 100);
    const earthCludsMaterial = new MeshLambertMaterial({
      map: _texture,
      transparent: true,
      opacity: 0.67,
      blending: AdditiveBlending,
    });
    const earthMesh = new Mesh(earthCludsGgeometry, earthCludsMaterial);
    earthMesh.renderOrder = 2;
    earthGroup.add(earthMesh);
  }

  /**
   * 处理地理位置：经纬度转换
   * 方法1 ---------------
   */
  lon2xyz(_radius: number, longitude: number, latitude: number) {
    // fun1
    // let long = (longitude * Math.PI) / 180; //转弧度值
    // const lat = (latitude * Math.PI) / 180; //转弧度值

    // fun2
    let long = MathUtils.degToRad(longitude);
    const lat = MathUtils.degToRad(latitude); // 获取x，y，z坐标

    long = -long; // three.js坐标系z坐标轴对应经度-90度，而不是90度
    // 经纬度坐标转球面坐标计算公式
    const x = _radius * Math.cos(lat) * Math.cos(long);
    const y = _radius * Math.sin(lat);
    const z = _radius * Math.cos(lat) * Math.sin(long);
    // 返回球面坐标
    return {
      x: x,
      y: y,
      z: z,
    };
  }

  // 处理地理位置：经纬度转换 -> 有问题
  lglt2xyz(lng: number, lat: number) {
    const theta = (90 + lng) * (Math.PI / 180);
    const phi = (90 - lat) * (Math.PI / 180);
    return new Vector3().setFromSpherical(new Spherical(radius, phi, theta));
  }

  /**
   * 城市位置标注
   * PlaneBufferGeometry：已废弃
   */
  cityMark(cityData: any) {
    const data = this.lon2xyz(radius, cityData.longitude, cityData.latitude);
    console.log("cityData", cityData);

    const cityGeometry = new PlaneGeometry(1, 1); // 默认在XOY平面上

    // 城市点添加 -> 黄圈点
    // const _pointTexure = textureLoader.load("/textures/3dmap/point.png");
    const _pointTexure = textureLoader.load("/textures/other/dian.png");
    const cityPointMaterial = new MeshBasicMaterial({
      color: 0xffc300,
      map: _pointTexure,
      transparent: true,
      depthWrite: false, // 禁止写入缓冲区数据
    });
    let cityMesh = new Mesh(cityGeometry, cityPointMaterial);
    // // 设置 mesh 大小
    const _size = radius * 0.04;
    cityMesh.name = cityData.name;
    cityMesh.scale.set(_size, _size, _size);

    // 光圈
    const _texture = textureLoader.load("/textures/3dmap/wave.png");
    // 如果不同mesh材质的透明度、颜色等属性同一时刻不同，材质不能共享
    const cityWaveMaterial = new MeshBasicMaterial({
      color: 0x22ffcc,
      map: _texture,
      transparent: true, // ！注意：使用背景透明的图片，开启透明计算
      side: DoubleSide, // 双面可见
      depthWrite: false, // 禁止写入深度缓冲数据
    });
    let cityWaveMesh: any = new Mesh(cityGeometry, cityWaveMaterial);
    // 矩形平面Mesh的尺寸
    const _size2 = radius * 0.06;
    // 自定义属性: size，表示 mesh 静态大小
    (cityWaveMesh as any).size = _size2;
    // 设置mesh大小
    cityWaveMesh.scale.set(_size2, _size2, _size2);
    /**
     * 自定义属性: _s
     * 表示mesh在原始大小基础上放大倍数
     * 光圈在原来mesh.size基础上1~2倍之间变化
     * 用于涟漪效果
     */
    cityWaveMesh._s = Math.random() + 1.0;

    // 设置位置点
    cityWaveMesh.position.set(data.x, data.y, data.z);
    cityMesh.position.set(data.x, data.y, data.z);

    this.setPointPosition(data, cityMesh, cityWaveMesh);

    cityMesh.renderOrder = 3;
    cityWaveMesh.renderOrder = 3;

    cityGroup.add(cityMesh);
    cityGroup.add(cityWaveMesh);
    cityWaveMeshGroup.push(cityWaveMesh);
  }

  /**
   * 地球上的点，贴合地图 
   * 
   * mesh 设置
   * 1. mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
   * 2. mesh默认在XOY平面上，法线方向沿着z轴 new THREE.Vector3(0, 0, 1)
   * 3. 四元数属性.quaternion表示mesh的角度状态
          .setFromUnitVectors();计算两个向量之间构成的四元数值
   */
  setPointPosition(data: { x: number; y: number; z: number }, cityMesh: Mesh, cityWaveMesh: Mesh) {
    const coordVec3 = new Vector3(data.x, data.y, data.z).normalize();
    // console.log("coordVec3", data, coordVec3);
    const meshNormal = new Vector3(0, 0, 1);
    cityMesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
    cityWaveMesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  }

  /**
   * 标注点涟漪动画
   * 显示，逐渐放大，消失 -> 重复
   */
  cityWaveAnimate = (waveMeshArr: Mesh[]) => {
    // 所有波动光圈都有自己的透明度和大小状态
    // 一个波动光圈透明度变化过程是：0~1~0反复循环
    waveMeshArr.forEach(function (mesh: any) {
      mesh._s += 0.007;
      mesh.scale.set(mesh.size * mesh._s, mesh.size * mesh._s, mesh.size * mesh._s);
      // console.log("mesh._s", mesh._s, mesh.size * mesh._s);
      if (mesh._s <= 1.5) {
        mesh.material.opacity = (mesh._s - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
      } else if (mesh._s > 1.5 && mesh._s <= 2) {
        mesh.material.opacity = 1 - (mesh._s - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
      } else {
        mesh._s = 1.0;
      }
    });
  };

  /**
   * 飞线方案1： 贝塞尔曲线 -> 通过两点绘制
   * 添加点与点之间的飞线
   * https://blog.csdn.net/lilycheng1986/article/details/124997460
   */
  addFlyLine(_data: { _from: string; _to: string }) {
    const from: { name: string; longitude: number; latitude: number } = cityList[_data._from];
    const to: { name: string; longitude: number; latitude: number } = cityList[_data._to];
    // 飞线材质
    const material = new ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        time: {
          value: 0,
        },
        colorB: { value: new Color("#E54674") },
        colorA: { value: new Color("#16BDFF") },
      },
    });
    // linesMaterial.push(material);

    // 获取位置
    const pos = this.lon2xyz(radius, from.longitude, from.latitude);
    const pos1 = this.lon2xyz(radius, to.longitude, to.latitude);
    // 转为三维向量
    const _posStart = new Vector3(pos.x, pos.y, pos.z);
    const _posEnd = new Vector3(pos1.x, pos1.y, pos1.z);

    /**
     * 1. 计算两个向量的夹角
     * 2. 计算法向量: THREE.Ray(v1,v2) 向量 v1 v2 缩成方向的法向量
     *    const rayLine = new THREE.Ray(p0,getVCenter(v0.clone(),v3.clone()));
     *    圆点与向量v0,v3的终点形成的垂直于向量v0v3的向量
     * 3. 计算中间点
     * 4. 通过 CubicBezierCurve3 形成路径
     */
    var angle = (_posStart.angleTo(_posEnd) * 1.8) / Math.PI / 0.1; // 0~Math.PI
    let aLen = angle * 0.8,
      hLen = angle * angle * 15;
    // 用于求两点形成的向量的法向量
    const _p0 = new Vector3(0, 0, 0);
    // ray的at方法修改了，必须要两个参数, 只需要增加一个临时变量来充当at方法的target 参数即可
    const temp = new Vector3(0, 0, 0);
    /**
     * 法线向量：THREE.Ray(v1,v2) 向量v1v2缩成方向的法向量
     * 圆点与向量v0,v3的终点形成的垂直于向量v0v3的向量
     */
    const rayLine = new Ray(_p0, this.getVCenter(_posStart.clone(), _posEnd.clone()));
    // 顶点坐标
    const vtop = rayLine.at(hLen / rayLine.at(1, temp).distanceTo(_p0), temp);
    // 控制点坐标
    var _posMiddle1 = this.getLenVcetor(_posStart.clone(), vtop, aLen);
    var _posMiddle2 = this.getLenVcetor(_posEnd.clone(), vtop, aLen);

    // 贝塞尔曲线: 起点，控制点1，控制点2， 终点
    var curve = new CubicBezierCurve3(_posStart, _posMiddle1, _posMiddle2, _posEnd);
    console.log("curve", _posStart, _posMiddle1, _posMiddle2, _posEnd);
    const points = curve.getPoints(150);
    let geometry = new BufferGeometry().setFromPoints(points);
    const _material = new LineDashedMaterial({
      // vertexColors: true,
      transparent: true,
      side: DoubleSide,
      linewidth: 50,
      color: 0xffc700,
      scale: 1,
      dashSize: 3,
      gapSize: 1,
    });

    // 输出网格
    const line = new Line(geometry, _material);
    // console.log("line", line);
    linesGroup.add(line);
  }

  // 计算v1,v2 的中点
  getVCenter(v1: any, v2: any) {
    let v = v1.add(v2);
    return v.divideScalar(2);
  }

  // 计算V1，V2向量固定长度的点
  getLenVcetor(v1: any, v2: any, len: any) {
    let v1v2Len = v1.distanceTo(v2);
    console.log("v1v2Len", v1v2Len);
    return v1.lerp(v2, len / v1v2Len);
  }

  /**
   * 飞线方案2：B线条
   */

  /**
   * 点击事件
   * @param event
   */
  getObj(event: any) {
    //屏幕坐标转标准设备坐标 event.view.pageXOffset pageYOffset
    const width = event.offsetX / window.innerWidth;
    const height = event.offsetY / window.innerHeight;
    const x = width * 2 - 1;
    const y = -height * 2 + 1;
    const raycaster = new Raycaster();
    // 通过摄像机和鼠标位置更新射线, 点击位置生成raycaster的射线ray
    raycaster.setFromCamera(new Vector2(x, y), camera);

    // Object click listener
    const intersectsObjects = raycaster.intersectObjects(cityGroup.children);
    if (intersectsObjects.length > 0) {
      const selectedModel = intersectsObjects[0].object;
      console.log("selectedModel", selectedModel.name, selectedModel);
    }
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
    pointLight = new PointLight(0x11425a, 22);
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

    let lightFolder2 = gui.addFolder("点光源");
    lightFolder2.add(pointLight.position, "x").min(-800).max(800).step(1).name("点光源_x");
    lightFolder2.add(pointLight.position, "y").min(-800).max(800).step(1).name("点光源_y");
    lightFolder2.add(pointLight.position, "z").min(-800).max(800).step(1).name("点光源_z");
    lightFolder2.add(pointLight, "intensity").min(0).max(80).step(1).name("点光源_强度");
    lightFolder2.addColor(pointLight, "color").onChange((val: any) => {
      pointLight.color = new Color(val);
      console.log("pointLight", pointLight);
    });

    let lightFolder3 = gui.addFolder("半球光");
    lightFolder3.add(hemisphereLight.position, "x").min(-800).max(800).step(1).name("半球光_x");
    lightFolder3.add(hemisphereLight.position, "y").min(-800).max(800).step(1).name("半球光_y");
    lightFolder3.add(hemisphereLight.position, "z").min(-800).max(800).step(1).name("半球光_z");
    lightFolder3.add(hemisphereLight, "intensity").min(0).max(80).step(1).name("半球光_强度");
    lightFolder3.addColor(hemisphereLight, "color").onChange((val: any) => {
      hemisphereLight.color = new Color(val);
      console.log("hemisphereLight", hemisphereLight);
    });

    cameraFolder.close();
    lightFolder.close();
    lightFolder2.close();
    lightFolder3.close();

    let otherFolder = gui.addFolder("其他");
    otherFolder.add(sprite.scale, "x").min(0).max(80).step(1).name("光晕缩放_x");
    otherFolder.add(sprite.scale, "y").min(0).max(80).step(1).name("光晕缩放_y");
    //   otherFolder.add(line.scale, "x").min(0).max(8).step(0.1).name("标注_x");
    //   otherFolder.add(line.scale, "y").min(-300).max(800).step(0.1).name("标注_y");
    //   otherFolder.add(line.scale, "z").min(-300).max(800).step(0.1).name("标注_y");
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
    TWEEN.update(); // !!!

    // 光圈标注动画
    if (cityWaveMeshGroup?.length) {
      this.cityWaveAnimate(cityWaveMeshGroup);
    }

    //飞线颜色变化
    if (linesGroup?.children?.length > 0) {
      if (lineTime >= 1.0) {
        lineTime = 0.0;
      } else {
        lineTime += 0.005;
      }
      linesMaterial.forEach((m) => {
        m.uniforms.time.value = lineTime;
      });
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

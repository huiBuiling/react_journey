import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { AxesHelper, LineBasicMaterial, Vector2 } from "three";

let canvas: any;
let scene: any, camera: any, renderer: any;
/**
 * 顶点索引.index
 *  const indexes = new Uint16Array([
      // 0对应第1个顶点位置数据、第1个顶点法向量数据
      // 1对应第2个顶点位置数据、第2个顶点法向量数据
      // 索引值3个为一组，表示一个三角形的3个顶点
      0, 1, 2, 0, 2, 3,
    ]);
    // 索引数据赋值给几何体的index属性
    geometry.index = new THREE.BufferAttribute(indexes, 1); //1个为一组
 */
export default class Stu extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    // 辅助坐标系
    var axesHelper = new THREE.AxesHelper(250);
    scene.add(axesHelper);

    // 使用点材质
    // this.usePointsMaterial();
    // 使用基础线材质
    // this.useLineBasicMaterial();
    // 使用虚线材质
    // this.useLineDashedMaterial();
    // 使用 高光网格材质
    this.useMeshLambertMaterial();

    /**
     * 相机设置
     */
    var width = window.innerWidth; //窗口宽度
    var height = window.innerHeight; //窗口高度

    // 创建相机对象
    camera = new THREE.PerspectiveCamera(75, width / height, 1, 100);
    camera.position.set(-30, 45, 35); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

    /**
     * 创建渲染器对象
     */
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height); //设置渲染区域尺寸
    renderer.setClearColor(0x111111, 1); //设置背景颜色

    // 启用阴影
    renderer.shadowMap.enabled = true;

    const axes = new AxesHelper(100);
    // 设置不同线的颜色
    // axes.setColors(0xf0f8ff, 0xfaebd7, 0x00ffff);
    scene.add(axes);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // 执行渲染操作   指定场景、相机作为参数
    renderer.render(scene, camera);

    // CTRL
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画
  };

  /**
   * 创建点模型
   * PointsMaterial 点材质
   * SphereGeometry 球体几何对象
   * Points 用于显示点的类
   */
  usePointsMaterial = () => {
    const _geometry = new THREE.SphereGeometry(30, 25, 25);
    const material = new THREE.PointsMaterial({
      color: 0xff2288,
      size: 3, //点渲染尺寸
    });

    let point_cube = new THREE.Points(_geometry, material); // 网格模型对象Mesh
    scene.add(point_cube); // 网格模型添加到场景中
  };

  /**
   * 创建网格模型
   * 高光网格材质: MeshPhongMaterial
   * Line等线模型: Line
   * computeLineDistances： 计算LineDashedMaterial所需的距离数组
   */
  useMeshLambertMaterial = () => {
    const _geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const _material = new THREE.MeshPhongMaterial({
      color: 0x049ef4,
      specular: 0x444444, //高光部分的颜色
      shininess: 20, //高光部分的亮度，默认30
    });
    const lam_cube = new THREE.Mesh(_geometry, _material);
    scene.add(lam_cube);

    this.addLight();
  };

  addLight = () => {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    // 点光源
    const spotLight = new THREE.SpotLight(0xffffff);
    // 设置位置
    spotLight.position.set(-60, 40, -65);
    // 启用阴影
    spotLight.castShadow = true;
    spotLight.shadow.mapSize = new Vector2(1024, 1024);
    spotLight.shadow.camera.far = 130;
    spotLight.shadow.camera.near = 40;
    scene.add(spotLight);
  };

  /**
   * 创建Line等线模型
   * 基础线材质: LineBasicMaterial
   * Line等线模型: Line
   */
  useLineBasicMaterial = () => {
    const _geometry = new THREE.SphereGeometry(30, 25, 25);
    const _material = new LineBasicMaterial({
      color: 0xff2288,
    });
    const line_cube = new THREE.Line(_geometry, _material);
    scene.add(line_cube);
  };

  /**
   * 创建Line等线模型
   * 虚线材质: LineBasicMaterial
   * Line等线模型: Line
   * computeLineDistances： 计算LineDashedMaterial所需的距离数组
   */
  useLineDashedMaterial = () => {
    // const _geometry = new THREE.SphereGeometry(60, 10, 10);
    const _geometry = this.box(30, 30, 30);
    const _material = new THREE.LineDashedMaterial({
      color: 0xffaa00,
      dashSize: 3, //显示线段的大小。默认为3。
      gapSize: 1, //间隙的大小。默认为1
    });
    const line_cube = new THREE.LineSegments(_geometry, _material);
    line_cube.computeLineDistances();

    console.log("computeLineDistances方法", line_cube.computeLineDistances());
    scene.add(line_cube);
  };

  box = (width: number, height: number, depth: number) => {
    (width = width * 0.5), (height = height * 0.5), (depth = depth * 0.5);

    const geometry = new THREE.BufferGeometry();
    const position = [];

    position.push(
      -width,
      -height,
      -depth,
      -width,
      height,
      -depth,

      -width,
      height,
      -depth,
      width,
      height,
      -depth,

      width,
      height,
      -depth,
      width,
      -height,
      -depth,

      width,
      -height,
      -depth,
      -width,
      -height,
      -depth,

      -width,
      -height,
      depth,
      -width,
      height,
      depth,

      -width,
      height,
      depth,
      width,
      height,
      depth,

      width,
      height,
      depth,
      width,
      -height,
      depth,

      width,
      -height,
      depth,
      -width,
      -height,
      depth,

      -width,
      -height,
      -depth,
      -width,
      -height,
      depth,

      -width,
      height,
      -depth,
      -width,
      height,
      depth,

      width,
      height,
      -depth,
      width,
      height,
      depth,

      width,
      -height,
      -depth,
      width,
      -height,
      depth
    );

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
    return geometry;
  };

  animation = () => {
    renderer.render(scene, camera); //执行渲染操作
    requestAnimationFrame(this.animation.bind(this));
  };

  render() {
    return <div id="webgl"></div>;
  }
}

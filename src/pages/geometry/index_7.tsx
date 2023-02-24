import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let canvas: any, controls: any;
let scene: any, camera: any, renderer: any;
/**
 * 2.7 几何体旋转、缩放、平移变换
 */
export default class BaseWebgl_2 extends Component {
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

    this.addGeometryAttr();

    /**
     * 相机设置
     */
    var width = window.innerWidth; //窗口宽度
    var height = window.innerHeight; //窗口高度
    var k = width / height; // 窗口宽高比
    var s = 200; // 三维场景显示范围控制系数，系数越大，显示的范围越大

    // 创建相机对象
    camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
    camera.position.set(200, 300, 200); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

    /**
     * 创建渲染器对象
     */
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height); //设置渲染区域尺寸
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // 执行渲染操作   指定场景、相机作为参数
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画
  };

  addGeometryAttr = () => {
    var geometry = new THREE.BoxGeometry(100, 70, 100); //创建一个立方体几何对象Geometry

    console.log(geometry);
    // console.log("geometry", geometry.attributes);

    // 类型数组创建顶点颜色color数据
    var colors = new Float32Array([
      1,
      0,
      0, //顶点1颜色
      0,
      1,
      0, //顶点2颜色
      0,
      0,
      1, //顶点3颜色

      1,
      1,
      0, //顶点4颜色
      0,
      1,
      1, //顶点5颜色
      1,
      0,
      1, //顶点6颜色
    ]);

    // 设置几何体attributes属性的颜色color属性
    geometry.attributes.color = new THREE.BufferAttribute(colors, 3); //3个为一组,表示一个顶点的颜色数据RGB

    // 几何体xyz三个方向都放大2倍
    // geometry.scale(1.2, 1.5, 2);
    // 几何体沿着x轴平移50
    // geometry.translate(50, 0, 0);
    // 几何体绕着x轴旋转45度
    // geometry.rotateX(Math.PI / 4);
    // 居中：偏移的几何体居中
    // geometry.center();

    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff, // 三角面颜色
      side: THREE.DoubleSide, // 两面可见
      vertexColors: true,
    });

    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    // mesh.position.x = -20;
    // mesh.position.y = -10;
    mesh.position.x = 20;
    mesh.position.y = 20;
    mesh.position.z = -20;
    // 网格模型xyz方向分别缩放0.5,1.5,2倍
    mesh.scale.set(0.5, 1.5, 2);
    mesh.translateX(50);
    mesh.translateZ(50);
    mesh.rotateZ(50);
    scene.add(mesh); //网格模型添加到场景中
  };

  animation() {
    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

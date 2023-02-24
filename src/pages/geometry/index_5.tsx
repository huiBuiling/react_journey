import { Component } from "react";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

let canvas: any;
let scene: any, camera: any, renderer: any;
/**
 * 2.5 使用Vector3 设置对象顶点坐标
 * - 使用Float32Array等设置对象顶点坐标 较繁琐
 * - Vector3 -> geometry.setFromPoints
 */
export default class BaseWebgl_2 extends Component {
  componentDidMount() {
    this.init();
  }

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    // 辅助坐标系
    var axesHelper = new THREE.AxesHelper(250);
    scene.add(axesHelper);

    // this.addGeometryAttr();
    this.addGeometryAttr2();

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
  };

  // 使用Float32Array等设置对象顶点坐标
  addGeometryAttr = () => {
    /**
     * 创建网格模型
     */
    const _geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
    //类型数组创建顶点数据
    const vertices = new Float32Array([
      0,
      0,
      0, //顶点1坐标
      80,
      0,
      0, //顶点2坐标
      80,
      80,
      0, //顶点3坐标

      0,
      0,
      0, //顶点4坐标   和顶点1位置相同
      80,
      80,
      0, //顶点5坐标  和顶点3位置相同
      0,
      80,
      0, //顶点6坐标
    ]);
    // 创建属性缓冲区对象
    const attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
    // 设置几何体attributes属性的位置属性
    _geometry.attributes.position = attribue;

    // 前
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0x0000ff, // 三角面颜色 0x0000ff 0x000144
    //   side: THREE.DoubleSide, // 两面可见
    // });

    // 后
    const _normals = new Float32Array([
      0,
      0,
      1, //顶点1法向量
      0,
      0,
      1, //顶点2法向量
      0,
      0,
      1, //顶点3法向量

      0,
      0,
      1, //顶点4法向量
      0,
      0,
      1, //顶点5法向量
      0,
      0,
      1, //顶点6法向量
    ]);
    // 设置几何体attributes属性的位置normal属性
    // 3个为一组,表示一个顶点的法向量数据
    _geometry.attributes.normal = new THREE.BufferAttribute(_normals, 3);
    const material = new THREE.MeshLambertMaterial({
      color: 0x0000ff, // 三角面颜色
      side: THREE.DoubleSide, // 两面可见
    });

    const mesh = new THREE.Mesh(_geometry, material); //网格模型对象Mesh
    scene.add(mesh); //网格模型添加到场景中

    /**
     * 光源设置
     */
    //点光源
    var point = new THREE.PointLight(0xffffff);
    point.position.set(400, 200, 300); //点光源位置
    scene.add(point); //点光源添加到场景中
    //环境光
    var ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);
  };

  // 使用Vector3 设置对象顶点坐标
  addGeometryAttr2 = () => {
    /**
     * 创建网格模型
     */
    const _geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
    //类型数组创建顶点数据
    const p1 = new THREE.Vector3(0, 0, 0); //顶点1坐标
    const p2 = new THREE.Vector3(80, 0, 0); //顶点2坐标
    const p3 = new THREE.Vector3(80, 80, 0); //顶点3坐标
    // const p4 = new THREE.Vector3(0, 80, 0); //顶点4坐标
    // 顶点坐标添加到geometry对象
    _geometry.setFromPoints([p1, p2, p3]);

    // 前
    const _material = new THREE.MeshBasicMaterial({
      color: 0x0000ff, // 三角面颜色 0x0000ff 0x000144
      side: THREE.DoubleSide, // 两面可见
    });

    const mesh = new THREE.Mesh(_geometry, _material); //网格模型对象Mesh
    scene.add(mesh); //网格模型添加到场景中
  };

  render() {
    return <div id="webgl"></div>;
  }
}

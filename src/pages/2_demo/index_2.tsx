import { Component } from "react";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let canvas: any;
let scene: any, camera: any, renderer: any;
let geometry: any;
/**
 * 1. 几何体顶点颜色
 * 1_1. 每个顶点设置一种颜色
 * 1_2. vertexColors 渐变色
 */
export default class BaseWebgl_2 extends Component {
  componentDidMount() {
    this.init();
  }

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    /**
     * 创建网格模型
     */
    geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
    //类型数组创建顶点数据
    const vertices = new Float32Array([
      0,
      0,
      0, //顶点1坐标
      50,
      0,
      0, //顶点2坐标
      0,
      100,
      0, //顶点3坐标
      0,
      0,
      10, //顶点4坐标
      0,
      0,
      100, //顶点5坐标
      50,
      0,
      10, //顶点6坐标
    ]);
    // 创建属性缓冲区对象
    var attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
    // 设置几何体attributes属性的位置属性
    geometry.attributes.position = attribue;

    // 自定义几何体 vertexColors 渐变色
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff, // 三角面颜色
      side: THREE.DoubleSide, // 两面可见
      // vertexColors: true,
    });
    // 渐变色
    material.vertexColors = true;

    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    scene.add(mesh); //网格模型添加到场景中

    this.addPointClolr();
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

  // 1_1. 每个顶点设置一种颜色
  addPointClolr = () => {
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

    const _material2 = new THREE.PointsMaterial({
      // color: 0xff0000,
      vertexColors: true, // 以顶点颜色为准
      size: 10.0, //点对象像素尺寸
    }); //材质对象
    var points = new THREE.Points(geometry, _material2); //点模型对象
    scene.add(points); //点对象添加到场景中
  };

  render() {
    return <div id="webgl"></div>;
  }
}

import { Component } from "react";
import * as THREE from "three";

let canvas: any;
let scene: any, camera: any, renderer: any;
let material: any, geometry: any, mesh: any;

/**
 * 基础几何体显示
 * + 动画
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
    // var geometry = new THREE.SphereGeometry(60, 40, 40); //创建一个球体几何对象
    geometry = new THREE.BoxGeometry(100, 100, 100); //创建一个立方体几何对象Geometry
    material = new THREE.MeshLambertMaterial({
      color: 0x0000ff,
    }); // 材质对象Material
    mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    scene.add(mesh); //网格模型添加到场景中

    /**
     * 光源设置
     */
    // 点光源
    var point = new THREE.PointLight(0xffffff);
    point.position.set(400, 200, 300); //点光源位置
    scene.add(point); //点光源添加到场景中
    // 环境光
    var ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);
    // console.log(scene)
    // console.log(scene.children)

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
    // renderer.render(scene, camera);

    this.animation();
  };

  animation = () => {
    renderer.render(scene, camera); // 执行渲染操作
    mesh.rotateY(0.01); // 每次绕y轴旋转0.01弧度
    requestAnimationFrame(this.animation.bind(this)); // 请求再次执行渲染函数render
  };

  render() {
    return <div id="webgl"></div>;
  }
}

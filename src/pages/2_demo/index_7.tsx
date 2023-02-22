import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let canvas: any, clock: any;
let scene: any, camera: any, renderer: any;
let material: any, geometry: any, mesh: any;

/**
 * 基础几何体显示
 * + 动画
 * + 鼠标控制器
 * + 新的几何体
 * + 半透明效果(立方体网格模型0.45, 球体网格模型0.5)
 * + 添加高光效果(圆柱网格模型 MeshPhongMaterial)
 * + 光源(点光源 PointLight)
 */
export default class BaseWebgl_2 extends Component {
  componentDidMount() {
    this.init();
    this.addLight();
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

    // 创建控件对象
    var controls = new OrbitControls(camera, renderer.domElement);
    // 监听鼠标、键盘事件， 注意！！！ renderer | this.animation();
    // controls.addEventListener("change", this.animation.bind(this));

    // this.addNewGeometry();
    this.animation();
  };

  addLight = () => {
    // 点光源
    var point = new THREE.PointLight(0x444444);
    // point.position.set(400, 200, 300); //点光源位置
    point.position.set(0, 0, 0); //点光源位置

    var point2 = new THREE.AmbientLight(0xffffff);
    point2.position.set(400, 200, 300); //点光源位置
    scene.add(point, point2); //点光源添加到场景中
  };

  addNewGeometry = () => {
    // 立方体网格模型
    var geometry1 = new THREE.BoxGeometry(100, 100, 100);
    var material1 = new THREE.MeshLambertMaterial({
      color: 0x0000ff,
      opacity: 0.45,
      transparent: true,
    });
    // 材质对象Material
    var mesh1 = new THREE.Mesh(geometry1, material1); //网格模型对象Mesh
    scene.add(mesh1); // !!! 网格模型添加到场景中
    mesh1.position.set(-120, 0, 0);

    // 球体网格模型
    var geometry2 = new THREE.SphereGeometry(60, 40, 40);
    var material2 = new THREE.MeshLambertMaterial({
      color: 0xff00ff,
    });
    material2.opacity = 0.5;
    material2.transparent = true;
    var mesh2 = new THREE.Mesh(geometry2, material2); //网格模型对象Mesh
    mesh2.translateY(120); //球体网格模型沿Y轴正方向平移120
    scene.add(mesh2);

    // 圆柱网格模型 MeshPhongMaterial
    var geometry3 = new THREE.CylinderGeometry(50, 50, 100, 25);
    // var material3 = new THREE.MeshLambertMaterial({
    //   color: 0xffff00,
    // });
    var material3 = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      specular: 0x4488ee,
      shininess: 12,
    });
    var mesh3 = new THREE.Mesh(geometry3, material3); //网格模型对象Mesh
    // mesh3.translateX(120); // 球体网格模型沿Y轴正方向平移120
    mesh3.position.set(120, 0, 0); // 设置mesh3模型对象的xyz坐标为120,0,0
    scene.add(mesh3); //
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

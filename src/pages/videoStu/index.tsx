import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { AxesHelper, Vector2 } from "three";

let canvas: any;
let scene: any, camera: any, renderer: any;
let geometry: any;
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

    // 添加一个立方体
    this.addBoxGeometry();
    // 添加一个地面对象
    this.addPlaneGeometry();

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
    renderer.setClearColor(0x000080, 1); //设置背景颜色

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

    this.initGUI();
  };

  addBoxGeometry = () => {
    /**
     * 创建网格模型
     */
    geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshLambertMaterial({
      color: 0xff2288,
    });

    let cube = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    cube.name = "hui";

    // 阴影
    cube.castShadow = true;
    // x轴右移 4个单位
    cube.position.x = 4;
    // y轴上移
    cube.position.y = 10;
    // z轴前移
    cube.position.z = 5;

    scene.add(cube); //网格模型添加到场景中

    console.log("getObjectByName", scene.getObjectByName("hui", false));
  };

  // 地面对象 PlaneGeometry: 平面几何体
  addPlaneGeometry = () => {
    let planeGeometry = new THREE.PlaneGeometry(100, 100);
    let p_material = new THREE.MeshLambertMaterial({
      color: 0xcccccc, // 0xffa07a
    });
    let p_cube = new THREE.Mesh(planeGeometry, p_material);
    // 旋转45度
    p_cube.rotateX(-0.5 * Math.PI);
    p_cube.position.set(15, 0, 0);
    scene.add(p_cube);

    // 地面接收阴影对象
    p_cube.receiveShadow = true;

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

  initGUI = () => {
    const ctrlObj = {
      removeFindCube: () => this.removeFindCube(),
    };

    let ctrl = new dat.GUI();
    ctrl.add(ctrlObj, "removeFindCube");
  };

  // 删除对象
  removeFindCube = () => {
    const findObj = scene.getObjectByName("hui", false);
    if (findObj instanceof THREE.Mesh) {
      scene.remove(findObj);

      console.log("getObjectByName", scene.getObjectByName("hui", false));
    }
  };

  animation = () => {
    renderer.render(scene, camera); //执行渲染操作
    requestAnimationFrame(this.animation.bind(this));
  };

  render() {
    return (
      <div id="webgl">
        <div
          style={{ position: "fixed", left: 10, top: 10, background: "#fff", padding: 10, cursor: "pointer" }}
          onClick={() => this.removeFindCube()}
        >
          删除场景
        </div>
      </div>
    );
  }
}

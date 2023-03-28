import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let canvas: any;
let scene: any, camera: any, mesh: any, renderer: any, clock: any;
let controls: any;
const sizes = {
  width: 660,
  height: 430,
};
// 鼠标点
const cursor = {
  x: 0,
  y: 0,
};
export default class SimpleScene extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    // red cube(立方体)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 透视相机
    camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 1, 100);
    camera.position.z = 3;
    camera.lookAt(mesh.position);

    // 渲染
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画
    // controls.target.y = 2;

    // 双击全屏
    window.addEventListener("dblclick", () => {
      if (!document.fullscreenElement) {
        canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  };

  animation() {
    // Update controls
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

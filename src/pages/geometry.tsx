import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let canvas: any;
let scene: any, camera: any, mesh: any, renderer: any, clock: any;
let controls: any, geometry: any;
const sizes = {
  width: 660,
  height: 430,
};

export default class Geometry extends Component {
  componentDidMount() {
    this.moreTriangle();
    this.init();
    this.animation();
  }

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    // Create an empty BufferGeometry
    // geometry = new THREE.BufferGeometry();

    // // Create a Float32Array containing the vertices position (3 by 3)
    // const positionsArray = new Float32Array([
    //   0,
    //   0,
    //   0, // First vertex
    //   0,
    //   1,
    //   0, // Second vertex
    //   1,
    //   0,
    //   0, // Third vertex
    // ]);

    // // Create the attribute and name it 'position'
    // const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
    // geometry.setAttribute("position", positionsAttribute);

    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 透视相机
    camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 1, 100);
    camera.position.z = 3;
    camera.position.x = 1;
    // camera.lookAt(mesh.position);

    // 渲染
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);
  };

  // 创建许多三角形
  moreTriangle() {
    // Create an empty BufferGeometry
    geometry = new THREE.BufferGeometry();

    // Create 50 triangles (450 values)
    const count = 50;
    const positionsArray = new Float32Array(count * 3 * 3);
    for (let i = 0; i < count * 3 * 3; i++) {
      positionsArray[i] = (Math.random() - 0.5) * 4;
    }

    // Create the attribute and name it 'position'
    const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
    geometry.setAttribute("position", positionsAttribute);
  }

  animation() {
    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

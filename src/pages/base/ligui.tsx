import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import gsap from "gsap";

let canvas: any;
let scene: any, camera: any, mesh: any, renderer: any, clock: any;
let controls: any, geometry: any;
const sizes = {
  width: 660,
  height: 430,
};

export default class Geometry extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    const parameters = {
      color: 0x00ff00,
      spin: () => {
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 });
      },
    };
    geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: parameters.color,
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

    /**
     * Debug
     */
    const gui = new dat.GUI();
    // gui.add(mesh.position, "y");
    gui.add(mesh.position, "y", -3, 3, 0.01).name("elevation");
    gui.add(mesh, "visible");
    gui.add(material, "wireframe");

    gui.addColor(parameters, "color").onChange(() => {
      material.color.set(parameters.color);
    });

    gui.add(parameters, "spin");
  };

  animation() {
    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

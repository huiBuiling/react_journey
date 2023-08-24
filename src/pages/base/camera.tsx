import { Component } from "react";
import * as THREE from "three";

let scene: any, camera: any, mesh: any, renderer: any, clock: any;
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
    // const canvas = document.querySelector(".webgl");
    clock = new THREE.Clock();
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

    // 正交相机
    // const aspectRation = sizes.width / sizes.height;
    // camera = new THREE.OrthographicCamera(-1 * aspectRation, 1 * aspectRation, 1, -1, 0.1, 100);
    // camera.position.set(2, 2, 2);
    // camera.lookAt(mesh.position);
    // console.log(camera.position.length()); // 3.4641016151377544

    // 渲染
    // const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    /**
     * cursor
     * 鼠标控制相机
     */

    window.addEventListener("mousemove", (e) => {
      // 获取鼠标坐标
      console.log(e.clientX, e.clientY);
      cursor.x = e.clientX / sizes.width - 0.5;
      cursor.y = -(e.clientY / sizes.height - 0.5);
    });
  };

  animation() {
    // 转圆圈 camera
    // const elapsedTime = clock.getElapsedTime();
    // camera.position.x = Math.cos(elapsedTime);
    // camera.position.y = Math.sin(elapsedTime);
    // camera.lookAt(mesh.position);

    // Update camera
    // camera.position.x = cursor.x * 5;
    // camera.position.y = cursor.y * 5;

    // Update camera
    camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2;
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2;
    camera.position.y = cursor.y * 3;
    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

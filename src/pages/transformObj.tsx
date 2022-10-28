import React, { Component } from "react";
import * as THREE from "three";
import gsap from "gsap";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene: any, camera: any, mesh: any, renderer: any, clock: any;
const sizes = {
  width: 660,
  height: 430,
};
export default class SimpleScene extends Component {
  componentDidMount() {
    this.init();
    // this.initGroup()
    // this.animation();
    this.animationGasp();
  }

  init = () => {
    // const canvas = document.querySelector(".webgl");
    clock = new THREE.Clock();
    // 生成场景
    scene = new THREE.Scene();

    // 设置相机
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;
    // camera.position.set(1, 1, 3);
    // camera.lookAt(new THREE.Vector3(3, 0, 0));

    // red cube(立方体)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });

    mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(0.7, -0.6, 1);

    // scale
    // mesh.scale.set(2, 0.5, 0.5);

    // rotation
    // mesh.rotation.reorder("YXZ"); // 设置变换顺序
    // mesh.rotation.y = Math.PI / 2; // == Math.PI * 0.5

    scene.add(mesh);

    // Axes Helper
    const AxesHelper = new THREE.AxesHelper(3);
    scene.add(AxesHelper);

    // 渲染
    // const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);
  };

  initGroup = () => {
    const canvas = document.querySelector(".webgl");

    // 生成场景
    scene = new THREE.Scene();

    // 设置相机
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;
    // camera.position.set(1, 1, 3);
    // camera.lookAt(new THREE.Vector3(3, 0, 0));

    // group
    const group = new THREE.Group();
    group.position.x = -1;
    group.position.y = -1;

    scene.add(group);

    const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    cube1.position.x = 2;
    const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    cube2.position.x = -2;
    const cube3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    group.add(cube1, cube2, cube3);

    // Axes Helper
    const AxesHelper = new THREE.AxesHelper(3);
    scene.add(AxesHelper);

    // 渲染
    // const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    const renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);
  };

  // componentWillUnmount() {
  //   // 移除所有的事件监听
  //   this.controls.dispose();
  // }

  animation() {
    const elapsedTime = clock.getElapsedTime();
    // console.log("elapsedTime", elapsedTime);
    // 每秒转一圈
    // mesh.rotation.y = elapsedTime * Math.PI * 2;
    // 上下运动
    // mesh.position.y = Math.sin(elapsedTime);
    // 转圆圈
    // mesh.position.x = Math.cos(elapsedTime);
    // mesh.position.y = Math.sin(elapsedTime);
    // 转圆圈 camera
    camera.position.x = Math.cos(elapsedTime);
    camera.position.y = Math.sin(elapsedTime);
    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  animationGasp() {
    gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 });

    renderer.render(scene, camera);
    requestAnimationFrame(this.animationGasp.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

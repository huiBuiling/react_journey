import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import fontJSON from "three/examples/fonts/helvetiker_bold.typeface.json";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import * as dat from "lil-gui";
import gsap from "gsap";

let scene: any, camera: any, renderer: any;
let controls: any;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// let sphere: any, plane: any, torus: any;

/**
 * FontLoader: 加载字体
 * import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
 *
 */
export default class FontLoaderComp extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    // 生成场景
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xf0f0f0);

    // 透视相机
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(1, 1, 2);
    scene.add(camera);

    // 渲染
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // 方式1:
    // const fontLoader = new FontLoader();
    // const font = fontLoader.parse(fontJSON);

    // 方式2
    // const fontLoader = new FontLoader();
    // const font_url = require("../assets/fonts/helvetiker_bold.typeface.json");
    // const font = fontLoader.parse(font_url);

    // if (font) {
    //   this.setFont(font);
    // }

    // 方式3
    const fontLoader = new FontLoader();
    fontLoader.load(
      "/fonts/helvetiker_bold.typeface.json",
      (font) => {
        this.setFont(font);
      },
      undefined,
      // onError回调
      (err) => {
        console.log("An error happened", err);
      }
    );
  };

  setFont = (font: any) => {
    console.log("font", font);
    const textGeometry = new TextGeometry("Hello Three.js", {
      font,
      size: 0.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    // 基础材质
    // const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // 材质
    // setPath("/public/");
    const textureLoader = new THREE.TextureLoader();
    const matcapTexture = textureLoader.load("/textures/matcaps/8.png");
    const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });

    const text = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(text);

    // 文字居中_1
    // textGeometry.computeBoundingBox();
    // textGeometry.translate(
    //   -(textGeometry?.boundingBox?.max.x - 0.02) * 0.5, // Subtract bevel size
    //   -(textGeometry?.boundingBox?.max.y - 0.02) * 0.5, // Subtract bevel size
    //   -(textGeometry?.boundingBox?.max.z - 0.03) * 0.5 // Subtract bevel thickness
    // );

    // 文字居中_2
    textGeometry.center();

    // 甜甜圈
    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
    const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
    for (let i = 0; i < 100; i++) {
      const donut = new THREE.Mesh(donutGeometry, donutMaterial);

      // 设置随机性
      donut.position.x = (Math.random() - 0.5) * 10;
      donut.position.y = (Math.random() - 0.5) * 10;
      donut.position.z = (Math.random() - 0.5) * 10;

      // 为旋转添加随机性
      donut.rotation.x = Math.random() * Math.PI;
      donut.rotation.y = Math.random() * Math.PI;

      // 为尺度添加随机性
      const scale = Math.random();
      donut.scale.set(scale, scale, scale);

      scene.add(donut);
    }
  };

  /**
   *     background: #191919;
   */
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

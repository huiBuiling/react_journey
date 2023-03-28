import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import gsap from "gsap";
import colorImg from "@/assets/textures/door/color.jpg";
import alphaImg from "@/assets/textures/door/alpha.jpg";
import heightImg from "@/assets/textures/door/height.png";
import normalImg from "@/assets/textures/door/normal.jpg";
import ambientOcclusionImg from "@/assets/textures/door/ambientOcclusion.jpg";
import metalnessImg from "@/assets/textures/door/metalness.jpg";
import roughnessImg from "@/assets/textures/door/roughness.jpg";

let canvas: any;
let scene: any, camera: any, mesh: any, renderer: any, clock: any;
let controls: any;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * 纹理
 * https://www.bilibili.com/video/BV1wY4y1h765?p=12&vd_source=20228976b5cae10e63993b33b1a27fa0
 */
export default class Textures extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    const typeList = ["box", "sphere", "gone", "torus"];
    const geometry = this.initGeometry(typeList[0]);

    // fun1
    // const texture = this.initTexture1();

    // fun2
    const texture = this.initTexture2();

    // fun3 progress
    // const texture = this.initTexture3();

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 透视相机
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100000);
    camera.position.z = 2;
    camera.position.x = 1;
    camera.lookAt(mesh.position);

    // 渲染
    renderer = new THREE.WebGLRenderer(); // add appendChild
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    this.initGui(material);
  };
  initGui = (material: any) => {
    const parameters = {
      spin: () => {
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 });
      },
    };

    /**
     * Debug
     */
    const gui = new dat.GUI();
    // gui.add(mesh.position, "y");
    gui.add(mesh.position, "y", -3, 3, 0.01).name("elevation");
    gui.add(mesh, "visible");
    gui.add(material, "wireframe");
    gui.add(parameters, "spin");
  };

  initGeometry = (type: string) => {
    let geometry;
    switch (type) {
      // 正、长方形
      case "box":
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      // 球形
      case "sphere":
        geometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      // 圆锥
      case "gone":
        geometry = new THREE.ConeGeometry(1, 1, 32);
        break;
      // 圆环
      case "torus":
        geometry = new THREE.TorusGeometry(1, 0.35, 32, 100);
        break;
      // case "box":
      //   geometry = new THREE.BoxGeometry(1, 1, 1);
      //   break;
      // case "sphere":
      //   geometry = new THREE.SphereGeometry(1, 32, 32);
      //   break;
      // case "box":
      //   geometry = new THREE.BoxGeometry(1, 1, 1);
      //   break;
      // case "sphere":
      //   geometry = new THREE.SphereGeometry(1, 32, 32);
      //   break;
      default:
        break;
    }

    console.log("uv", geometry?.attributes.uv);
    return geometry;
  };

  // 进度条处理
  initTexture3 = () => {
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => {
      console.log("loading started");
    };
    loadingManager.onLoad = () => {
      console.log("loading finished");
    };
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log("loading progressing---------------", url, itemsLoaded, itemsTotal);
      // /static/color.8cdba78a.jpg 1 1
    };
    loadingManager.onError = () => {
      console.log("loading error");
    };
    const textureLoader = new THREE.TextureLoader(loadingManager);

    const texture = textureLoader.load(
      colorImg,
      () => {
        console.log("finished");
      },
      () => {
        console.log("progressing");
      },
      () => {
        console.log("error");
      }
    );
    return texture;
  };

  initTexture2 = () => {
    const textureLoader = new THREE.TextureLoader();
    const imgData = [colorImg, alphaImg, heightImg, normalImg, ambientOcclusionImg, metalnessImg, roughnessImg];
    const texture = textureLoader.load(imgData[0]);

    // 重复
    texture.repeat.x = 2;
    texture.repeat.y = 3;
    // 处理重复导致的拉伸
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // 改变方向
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;

    // 偏移纹理
    texture.offset.x = 0.5;
    texture.offset.y = 0.5;

    // 旋转纹理
    texture.rotation = Math.PI * 0.25;

    return texture;
  };

  initTexture1 = () => {
    const image = new Image();
    const texture = new THREE.Texture(image);
    image.addEventListener("load", () => {
      texture.needsUpdate = true;
    });
    image.src = colorImg;
    return texture;
  };

  animation() {
    renderer.render(scene, camera);
    requestAnimationFrame(this.animation.bind(this));
  }

  render() {
    return <div id="webgl"></div>;
  }
}

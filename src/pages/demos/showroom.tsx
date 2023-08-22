import { Component } from "react";
import {
  Clock,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  TextureLoader,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  BoxGeometry,
  TorusGeometry,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  Box3,
  Vector3,
  Color,
  Group,
  PMREMGenerator,
  EquirectangularReflectionMapping, // hdr
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "lil-gui";

import doorImg from "@/assets/textures/matcaps/6.png";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;

/**
 * showroom 3d展厅
 * https://my.oschina.net/u/2380148/blog/8235797
 * https://github.com/mtsee/vr-hall
 *
 * https://github.com/tronlec/three.js
 * https://my.oschina.net/u/3843525/blog/7564273
 *
 * https://juejin.cn/post/7255305597305225273
 */
export default class Showroom extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();
    // scene.background = new Color(0xbfe3dd);
    // 透视相机
    camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    scene.add(camera);
    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    const pmremGenerator = new PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    // controls.target.set(0.32050702790515095, 0.6298344026809619, 3.6194884124668154);
    controls.update();
    // 用来获取相机合适的显示位置
    controls.addEventListener("change", () => {
      console.log(`output->change`, camera.position);
    });

    // 不加动画时
    // renderer.render(scene, camera);

    this.initModel();
    // light
    this.initLight();
  };

  // 加载模型 .gltf + .bin + 贴图文件
  initModel() {
    // new RGBELoader().setPath("textures/equirectangular/").load("royal_esplanade_1k.hdr", function (texture) {
    //   texture.mapping = THREE.EquirectangularReflectionMapping;

    //   scene.background = texture;
    //   scene.environment = texture;
    // });

    const gltfLoader = new GLTFLoader();
    gltfLoader.setPath("model/3d_model_star_citizen_carrack_bridge/");
    gltfLoader.load(
      "scene.gltf",
      (gltf) => {
        console.log("gltf", gltf);
        const model = gltf.scene;

        // 改变模型的旋转中心
        /**
         * 改变模型的旋转中心
         * 算出模型的几何中心，算出模型相对模型原点的偏移
         * 重点: 建立一个Group组，并对模型偏移
         * -> group.position.set(0, 0, 0); // 世界原点坐标
         */
        let group: Group = new Group();
        group.position.set(0, 0, 0); // 世界原点坐标

        scene.add(model);
        // group.add(model);

        const box = new Box3().setFromObject(model); // 获取模型的包围盒
        const size = box.getSize(new Vector3());
        const pos = box.getCenter(new Vector3());
        console.log("box", size, pos);
        model.position.y = -pos.y;
        const height = box.max.y;
        const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360)); // 360
        camera.position.set(-pos.x, pos.y, dist * 1.5); // fudge factor so you can see the boundaries
        console.log("1", model.position, "camera", -pos.x, pos.y, dist * 1.5);

        const _pos = {
          // x: 1.8852058293654468,
          // y: 0.329038834678412,
          // z: 20.503764384948816,
          // x: 10,
          // y: 41,
          // z: 51,
          x: 0.32050702790515095,
          y: 0.6298344026809619,
          z: 3.6194884124668154,
        };
        // camera.position.set(_pos.x, _pos.y, _pos.z); // fudge factor so you can see the boundaries

        model.traverse((child: any) => {
          if (child.isMesh) {
            child.material.emissiveMap = child.material.map;
          }
        });

        // const _scale = 0.05;
        // model.scale.set(_scale, _scale, _scale);
        // model.position.x = -pos.x / 2;

        // const _scale = 0.05;
        // model.scale.set(_scale, _scale, _scale);

        this.initGui();
      },
      (xhr) => {}
    );
  }

  initLight() {
    ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new DirectionalLight(0x00fffc, 0.3);
    scene.add(directionalLight);
  }

  resize() {
    window.addEventListener("resize", () => {
      // Update sizes
      window.innerWidth = window.innerWidth;
      window.innerHeight = window.innerHeight;

      // Update camera
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  animation() {
    // Update controls
    controls.update();
    // Render
    renderer.render(scene, camera);
    // Call tick again on the next frame
    requestAnimationFrame(this.animation.bind(this));
  }

  /**
   *
   */
  initGui = () => {
    const gui = new dat.GUI();
    gui.add(camera.position, "x").min(-800).max(800).step(1);
    gui.add(camera.position, "y").min(-800).max(800).step(1);
    gui.add(camera.position, "z").min(-800).max(800).step(1);
  };

  render() {
    return <div id="webgl"></div>;
  }
}

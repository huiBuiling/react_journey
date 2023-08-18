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
    scene.background = new Color(0xbfe3dd);
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

    // 用来获取相机合适的显示位置
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    // 不加动画时
    // renderer.render(scene, camera);

    this.initModel();
    // light
    this.initLight();

    // this.initGui();
  };

  // 加载模型
  initModel() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/public");
    // dracoLoader.preload();
    const gltfLoader = new GLTFLoader();
    // gltfLoader.setCrossOrigin("anonymous");
    gltfLoader.setDRACOLoader(dracoLoader);
    let loadProgress = 0;
    gltfLoader.load(
      "/model/3d_model_star_citizen_carrack_bridge.glb",
      (res) => {
        const model = res.scene;
        const box = new Box3().setFromObject(model); // 获取模型的包围盒
        const size = box.getSize(new Vector3());
        const pos = box.getCenter(new Vector3());
        console.log("box", size, pos);
        model.position.y = -pos.y;
        const height = box.max.y;
        const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360)); // 360
        console.log("1", model.position, "camera", pos.x, pos.y, dist * 1.5);
        camera.position.set(pos.x, pos.y, dist * 1.5); // fudge factor so you can see the boundaries

        scene.add(model);
        console.log("model", model);

        const _scale = 0.8;
        model.scale.set(_scale, _scale, _scale);
      },
      (xhr) => {
        loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
        console.log("loadProgress", loadProgress);
      }
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
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
  };

  render() {
    return <div id="webgl"></div>;
  }
}

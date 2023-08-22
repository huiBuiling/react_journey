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
  EquirectangularReflectionMapping, // hdr
  Box3,
  Vector3,
  PMREMGenerator,
  Fog,
  GridHelper,
  //
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import * as dat from "lil-gui";

import utils from "@/utils/utils";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, pmremGenerator: PMREMGenerator;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;
let bodyMaterial: MeshPhysicalMaterial, detailsMaterial: MeshStandardMaterial;

/**
 * 蘑菇小可爱
 * https://www.eeagd.edu.cn/zkptgz
 */
export default class Mushroom extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();
    scene.fog = new Fog(0x333333, 10, 15);

    // 透视相机
    camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(4.25, 1.4, -4.5);
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xaaaaaa, 1); // 设置背景颜色
    renderer.render(scene, camera);

    pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.004).texture;
    // new RGBELoader().load(
    //   "/hdr/venice_sunset_1k.hdr",
    //   (texture: any) => {
    //     console.log("texture", texture);
    //     const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    //     pmremGenerator.dispose();

    //     scene.environment = envMap;
    //     scene.environment.mapping = EquirectangularReflectionMapping;
    //   },
    //   () => {},
    //   (error) => {
    //     console.error("Failed to load HDR file:", error);
    //   }
    // );

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 9;
    controls.target.set(0, 0.5, 0);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    let grid: any = new GridHelper(20, 40, 0xffffff, 0xffffff);
    grid.material.opacity = 0.2;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);

    // 不加动画时
    // renderer.render(scene, camera);

    this.initModel();
    this.initLight();

    // this.initGui();

    bodyMaterial = new MeshPhysicalMaterial({
      color: "#6e2121",
      metalness: 1.0,
      roughness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      sheen: 0.5,
    });

    detailsMaterial = new MeshStandardMaterial({
      color: "#6c6c6c",
      metalness: 1.0,
      roughness: 0.5,
    });
  };

  // 加载模型
  initModel() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/public");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load(
      "/model/benchi.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.03, 0.03, 0.03);
        model.position.set(0, 0.25, 0);
        scene.add(model);

        // utils.setContent(camera, controls, model);

        let bodyModel1: any = model.getObjectByName("磨砂框架");
        let bodyModel2: any = model.getObjectByName("车门");

        console.log("model", bodyModel1, bodyModel2);

        // const _data = model.children[0].children[0].children[0].children;
        // const Leg_L: any = _data.find((item) => item.name == "Leg_L");
        // const Leg_R: any = _data.find((item) => item.name == "Leg_R");
        // const Mouth: any = _data.find((item) => item.name == "Mouth");
        // Leg_L.visible = true;
        // Mouth.visible = true;
        const _material = new MeshBasicMaterial({
          // map: new TextureLoader().load(require("../../assets/textures/2d/background.png")),
          color: 0x15bcff,
        });
        bodyModel1.material = bodyMaterial;
        // bodyModel2.children[0].material = _material;
        // Leg_R.children[0].material = _material;

        // console.log("model", _data);
        // console.log("Mouth", Mouth);
        // console.log("leg", Leg_L.children[0]);
      },
      (xhr) => {}
    );
  }

  initLight() {
    ambientLight = new AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // directionalLight = new DirectionalLight(0x00fffc, 0.3);
    // scene.add(directionalLight);
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

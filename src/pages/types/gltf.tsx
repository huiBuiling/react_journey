import { Component } from "react";
import {
  Clock,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Box3,
  Vector3,
  Color,
  PMREMGenerator,
  sRGBEncoding,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "lil-gui";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, pmremGenerator: PMREMGenerator;
let lights = [],
  content = null,
  mixer = null,
  clips = [],
  gui = null;
let ambientLight: AmbientLight, directionalLight: DirectionalLight;
// 配置项
let wireframe: false, skeleton: false, grid: false;
let exposure: 1.0, textureEncoding: "sRGB";
let ambientIntensity = 0.3, // 环境
  ambientColor = 0xffffff,
  directIntensity = 0.8 * Math.PI, // TODO(#116)
  directColor = 0xffffff;

// gltf
export default class Showroom extends Component {
  componentDidMount() {
    this.init();
    this.animation();

    this.updateEnvironment();
  }

  init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();
    // scene.background = new Color(0xbfe3dd);
    // 透视相机
    const fov = 40; // 视野范围
    const aspect = window.innerWidth / window.innerHeight; // 相机默认值 画布的宽高比
    const near = 0.1; // 近平面
    const far = 1000; // 远平面
    // 透视投影相机
    camera = new PerspectiveCamera(fov, aspect, near, far);
    scene.add(camera);
    // 渲染
    renderer = new WebGLRenderer({
      antialias: true, // 抗锯齿
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xcccccc, 1); // 设置背景颜色
    renderer.physicallyCorrectLights = true;

    pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    renderer.render(scene, camera);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotateSpeed = -10;
    controls.screenSpacePanning = true; // y轴移动
    controls.update();
    // 用来获取相机合适的显示位置
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    // 不加动画时
    // renderer.render(scene, camera);

    this.initModel();
    // light
    this.initLight();
  };

  // 加载模型 .gltf + .bin + 贴图文件
  initModel() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.setPath("model/cars_3_driven_to_win_-_rich_mixon/");
    gltfLoader.load(
      "scene.gltf",
      (gltf) => {
        console.log("gltf", gltf);
        const model = gltf.scene || gltf.scenes[0];
        clips = gltf.animations || [];
        scene.add(model);
        this.setContent(model, clips);
        this.updateTextureEncoding(model);
      },
      (xhr) => {}
    );
  }

  setContent(object: any, clips: any) {
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());
    controls.reset();

    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;
    controls.maxDistance = size * 10;
    camera.near = size / 100;
    camera.far = size * 100;
    camera.updateProjectionMatrix();

    camera.position.copy(center);
    camera.position.x += size / 2.0;
    camera.position.y += size / 5.0;
    camera.position.z += size / 2.0;
    camera.lookAt(center);

    //
    object.traverse((node: any) => {
      if (node.isLight) {
      } else if (node.isMesh) {
        // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
        node.material.depthWrite = !node.material.transparent;
      }
    });

    // 动画
    // this.setClips(clips);
  }

  traverseMaterials(object: any, callback: any) {
    object.traverse((node: any) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach(callback);
    });
  }

  updateTextureEncoding(content: any) {
    // const encoding = this.state.textureEncoding === "sRGB" ? sRGBEncoding : LinearEncoding;
    const encoding = sRGBEncoding;
    this.traverseMaterials(content, (material: any) => {
      if (material.map) material.map.encoding = encoding;
      if (material.emissiveMap) material.emissiveMap.encoding = encoding;
      if (material.map || material.emissiveMap) material.needsUpdate = true;
    });
  }

  // 环境贴图
  updateEnvironment() {
    this.getCubeMapTexture({ path: "https://ysdl-model.oss-cn-shenzhen.aliyuncs.com/hdr/venice_sunset_1k.hdr" }).then(
      ({ envMap }: any) => {
        if (!envMap) return;
        scene.environment = envMap;
        scene.background = envMap; // envMap || null
      }
    );
  }

  getCubeMapTexture(environment: any) {
    const { path } = environment;
    // no envmap
    if (!path) return Promise.resolve({ envMap: null });
    // new RGBELoader().setPath("textures/equirectangular/").load("royal_esplanade_1k.hdr", function (texture) {
    //   texture.mapping = THREE.EquirectangularReflectionMapping;
    //   scene.background = texture;
    //   scene.environment = texture;
    // });

    return new Promise((resolve, reject) => {
      new RGBELoader().load(
        path,
        (texture) => {
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          pmremGenerator.dispose();
          resolve({ envMap });
        },
        undefined,
        reject
      );
    });
  }

  // updateLights() {
  //   const state = this.state;
  //   const lights = this.lights;

  //   if (state.addLights && !lights.length) {
  //     this.addLights();
  //   } else if (!state.addLights && lights.length) {
  //     this.removeLights();
  //   }

  //   this.renderer.toneMappingExposure = state.exposure;

  //   if (lights.length === 2) {
  //     lights[0].intensity = state.ambientIntensity;
  //     lights[0].color.setHex(state.ambientColor);
  //     lights[1].intensity = state.directIntensity;
  //     lights[1].color.setHex(state.directColor);
  //   }
  // }

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
    return <div id="webgl" style={{ background: "radial-gradient(circle,#fff,#839094)" }}></div>;
  }
}

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
  PMREMGenerator,
  sRGBEncoding,
  Box3,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import * as dat from "lil-gui";
import doorImg from "@/assets/textures/matcaps/6.png";
import "./style.css";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls;
let pmremGenerator: any;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;
let nodeStates: any = new WeakMap();
let options: any[] = [];

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

    // 透视相机
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    // camera.position.set(0, -10, 0);
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);

    // 解决丢失了细节以及发光太严重后，导致图像都失真
    renderer.outputEncoding = sRGBEncoding;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 用来获取相机合适的显示位置
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // 使用hdr作为背景色 模型贴图
    pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 不加动画时
    // renderer.render(scene, camera);

    this.initModel();
    // this.addXdrEnvironment();

    // light
    // this.initLight();

    // this.initGui();
  };

  // 加载模型
  initModel() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/public");
    dracoLoader.preload();
    const gltfLoader = new GLTFLoader();
    // gltfLoader.setCrossOrigin("anonymous");
    gltfLoader.setDRACOLoader(dracoLoader);

    const self = this;
    let loadProgress = 0;
    gltfLoader.load(
      "/model/gem_ring2.glb", // Horse panda2013 girl_cartoon_cyber_by_oscar_creativo
      (res) => {
        const model = res.scene;

        // options.push(buildOption(model.camera, false));
        // options.push(buildOption(scene, false));
        (function addObjects(objects, pad) {
          for (let i = 0, l = objects.length; i < l; i++) {
            const object = objects[i];

            // if (nodeStates.has(object) === false) {
            //   nodeStates.set(object, false);
            // }

            const option = self.buildOption(object, true);
            option.style.paddingLeft = pad * 18 + "px";
            options.push(option);

            // if (nodeStates.get(object) === true) {
            addObjects(object.children, pad + 1);
            // }
          }
        })(model.children, 0);

        // model.position.set(0, -0.012, 10.05); // z缩小
        // model.rotation.set(0, 0, 0);
        // model.scale.set(0.7, 0.7, 0.7);
        scene.add(model);

        const _cur = document.getElementsByClassName("dir");
        options.forEach((item) => {
          _cur[0].append(item);
        });
        console.log("model", model, options);
        // this.setCamera(model);
      },
      (xhr) => {
        // loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
        // console.log("loadProgress", xhr, xhr.loaded, xhr.total);
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    );
  }

  buildOption(object: any, draggable: boolean) {
    const option = document.createElement("div");
    option.draggable = draggable;
    option.innerHTML = this.buildHTML(object);
    option.value = object.id;

    // opener

    if (nodeStates.has(object)) {
      const state = nodeStates.get(object);
      const opener = document.createElement("span");
      opener.classList.add("opener");
      if (object.children.length > 0) {
        opener.classList.add(state ? "open" : "closed");
      }
    }
    return option;
  }

  buildHTML(object: any) {
    let html = `<span class="type ${this.getObjectType(object)}"></span> ${this.escapeHTML(object.name)}`;
    if (object.isMesh) {
      const geometry = object.geometry;
      const material = object.material;
      html += ` <span class="type Geometry"></span> ${this.escapeHTML(geometry.name)}`;
      html += ` <span class="type Material"></span> ${this.escapeHTML(this.getMaterialName(material))}`;
    }
    // html += getScript(object.uuid);
    return html;
  }

  escapeHTML(html: string) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 获取类型
  getObjectType(object: any) {
    if (object.isScene) return "Scene";
    if (object.isCamera) return "Camera";
    if (object.isLight) return "Light";
    if (object.isMesh) return "Mesh";
    if (object.isLine) return "Line";
    if (object.isPoints) return "Points";

    return "Object3D";
  }

  getMaterialName(material: any) {
    if (Array.isArray(material)) {
      const array = [];
      for (let i = 0; i < material.length; i++) {
        array.push(material[i].name);
      }
      return array.join(",");
    }
    return material.name;
  }

  // 添加xdr
  addXdrEnvironment() {
    const textureLoader = new RGBELoader().setPath("/public");
    textureLoader.load(
      "hdr/vestibule_4k.hdr",
      (texture) => {
        scene.environment = texture;
        scene.environment.mapping = EquirectangularReflectionMapping;
      },
      undefined
    );
  }

  setCamera(model: any) {
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());

    console.log("size", size, center);

    // 重置控制器
    controls.reset();
    // 固定缩放大小
    // controls.minDistance = size / 1.2;
    // controls.maxDistance = size * 20;

    model.position.x += model.position.x - center.x;
    model.position.y += model.position.y - center.y;
    model.position.z += model.position.z - center.z;
    model.scale.multiplyScalar(0.7);

    camera.near = size / 10;
    camera.far = size * 10;
    camera.updateProjectionMatrix();

    camera.position.copy(center);
    camera.position.x += size / 2.0;
    camera.position.y += size / 10.0;
    camera.position.z += size / 2.0;

    // const _position = {
    //   x: 0.0002837040715011481,
    //   y: 0.09157194668498254,
    //   z: 0.08155604724883798,
    // };
    // camera.position.copy(new Vector3(_position.x, _position.y, _position.z));
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
    return (
      <div id="webgl">
        <div className="dir"></div>
      </div>
    );
  }
}

import * as dat from "lil-gui";
import { Component } from "react";
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  EquirectangularReflectionMapping,
  GridHelper,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

import { buildHTML } from "./utils/scene";

// 移动

import "./style.scss";

let scene: Scene, camera: any, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, transformControls: TransformControls;
let pmremGenerator: any;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;
let nodeStates: any = new WeakMap();
let options: any[] = [],
  objCtrols: any[] = [];

let cameraPersp: PerspectiveCamera, cameraOrtho: OrthographicCamera;

const width = window.innerWidth - 350;
// 模型数据
let modelData: any;
/**
 * 汇总
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
    scene.add(new GridHelper(1000, 10, 0x888888, 0x444444));

    // 透视相机
    const aspect = width / window.innerHeight;
    cameraPersp = new PerspectiveCamera(50, aspect, 0.01, 30000);
    cameraOrtho = new OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
    camera = cameraPersp;

    camera.position.set(1000, 500, 1000);
    camera.lookAt(0, 200, 0);

    const _position = {
      // x: 56.09944382235683,
      // y: 300.6991828482033,
      // z: 750.6051948924159,
      // x: 16.272155976913332,
      // y: -232.1588800787314,
      // z: 776.4101854707258,
      x: 75.1465825274154,
      y: 325.76209111591896,
      z: 738.3815787846216,
    };
    camera.position.set(_position.x, _position.y, _position.z);

    scene.add(camera);
    const _scene_pos = {
      x: 56.09944382235683,
      y: 300.6991828482033,
      z: 750.6051948924159,
    };
    scene.lookAt(_scene_pos.x, _scene_pos.y, _scene_pos.z);

    // 渲染
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);
    // 解决丢失了细节以及发光太严重后，导致图像都失真
    renderer.outputEncoding = sRGBEncoding;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    controls.update();
    controls.addEventListener("change", this.renderFun);

    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener("change", this.renderFun);
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });
    scene.add(transformControls);

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

    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("keydown", () => this.keyFun(event));
    window.addEventListener("keyup", function (event) {
      switch (event.keyCode) {
        case 16: // Shift
          transformControls.setTranslationSnap(null);
          transformControls.setRotationSnap(null);
          transformControls.setScaleSnap(null);
          break;
      }
    });
  };

  renderFun() {
    renderer.render(scene, camera);
    // console.log(`output->change`, camera.position);
    console.log(`transformControls->camera`, camera.position);
    // console.log(`transformControls->controls`, controls);
    console.log(`transformControls->scene`, scene);
  }

  keyFun(event: any) {
    switch (event.keyCode) {
      case 81: // Q
        transformControls.setSpace(transformControls.space === "local" ? "world" : "local");
        break;
      case 16: // Shift
        transformControls.setTranslationSnap(100);
        transformControls.setRotationSnap(MathUtils.degToRad(15));
        transformControls.setScaleSnap(0.25);
        break;
      case 87: // W
        transformControls.setMode("translate");
        break;

      case 69: // E
        transformControls.setMode("rotate");
        break;

      case 82: // R
        transformControls.setMode("scale");
        break;

      case 67: // C
        const position = camera.position.clone();

        camera = camera?.isPerspectiveCamera ? cameraOrtho : cameraPersp;
        camera.position.copy(position);

        controls.object = camera;
        transformControls.camera = camera;

        camera.lookAt(controls.target.x, controls.target.y, controls.target.z);
        console.log("camera target", controls.target);
        this.onWindowResize();
        break;

      case 86: // V
        const randomFoV = Math.random() + 0.1;
        const randomZoom = Math.random() + 0.1;

        cameraPersp.fov = randomFoV * 160;
        cameraOrtho.bottom = -randomFoV * 500;
        cameraOrtho.top = randomFoV * 500;

        cameraPersp.zoom = randomZoom * 5;
        cameraOrtho.zoom = randomZoom * 5;
        this.onWindowResize();
        break;

      case 187:
      case 107: // +, =, num+
        transformControls.setSize(transformControls.size + 0.1);
        break;

      case 189:
      case 109: // -, _, num-
        transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
        break;

      case 88: // X
        transformControls.showX = !transformControls.showX;
        break;

      case 89: // Y
        transformControls.showY = !transformControls.showY;
        break;

      case 90: // Z
        transformControls.showZ = !transformControls.showZ;
        break;

      case 32: // Spacebar
        transformControls.enabled = !transformControls.enabled;
        break;

      case 27: // Esc
        transformControls.reset();
        break;
    }
  }

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
      "/model/mushy_buddy.glb", // Horse panda2013 girl_cartoon_cyber_by_oscar_creativo
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
            objCtrols.push(object);

            // if (nodeStates.get(object) === true) {
            addObjects(object.children, pad + 1);
            // }
          }
        })(model.children, 0);

        // model.position.set(0, -0.012, 10.05); // z缩小
        // model.rotation.set(0, 0, 0);
        // model.scale.set(0.7, 0.7, 0.7);
        modelData = model;
        scene.add(model);

        // 可视化变换控件对象
        transformControls.attach(model);

        // 遍历渲染模型场景值
        const _cur = document.getElementsByClassName("dir_con");
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

  // 切换材质
  checkMaterial() {
    var material1 = new MeshBasicMaterial({ color: 0xff0000 }); // 红色
    var material2 = new MeshBasicMaterial({ color: 0x00ff00 }); // 绿色
    var material3 = new MeshBasicMaterial({ color: 0x0000ff }); // 蓝色
    if (modelData instanceof Mesh) {
      modelData.material = material1; // 将材质更改为新的红色材质
    }
  }

  buildOption(object: any, draggable: boolean) {
    const option = document.createElement("div");
    option.draggable = draggable;
    option.value = object.id;
    option.innerHTML = buildHTML(object);

    // opener

    if (nodeStates.has(object)) {
      const state = nodeStates.get(object);
      const opener = document.createElement("span");
      opener.classList.add("opener");
      if (object.children.length > 0) {
        opener.classList.add(state ? "open" : "closed");
      }

      // opener.addEventListener('click', function () {
      //   nodeStates.set(object, nodeStates.get(object) === false); // toggle
      // });
    }
    return option;
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

  /*
  setCamera(model: any) {
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());

    console.log("size", size, center);

    // 重置控制器
    // controls.reset();
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
  */

  initLight() {
    ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new DirectionalLight(0x00fffc, 0.3);
    scene.add(directionalLight);
  }

  onWindowResize() {
    // Update sizes
    window.innerWidth = width;
    window.innerHeight = window.innerHeight;

    // Update camera
    camera.aspect = width / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(width, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animation() {
    // Update controls
    controls.update();
    // transformControls.update();
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

  //
  treeItem(item: any, isChildren?: boolean) {
    debugger;
    let itemGroupItem = [];
    // 把所有节点放在一个数组里面

    if (isChildren) {
      item.children.forEach((element: any) => {
        itemGroupItem.push(
          <ul>
            {/* 第一个层级 */}
            <li key={element.uuid}>{element.name}</li>

            {/* 调用tree方法 */}
            {this.treeItem(element.children, true)}
          </ul>
        );
      });
    } else {
      itemGroupItem.push(
        <ul>
          {/* 第一个层级 */}
          <li key={item.uuid}>{item.name}</li>

          {/* 调用tree方法 */}
          {this.treeItem(item.children)}
        </ul>
      );
    }

    return itemGroupItem;
  }

  render() {
    console.log("objCtrols", modelData);
    return (
      <div className="canvas">
        <div id="webgl" className="webgl"></div>
        <div className="right">
          <div className="dir">
            <div className="scene">SCENE</div>
            <div className="dir_con"></div>
          </div>
          <div className="dir obj">
            <div className="scene">OBJECT</div>
            <div className="dir_con obj_con" onClick={this.checkMaterial}>
              材质1
              {modelData && this.treeItem(modelData)}
              {/* {objCtrols[0].map((item, index) => {
                //   let html
                //   if(item.children) {
                //     html += item.
                //   }
                //   const children  = <div>
                //   {{item.name}}
                // </div>
                return <div key={index}>{item.name}</div>;
              })} */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

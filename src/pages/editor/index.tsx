import { FC, useEffect, useState } from "react";
import {
  AmbientLight,
  Clock,
  DirectionalLight,
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

import { getObjectType } from "./utils/scene";

// 移动

import "./style.scss";

let scene: Scene, camera: any, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, transformControls: TransformControls;
let pmremGenerator: any;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;

let cameraPersp: PerspectiveCamera, cameraOrtho: OrthographicCamera;

const width = window.innerWidth - 350;
/**
 * 汇总
 */
const Editor: FC<{}> = ({}) => {
  const [modelData, setModelData] = useState<any>(); // 模型数据
  const [uuid, setUuid] = useState<string>(); // 模型数据

  useEffect(() => {
    init();
    animation();
  }, []);

  const init = () => {
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
    controls.addEventListener("change", renderFun);

    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener("change", renderFun);
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

    initModel();
    // addXdrEnvironment();

    // light
    // initLight();

    // initGui();

    window.addEventListener("resize", () => onWindowResize());
    window.addEventListener("keydown", () => keyFun(event));
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

  const renderFun = () => {
    renderer.render(scene, camera);
    // console.log(`output->change`, camera.position);
    console.log(`transformControls->camera`, camera.position);
    // console.log(`transformControls->controls`, controls);
    console.log(`transformControls->scene`, scene);
  };

  const keyFun = (event: any) => {
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
        onWindowResize();
        break;

      case 86: // V
        const randomFoV = Math.random() + 0.1;
        const randomZoom = Math.random() + 0.1;

        cameraPersp.fov = randomFoV * 160;
        cameraOrtho.bottom = -randomFoV * 500;
        cameraOrtho.top = randomFoV * 500;

        cameraPersp.zoom = randomZoom * 5;
        cameraOrtho.zoom = randomZoom * 5;
        onWindowResize();
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
  };

  // 加载模型
  const initModel = () => {
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

        scene.add(model);

        // 可视化变换控件对象
        transformControls.attach(model);
        setModelData(model);
        // setCamera(model);
      },
      (xhr) => {
        // loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
        // console.log("loadProgress", xhr, xhr.loaded, xhr.total);
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    );
  };

  const onWindowResize = () => {
    // Update sizes
    window.innerWidth = width;
    window.innerHeight = window.innerHeight;

    // Update camera
    camera.aspect = width / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(width, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  const animation = () => {
    // Update controls
    controls.update();
    // transformControls.update();
    // Render
    renderer.render(scene, camera);
    // Call tick again on the next frame
    requestAnimationFrame(animation.bind(this));
  };

  const constinitLight = () => {
    ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new DirectionalLight(0x00fffc, 0.3);
    scene.add(directionalLight);
  };

  // 切换材质
  const checkMaterial = () => {
    var material1 = new MeshBasicMaterial({ color: 0xff0000 }); // 红色
    var material2 = new MeshBasicMaterial({ color: 0x00ff00 }); // 绿色
    var material3 = new MeshBasicMaterial({ color: 0x0000ff }); // 蓝色
    if (modelData instanceof Mesh) {
      modelData.material = material1; // 将材质更改为新的红色材质
    }
  };

  // 渲染模型结构
  const treeItem = (item: any) => {
    let itemGroupItem = [];
    // 把所有节点放在一个数组里面
    if (item?.length > 0) {
      item.forEach((element: any) => {
        if (!element?.uuid) return;
        itemGroupItem.push(
          <ul
            key={element.uuid}
            onClick={(e) => {
              e.stopPropagation();
              objectSelected(element);
            }}
          >
            {/* 第一个层级 */}
            <li className={element.uuid == uuid ? "active" : ""}>
              <span className={`type ${getObjectType(element)}`}></span>
              {element.name}
            </li>

            {/* 调用tree方法 */}
            {treeItem(element.children)}
          </ul>
        );
      });
    } else {
      if (!item?.uuid) return;
      itemGroupItem.push(
        <ul
          key={item.uuid}
          onClick={(e) => {
            e.stopPropagation();
            objectSelected(item);
          }}
        >
          {/* 第一个层级 */}
          <li className={item.uuid == uuid ? "active" : ""}>
            <span className={`type ${getObjectType(item)}`}></span>
            {item.name}
          </li>

          {/* 调用tree方法 */}
          {treeItem(item.children)}
        </ul>
      );
    }

    return itemGroupItem;
  };

  // transformControls 切换
  const objectSelected = (item: any) => {
    console.log("objectSelected", item);
    transformControls.detach();
    transformControls.attach(item);
    setUuid(item.uuid);
  };

  console.log("objCtrols", modelData);
  return (
    <div className="canvas">
      <div id="webgl" className="webgl"></div>
      <div className="right">
        <div className="dir">
          <div className="scene">SCENE</div>
          <div className="dir_con">{modelData && treeItem(modelData)}</div>
        </div>
        <div className="dir obj">
          <div className="scene">OBJECT</div>
          <div className="dir_con obj_con" onClick={checkMaterial}>
            材质1
          </div>
        </div>
      </div>
    </div>
  );
};
export default Editor;

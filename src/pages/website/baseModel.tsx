import { FC, useEffect } from "react";
import { Box3, BoxHelper, Clock, PerspectiveCamera, Scene, sRGBEncoding, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
// import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// 组件
let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, transformControls: TransformControls;
let pmremGenerator: any;
let boxHelper: BoxHelper; // 框选 包围盒

/**
 * 3D
 */
const LockControl: FC<{}> = ({}) => {
  useEffect(() => {
    // 销毁
    clearModel();
    // return () => {};
  }, []);

  const clearModel = () => {
    if (scene) {
      // console.log('scene.children', scene.children)
      // 建议使用
      scene.children.pop();
      transformControls.detach();

      const threeMain = document.getElementById("webgl");
      if (threeMain !== null) {
        threeMain.removeChild(threeMain.firstChild);
      }

      // 重要
      // if (AnimationId !== null) cancelAnimationFrame(AnimationId)
    }
  };

  useEffect(() => {
    init();
    animation();
  }, []);

  const init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();
    // 透视相机
    const aspect = window.innerWidth / window.innerHeight;
    camera = new PerspectiveCamera(50, aspect, 0.01, 30000);
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);
    // 解决丢失了细节以及发光太严重后，导致图像都失真
    renderer.outputEncoding = sRGBEncoding;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // 使用hdr作为背景色 模型贴图
    // pmremGenerator = new PMREMGenerator(renderer);
    // pmremGenerator.compileEquirectangularShader();
    // scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    initControls();
    initModel();
    // initListenEvent();
  };

  // 初始化各类型控制器
  const initControls = () => {
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    controls.update();
    controls.addEventListener("change", () => {
      renderer.render(scene, camera);
      // console.log(`output->change`, camera.position);
    });

    //
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });
    scene.add(transformControls);
  };

  // 初始加载模型
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
      "/model/russell.glb", // mushy_buddy girl russell gem_ring2
      (gltf) => {
        const model = gltf.scene;
        const box = new Box3().setFromObject(model); // 获取模型的包围盒
        const size = box.getSize(new Vector3());
        const pos = box.getCenter(new Vector3());
        console.log("box", size, pos);
        model.position.y = -pos.y;
        const height = box.max.y;
        const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360)); // 360
        // console.log("1", pos.x, pos.y, dist * 1.5);
        camera.position.set(pos.x, pos.y, dist * 1.5); // fudge factor so you can see the boundaries
        // camera.lookAt(pos);

        scene.add(model);

        // 可视化变换控件对象
        transformControls.attach(model);
        transformControls.addEventListener("change", (event) => {
          // const model_pos = _model.position.clone();
          // const camera_pos = camera.position.clone();
          // console.log("model_pos----:", model_pos, ", camera_pos----:", camera_pos);
          renderer.render(scene, camera);
        });
        dracoLoader.dispose();
      },
      (xhr) => {
        // loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
        // console.log("loadProgress", xhr, xhr.loaded, xhr.total);
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    );
  };

  // 初始化监听事件
  const initListenEvent = () => {
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

  // 按键
  const keyFun = (event: any) => {};

  // 监听窗口变化
  const onWindowResize = () => {
    console.log("onWindowResize");
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  const animation = () => {
    controls.update();
    requestAnimationFrame(animation.bind(this));
    renderer.render(scene, camera);
  };

  // const [tab, setTab] = useState("MATERIAL"); // ["OBJECT", "GEOMETRY", "MATERIAL"]
  return <div id="webgl" className="webgl" style={{ width: "100%", height: "100%", background: "#222326" }}></div>;
};
export default LockControl;

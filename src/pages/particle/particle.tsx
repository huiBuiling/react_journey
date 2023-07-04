import { Component } from "react";
// import LegacyJSONLoader from "@/assets/particle/LegacyJSONLoader";
import * as dat from "lil-gui";
import {
  // VertexColors,
  AdditiveBlending,
  AmbientLight,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  // 输出编码
  sRGBEncoding,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any,
  layerGroup: any,
  layers: any[],
  aspect = 18;
let ambientLight: AmbientLight, directionLight: DirectionalLight;
let dialogBox: any = null,
  step = 0;
let geometry: any,
  around: any,
  aroundMaterial: any,
  aroundPoints: any,
  parent: any,
  meshes: any,
  positions: any,
  mesh: any;

let parameters: {
  count: number;
  size: number;
  radius: number;
  branches: number;
  spin: number;
  randomness: number;
  randomnessPower: number;

  insideColor: string;
  outsideColor: string;
} = {
  count: 10000,
  size: 0.02,
  radius: 5, // 半径
  branches: 3,
  spin: 1, // 偏转角度 3
  randomness: 0.2, // 扩散值
  randomnessPower: 3,

  insideColor: "#4D90FE",
  outsideColor: "#E94242",
};

/**
 * 粒子: 模型转换粒子
 * https://github.com/mrdoob/three.js/blob/master/examples/webgl_points_dynamic.html
 */

interface IProps {}
interface IState {
  // isLoading: Boolean;
}
export default class Particl extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      // isLoading: true,
    };
  }

  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    container = document.getElementById("container");
    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器的输出编码
    renderer.outputEncoding = sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 生成场景
    scene = new Scene();
    // 雾化
    // scene.fog = new FogExp2(0x000000, 0.001);
    // 透视相机
    // camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 50000);
    // camera.position.set(0, 700, 7000);
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    // controls.autoRotate = true;
    controls.addEventListener("change", () => {
      console.log(`output->change`, camera.position);
    });

    // parent = new Object3D();
    // scene.add(parent);
    // const grid = new Points(new PlaneGeometry(15000, 15000, 64, 64), new PointsMaterial({ color: 0xff0000, size: 10 }));
    // grid.position.y = -400;
    // grid.rotation.x = -Math.PI / 2;
    // parent.add(grid);
    // parent.rotation.y += -0.02 * 10;

    this.initModal();
    this.initLight();

    this.addEventFun();
  };

  initLight() {
    const light = new AmbientLight(0xffffff, 0.8);
    scene.add(light);
  }

  initModal() {
    const dracoLoader = new DRACOLoader();
    // 离谱，使用本地无法加载
    dracoLoader.setDecoderPath(`https://ysdl-model.oss-cn-shenzhen.aliyuncs.com/libs/r122/draco/`);
    dracoLoader.preload();
    const gltfLoader = new GLTFLoader();
    gltfLoader.setCrossOrigin("anonymous");
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/model2/ramenHologram.gltf", // mushy_buddy statue
      (gltf: any) => {
        let model = gltf.scene;
        console.log("model", model);

        const box = new Box3().setFromObject(model); // 获取模型的包围盒
        const pos = box.getCenter(new Vector3());
        model.position.y = -pos.y;
        const height = box.max.y;
        const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360)); // 360
        camera.position.set(pos.x, pos.y, dist * 1.5);
        console.log("first", camera.position);

        positions = this.combineBuffer(model, "position");
        this.createMesh(positions, scene, 1.05, 8.08, -98.98, 0, 0xffdd44); // 部分参考上面设置 camera.position
        // scene.add(model);
        dracoLoader.dispose();

        this.addGui();
      },
      (xhr) => {
        // console.log("xhr", xhr);
      },
      (err) => {
        console.log("err", err);
      }
    );
  }

  combineBuffer(model: any, bufferName: string) {
    let count = 0;
    model.traverse((child: any) => {
      if (child.isMesh) {
        const buffer = child.geometry.attributes[bufferName];
        count += buffer.array.length;
      }
    });

    const combined = new Float32Array(count);
    let offset = 0;
    model.traverse((child: any) => {
      if (child.isMesh) {
        const buffer = child.geometry.attributes[bufferName];
        combined.set(buffer.array, offset);
        offset += buffer.array.length;
      }
    });

    return new BufferAttribute(combined, 3);
  }

  createMesh(positions: BufferAttribute, scene: Scene, scale: number, x: number, y: number, z: number, color: number) {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", positions.clone());
    geometry.setAttribute("initialPosition", positions.clone());

    geometry.attributes.position.setUsage(DynamicDrawUsage);

    mesh = new Points(
      geometry,
      new PointsMaterial({
        size: 0.01,
        sizeAttenuation: true,
        depthWrite: false,
        blending: AdditiveBlending,
        color: new Color(color),
      })
    );
    // mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    scene.add(mesh);
  }

  // 添加监听
  addEventFun() {
    //事件监听
    window.addEventListener("resize", this.onWindowResize, false);
  }

  // 控制波动
  addGui() {
    let gui = new dat.GUI();
    gui.add(mesh.position, "x").min(-800).max(800).step(1).name("x");
    gui.add(mesh.position, "y").min(-800).max(800).step(1).name("y");
    gui.add(mesh.position, "z").min(-800).max(800).step(1).name("z");
  }

  onWindowResize() {
    window.addEventListener("resize", () => {
      // Update camera
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  animation() {
    // TWEEN.update(); // !!!
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container"></div>;
  }
}

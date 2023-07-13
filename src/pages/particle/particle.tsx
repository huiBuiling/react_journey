import { Component } from "react";
// import LegacyJSONLoader from "@/assets/particle/LegacyJSONLoader";
import * as dat from "lil-gui";
import {
  AmbientLight,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
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
let controls: any;

let positions: any, initialPositions: any, mesh: any;
let count: number;
let data: any = {
  // speed: 10,
  // delay: 500,
  // verticesDown: 0,
  // verticesUp: 1025690,
  // direction: 1,
  // start: 0, // Math.floor(100 + 200 * Math.random()),

  // 掉落数据
  speed: 15,
  delay: 500,
  verticesDown: 0,
  verticesUp: 3074825,
  direction: -1,
  start: 0, // Math.floor(100 + 200 * Math.random()),
};

let isDrop = false,
  isFirst = 0;

let coordinate: any = {
  d: 0,
  px: 0,
  py: 0,
  pz: 0,
  ix: 0,
  iy: 0,
  iz: 0,
  dx: 0,
  dy: 0,
  dz: 0,
  // d: 0.7094917297363281,
  // dx: 0.29211997985839844,
  // dy: 0.12525177001953125,
  // dz: 0.3401832580566406,
  // ix: 13.66729736328125,
  // iy: 110.87184143066406,
  // iz: -43.82656478881836,
  // px: 15.386817932128906,
  // py: -0.4157503545284271,
  // pz: -41.0230827331543,
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

    if (mesh) {
      this.raiseHologram();
    }
  }

  init = () => {
    clock = new Clock();
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
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

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
    // 离谱，使用本地 /public 无法加载
    dracoLoader.setDecoderPath(`https://ysdl-model.oss-cn-shenzhen.aliyuncs.com/libs/r122/draco/`);
    // dracoLoader.setDecoderPath("/");
    dracoLoader.preload();
    const gltfLoader = new GLTFLoader();
    // gltfLoader.setCrossOrigin("anonymous");
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/model2/ramenHologram.gltf", // mushy_buddy statue
      (gltf: any) => {
        let model = gltf.scene;
        console.log("model", model);

        const box = new Box3().setFromObject(model); // 获取模型的包围盒
        const pos = box.getCenter(new Vector3());
        // model.position.y = -pos.y;
        const height = box.max.y;
        const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360)); // 360
        camera.position.set(pos.x, pos.y, dist * 1.5);
        console.log("first", camera.position);

        positions = this.combineBuffer(model, "position");
        this.createMesh(positions, scene, 1.05, 8.08, -98.98, 0, 0x18bbf2); // 部分参考上面设置 camera.position
        // this.createMesh(positions, scene, 0.0225, -0.1, 4.5, -0.95, 0x18bbf2); // 部分参考上面设置 camera.position
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
    // 获取顶点数量
    let _count = 0;
    model.traverse((child: any) => {
      if (child.isMesh) {
        const buffer = child.geometry.attributes[bufferName];
        // child.geometry.attributes.position
        _count += buffer.array.length;
      }
    });

    const combined = new Float32Array(_count);
    let offset = 0;
    model.traverse((child: any) => {
      if (child.isMesh) {
        const buffer = child.geometry.attributes[bufferName];
        combined.set(buffer.array, offset);
        offset += buffer.array.length;
      }
    });

    data = { ...data, verticesUp: _count };
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
        size: 1,
        sizeAttenuation: true,
        depthWrite: false,
        // blending: AdditiveBlending, // PointsMaterial 粒子设置颜色不生效问题
        color: new Color(color),
      })
    );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    // console.log("mesh", mesh);
    scene.add(mesh);

    data = { ...data, mesh };
    console.log("data", data);
  }

  // 添加监听
  addEventFun() {
    //事件监听
    window.addEventListener("resize", () => this.onWindowResize(), false);
    window.addEventListener("click", () => this.onWindowClick(), false);
  }

  // 控制波动
  addGui() {
    let gui = new dat.GUI();
    gui.add(mesh.position, "x").min(-800).max(800).step(1).name("x");
    gui.add(mesh.position, "y").min(-800).max(800).step(1).name("y");
    gui.add(mesh.position, "z").min(-800).max(800).step(1).name("z");
  }

  onWindowClick() {
    console.log("click", isDrop, data, coordinate);
    // if (!isDrop) {
    //   this.raiseHologram();
    //   isDrop = true;
    // } else {
    //   this.breakDown();
    //   isDrop = false;
    // }
    this.breakDown();
    setTimeout(() => {
      this.raiseHologram();
    }, 5000);
  }

  onWindowResize() {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  raiseHologram() {
    console.log("first, isEnd", isFirst);
    if (data.verticesDown >= count) {
      data.direction = 1;
      data.verticesDown = 0;
      data.speed = 5;
      data.delay = 600;
    }
  }

  breakDown() {
    if (data.verticesUp >= count) {
      data.direction = -1;
      data.verticesUp = 0;
    }
  }

  animation() {
    // TWEEN.update(); // !!!
    if (mesh) {
      // mesh.rotation.y += 0.01;
      this.updateAnimation();
      // if (isFirst == 1) {
      //   setTimeout(() => {
      //     this.raiseHologram();
      //   }, 2000);
      // }
    }
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  updateAnimation() {
    let delta = 10 * clock.getDelta();
    delta = delta < 2 ? delta : 2;

    positions = data.mesh.geometry.attributes.position;
    initialPositions = data.mesh.geometry.attributes.initialPosition;

    count = positions.count;

    if (data.start > 0) {
      data.start -= 1;
    } else {
      if (data.direction === 0) {
        data.direction = -1;
      }
    }

    for (let i = 0; i < count; i++) {
      coordinate.px = positions.getX(i);
      coordinate.py = positions.getY(i);
      coordinate.pz = positions.getZ(i);

      // falling down
      if (data.direction < 0) {
        if (coordinate.py > 0) {
          positions.setXYZ(
            i,
            coordinate.px + 1.5 * (0.5 - Math.random()) * data.speed * delta,
            coordinate.py + 3.0 * (0.25 - Math.random()) * data.speed * delta,
            coordinate.pz + 1.5 * (0.5 - Math.random()) * data.speed * delta
          );
        } else {
          data.verticesDown += 1;
        }

        isDrop = false;
      }

      // rising up
      if (data.direction > 0) {
        coordinate.ix = initialPositions.getX(i);
        coordinate.iy = initialPositions.getY(i);
        coordinate.iz = initialPositions.getZ(i);

        coordinate.dx = Math.abs(coordinate.px - coordinate.ix);
        coordinate.dy = Math.abs(coordinate.py - coordinate.iy);
        coordinate.dz = Math.abs(coordinate.pz - coordinate.iz);

        coordinate.d = coordinate.dx + coordinate.dy + coordinate.dx;

        if (coordinate.d > 1) {
          positions.setXYZ(
            i,
            coordinate.px -
              ((coordinate.px - coordinate.ix) / coordinate.dx) * data.speed * delta * (0.85 - Math.random()),
            coordinate.py -
              ((coordinate.py - coordinate.iy) / coordinate.dy) * data.speed * delta * (1 + Math.random()),
            coordinate.pz -
              ((coordinate.pz - coordinate.iz) / coordinate.dz) * data.speed * delta * (0.85 - Math.random())
          );
        } else {
          data.verticesUp += 1;
        }

        isDrop = true;
      }
    }

    // all vertices down (go up)

    // if (data.verticesDown >= count && animate === true) {
    //   if (data.delay <= 0) {
    //     data.direction = 1;
    //     data.speed = 5;
    //     data.verticesDown = 0;
    //     // data.delay = 1000;
    //   } else {
    //     data.delay -= 1;
    //   }
    // }
    // console.log("positions", positions);
    positions.needsUpdate = true;
    isFirst += 1;
  }

  render() {
    return <div id="container"></div>;
  }
}

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
  Clock,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  sRGBEncoding,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any;

let positions: any, initialPositions: any, mesh: any;
let count: number,
  animate: boolean,
  started: boolean = true;
let data: any = {
  speed: 10,
  delay: 500,
  verticesDown: 0,
  verticesUp: 0,
  direction: 0,
  start: Math.floor(100 + 200 * Math.random()),
};

let isDrop = true;

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
};

/**
 * 绚丽地球
 * https://joy1412.cn/pages/threejsearth/#%E5%8A%A8%E6%80%81%E6%98%9F%E7%A9%BA%E8%83%8C%E6%99%AF%E4%BB%8B%E7%BB%8D
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
    clock = new Clock();
    container = document.getElementById("container");
    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器的输出编码
    // renderer.outputEncoding = sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 生成场景
    scene = new Scene();
    scene.background = new Color(0x020924);
    scene.fog = new Fog(0x020924, 200, 1000);
    // 透视相机
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(5, -20, 200);
    camera.lookAt(0, 3, 0);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2;
    controls.enablePan = true;
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    this.initLight();
    this.addEventFun();

    this.initPoint();

    // this.initModal();
  };

  initLight() {
    const ambientLight = new AmbientLight(0xcccccc, 1.1);
    scene.add(ambientLight);
    var directionalLight = new DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(1, 0.1, 0).normalize();
    var directionalLight2 = new DirectionalLight(0xff2ffff, 0.2);
    directionalLight2.position.set(1, 0.1, 0.1).normalize();
    scene.add(directionalLight);
    scene.add(directionalLight2);
    var hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.2);
    hemiLight.position.set(0, 1, 0);
    scene.add(hemiLight);
    var directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(1, 500, -20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 18;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -52;
    directionalLight.shadow.camera.right = 12;
    scene.add(directionalLight);
  }

  initPoint() {
    const positions = [];
    const colors = [];
    const geometry = new BufferGeometry();
    for (var i = 0; i < 10000; i++) {
      var vertex = new Vector3();
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      positions.push(vertex.x, vertex.y, vertex.z);
      var color = new Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(
      `/textures/other/.png`,
      (texture) => {
        texture.encoding = sRGBEncoding;
        texture.flipY = false;
      },
      // xhr => {
      //   console.log('xhr', xhr)
      // },
      (err) => {
        // console.log('err', err)
      }
    );

    var starsMaterial = new PointsMaterial({
      // map: texture,
      size: 1,
      transparent: true,
      opacity: 1,
      vertexColors: true, //true：且该几何体的colors属性有值，则该粒子会舍弃第一个属性--color，而应用该几何体的colors属性的颜色
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });

    let stars = new Points(geometry, starsMaterial);
    stars.scale.set(300, 300, 300);
    scene.add(stars);
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
        model.position.y = -pos.y;
        const height = box.max.y;
        const dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360)); // 360
        camera.position.set(pos.x, pos.y, dist * 1.5);
        console.log("first", camera.position);

        positions = this.combineBuffer(model, "position");
        this.createMesh(positions, scene, 1.05, 8.08, -98.98, 0, 0x18bbf2); // 部分参考上面设置 camera.position
        // scene.add(model);
        dracoLoader.dispose();

        this.addGui();

        this.breakDown();
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
    let count = 0;
    model.traverse((child: any) => {
      if (child.isMesh) {
        const buffer = child.geometry.attributes[bufferName];
        // child.geometry.attributes.position
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
        size: 0.05,
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
    console.log("click", isDrop);
    if (isDrop) {
      this.raiseHologram();
      isDrop = false;
    } else {
      this.breakDown();
      isDrop = true;
    }
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
    if (data.verticesDown >= count) {
      data.direction = 1;
      data.verticesDown = 0;
      data.speed = 5;
      // data.delay = 500;
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
  }

  render() {
    return <div id="container"></div>;
  }
}

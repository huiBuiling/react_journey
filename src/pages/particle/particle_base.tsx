import { Component } from "react";

import TWEEN from "@tweenjs/tween.js";
import * as dat from "lil-gui";
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  DirectionalLight,
  FogExp2,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  // 输出编码
  sRGBEncoding,
  TextureLoader,
  Vector3,
  // VertexColors,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any,
  layerGroup: any,
  layers: any[],
  aspect = 18;
let ambientLight: AmbientLight, directionLight: DirectionalLight;
let dialogBox: any = null,
  step = 0;
let geometry: any, around, textureLoader, gradient, material: any, particles: any;

/**
 * 粒子系统
 * https://www.wolai.com/6xAtAwPABZW5iH8bfRVkGA
 *
 * 参考：https://juejin.cn/post/7155278132806123557
 */

interface IProps {}
interface IState {
  // isLoading: Boolean;
}
export default class Particle extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      // isLoading: true,
    };
  }

  componentDidMount() {
    this.init();
    this.animation();

    this.loadModel();
  }

  init = () => {
    container = document.getElementById("container");
    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器的输出编码
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 生成场景
    scene = new Scene();
    // 雾化
    scene.fog = new FogExp2(0x000000, 0.001);
    // 透视相机
    camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(12, 0, 0);
    // camera.position.set(0, 0, 12);
    camera.lookAt(new Vector3(0, 0, 0));
    scene.add(camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true; // 禁用摄像机平移
    controls.enablePan = false; // 阻尼
    // 垂直旋转角度限制
    controls.minPolarAngle = 1.5;
    controls.maxPolarAngle = 1.7;
    // 水平旋转角度限制
    controls.minAzimuthAngle = -0.5; // 向右
    controls.maxAzimuthAngle = 0.3; // 向左

    controls.addEventListener("change", () => {
      console.log(`output->change`, controls);
    });

    // 初始化geometry
    geometry = new BufferGeometry();
    around = new BufferGeometry();

    // 初始化贴图
    textureLoader = new TextureLoader();
    gradient = textureLoader.load(require("../../assets/particle/gradient.png")); // 圆点

    // this.addLight();
    // this.carrierParticleSystem();
    // this.addBoom();
    // this.addGui();
    // this.addAnimation();
  };

  // 初始化载体粒子体系
  initpointsMeshAnimate(pointsMesh: any, targetMesh: any) {
    // 源模型的顶点
    const originVertices = pointsMesh.geometry.attributes.position.count;
    // 目标模型的顶点
    const targetVertices = targetMesh.geometry.attributes.position.count;

    debugger;

    // 源粒子数大于目标模型顶点数 需减少
    // if (originVertices > targetVertices) {
    //   pointsMesh.geometry.attributes.position = originVertices.slice(0, targetVertices);
    // }
    // // 源粒子数小于目标模型顶点数 需补齐
    // if (originVertices < targetVertices) {
    //   pointsMesh.geometry.attributes.position = originVertices.concat(
    //     new Array(targetVertices - originVertices).fill(0).map(() => new Vector3())
    //   );
    // }

    // 遍历每一个粒子
    pointsMesh.geometry.attributes.position.forEach(async (v, i, vertices) => {
      // 粒子从原始位置到目标位置的平滑移动，完成时间2000ms
      new TWEEN.Tween({
        x: vertices[i % originVertices].x,
        y: vertices[i % originVertices].y,
        z: vertices[i % originVertices].z,
      })
        .to(
          {
            x: targetVertices[i].x,
            y: targetVertices[i].y,
            z: targetVertices[i].z,
          },
          2000
        )
        .onUpdate(({ x, y, z }) => {
          pointsMesh.geometry.vertices[i].set(x, y, z);
          pointsMesh.geometry.verticesNeedUpdate = true;
        })
        .delay(500)
        .yoyo(true)
        .repeat(Infinity)
        .start(); // 开始动画
    });
  }
  // 添加监听
  addEventFun() {}
  // 加载模型
  loadModel() {
    const material = new MeshBasicMaterial({ color: 0x008888 });

    // 盒子
    const cubeGeometry = new BoxGeometry(40, 40, 40, 20, 20, 20);
    const cube = new Mesh(cubeGeometry, material);
    cube.position.x = -60;

    // 球
    const ballGeometry = new SphereGeometry(20, 40, 32);
    const ball = new Mesh(ballGeometry.clone(), material);
    ball.position.x = 60;

    // points
    const points = new Points(
      ballGeometry,
      new PointsMaterial({
        size: 0.4,
        color: 0x00ffff,
      })
    );
    points.scale.x = 1.5;
    points.scale.y = 1.5;
    points.scale.z = 1.5;

    this.initpointsMeshAnimate(points, cube);

    scene.add(ball);
    scene.add(cube);
    scene.add(points);
  }

  //
  // addAnimation() {}

  // 控制波动
  addGui() {
    let gui = new dat.GUI();
    gui.add(directionLight.position, "x").min(-50).max(50).step(1).name("pointLight_x");
    gui.add(directionLight.position, "y").min(-50).max(50).step(1).name("pointLight_y");
    gui.add(directionLight.position, "z").min(-50).max(50).step(1).name("pointLight_z");
    // 颜色
    gui.addColor(directionLight, "color").onChange((val: string) => {
      directionLight.color.set(val);
    });

    gui.add(controls, "minPolarAngle").min(-10).max(10).step(0.1).name("minPolarAngle");
    gui.add(controls, "maxPolarAngle").min(-10).max(10).step(0.1).name("maxPolarAngle");
    gui.add(controls, "minAzimuthAngle").min(-6).max(6).step(0.1).name("minAzimuthAngle");
    gui.add(controls, "maxAzimuthAngle").min(-6).max(6).step(0.1).name("maxAzimuthAngle");
  }

  resize() {
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
    TWEEN.update(); // !!!
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container"></div>;
  }
}

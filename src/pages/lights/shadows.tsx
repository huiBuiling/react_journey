import { Component } from "react";
import {
  Clock,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  TextureLoader,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  CameraHelper,
  PCFSoftShadowMap,
} from "three";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, material: any, gui: any;
let sphere: Mesh, plane: Mesh;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;

/**
 * 阴影
 * https ://threejs.org/examples/webgl_shadowmap_viewer.html
 * https://www.bilibili.com/video/BV1wY4y1h765?p=16
 * https://journey.pmnd.rs/classic-techniques/lights
 */
export default class Shadows extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new Clock();
    gui = new dat.GUI();

    // 生成场景
    scene = new Scene();

    // 透视相机
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(1, 1, 2);
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    // 激活阴影贴图
    renderer.shadowMap.enabled = true;
    // 阴影贴图算法
    renderer.shadowMap.type = PCFSoftShadowMap;
    this.initLight();

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    this.initBasicMaterial();
  };

  /**
   * DirectionalLight: 定向光
   * PointLight: 点光源
   * SpotLight: 聚光灯
   */
  initLight() {
    // Ambient light
    ambientLight = new AmbientLight(0xffffff, 0.3);
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
    scene.add(ambientLight);

    // Directional light
    directionalLight = new DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(2, 2, -1);
    // 开启阴影
    directionalLight.castShadow = true;
    /**
     * 需要指定一个大小
     * - 默认情况下，阴影贴图大小仅512x512出于性能原因
     * - mipmapping 需要 2 的幂
     * 调整
     */
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    // 调整适合场景的贴图的相机值
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 6;

    /**
     * 相机的幅度太大，调整为合适的距离
     * 注意：值越小，阴影就越精确。但如果它太小，阴影将被裁剪
     *
     * 更改属性
     * 由于DirectionalLight对应的是 OrthographicCamera
     * 所以调整 top, right, bottom, left
     */
    // 相机的幅度太大，调整为合适的距离
    //
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;

    // 模糊阴影，PCFSoftShadowMap开启，故舍弃radius
    // directionalLight.shadow.radius = 10;

    scene.add(directionalLight);

    // 阴影贴图的相机助手
    const dirLightCameraHelper = new CameraHelper(directionalLight.shadow.camera);
    scene.add(dirLightCameraHelper);

    gui.add(directionalLight, "intensity").min(0).max(1).step(0.001);
    gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
    gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
    gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);

    // 隐藏相机助手
    dirLightCameraHelper.visible = false;

    // Spot light
    const spotLight = new SpotLight(0xffffff, 0.8, 10, Math.PI * 0.3);
    spotLight.castShadow = true;
    spotLight.position.set(0, 2, 2);

    // 改善阴影质量
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    /**
     * 更改属性
     * 由于SpotLight对应的是 PerspectiveCamera，
     * 故调整 left，fov
     * 更改near和far值
     */
    spotLight.shadow.camera.fov = 30;
    // spotLight.shadow.camera.near = 1;
    // spotLight.shadow.camera.far = 6;

    scene.add(spotLight);
    scene.add(spotLight.target);

    // 阴影贴图的相机助手
    const spotLightCameraHelper = new CameraHelper(spotLight.shadow.camera);
    scene.add(spotLightCameraHelper);
    spotLightCameraHelper.visible = false;

    // Point light
    const pointLight = new PointLight(0xffffff, 0.3);
    pointLight.castShadow = true;
    pointLight.position.set(-1, 1, 0);
    scene.add(pointLight);

    // 调整属性
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;

    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 5;

    const pointLightCameraHelper = new CameraHelper(pointLight.shadow.camera);
    scene.add(pointLightCameraHelper);
    pointLightCameraHelper.visible = false;
  }

  /**
   * ShapeGeometry: 形状缓冲几何体
   */
  initBasicMaterial = () => {
    material = new MeshStandardMaterial();
    material.roughness = 0.7;

    gui.add(material, "metalness").min(0).max(1).step(0.001);
    gui.add(material, "roughness").min(0).max(1).step(0.001);

    // Objects
    sphere = new Mesh(new SphereGeometry(0.5, 32, 32), material);
    sphere.position.x = -0.5;
    sphere.castShadow = true; // 开启阴影

    plane = new Mesh(new PlaneGeometry(5, 5), material);
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.5;
    plane.receiveShadow = true; // 开启阴影

    scene.add(sphere, plane);
  };

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

  render() {
    return <div id="webgl"></div>;
  }
}

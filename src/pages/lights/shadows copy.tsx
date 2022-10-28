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
  HemisphereLight,
  PointLight,
  RectAreaLight,
  Vector3,
  SpotLight,
  HemisphereLightHelper,
  DirectionalLightHelper,
  PointLightHelper,
  SpotLightHelper,
  CameraHelper,
  //
  MeshPhysicalMaterial,
} from "three";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, material: any, gui: any;
let sphere: Mesh, plane: Mesh;

let ambientLight: AmbientLight,
  directionalLight: DirectionalLight,
  hemisphereLight: HemisphereLight,
  pointLight: PointLight,
  rectAreaLight: RectAreaLight,
  spotLight: SpotLight;

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

    // light
    this.initLight();

    // 渲染
    renderer = new WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    this.initBasicMaterial();
  };

  /**
   * AmbientLight: 环境光
   * DirectionalLight: 定向光
   * HemisphereLight: 半球光
   *
   * PointLight: 点光源
   *
   * RectAreaLight: 矩形区域光
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
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 6;
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;

    scene.add(directionalLight);

    const dirLightCameraHelper = new CameraHelper(directionalLight.shadow.camera);
    scene.add(dirLightCameraHelper);

    gui.add(directionalLight, "intensity").min(0).max(1).step(0.001);
    gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
    gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
    gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
    dirLightCameraHelper.visible = false;

    directionalLight.shadow.radius = 10;

    spotLight = new SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3);
    spotLight.position.set(0, 2, 2);
    // 报错 why
    // spotLight.castShadow = true;
    scene.add(spotLight);
    // scene.add(spotLight.target);
    // spotLight.shadow.mapSize.width = 1024;
    // spotLight.shadow.mapSize.height = 1024;
    // spotLight.shadow.camera.fov = 30;
    // spotLight.shadow.camera.near = 1;
    // spotLight.shadow.camera.far = 6;

    // const spotLightHelper = new CameraHelper(spotLight.shadow.camera);
    // scene.add(spotLightHelper);
    // spotLightHelper.visible = false;

    // const pointLight = new PointLight(0xffffff, 0.3);
    // pointLight.castShadow = true;
    // pointLight.position.set(-1, 1, 0);
    // scene.add(pointLight);

    // pointLight.shadow.mapSize.width = 1024;
    // pointLight.shadow.mapSize.height = 1024;

    // pointLight.shadow.camera.near = 0.1;
    // pointLight.shadow.camera.far = 5;

    // const pointLightHelper = new CameraHelper(pointLight.shadow.camera);
    // scene.add(pointLightHelper);
    // pointLightHelper.visible = false;
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
    sphere.position.x = -1.5;
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
    const elapsedTime = clock.getElapsedTime();

    // Update the sphere
    // sphere.position.x = Math.cos(elapsedTime) * 1.5;
    // sphere.position.z = Math.sin(elapsedTime) * 1.5;
    // sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

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

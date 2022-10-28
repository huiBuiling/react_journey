import { Component } from "react";
import {
  Clock,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  TextureLoader,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  BoxGeometry,
  TorusGeometry,
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
} from "three";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, material: any;
let sphere: Mesh;

let ambientLight: AmbientLight,
  directionalLight: DirectionalLight,
  hemisphereLight: HemisphereLight,
  pointLight: PointLight,
  rectAreaLight: RectAreaLight,
  spotLight: SpotLight;

/**
 * 阴影
 * https ://threejs.org/examples/webgl_shadowmap_viewer.html
 *
 */
export default class Shadows extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new Clock();

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

    // this.initGui();
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
    ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new DirectionalLight(0xf0a59b, 0.3);
    directionalLight.position.set(1, 0.25, 0);
    scene.add(directionalLight);

    hemisphereLight = new HemisphereLight(0xff0000, 0x0000ff, 0.3);
    scene.add(hemisphereLight);

    // pointLight = new PointLight(0xff9000, 0.5);
    // pointLight.position.set(1, -0.5, 1);
    pointLight = new PointLight(0xff9000, 0.5, 10, 2);
    scene.add(pointLight);

    rectAreaLight = new RectAreaLight(0x4e00ff, 2, 1, 1);
    rectAreaLight.position.set(-1.5, 0, 1.5);
    rectAreaLight.lookAt(new Vector3());
    scene.add(rectAreaLight);

    spotLight = new SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1);
    spotLight.position.set(0, 2, 3);
    scene.add(spotLight);
    // 光源移动
    spotLight.target.position.x = -0.75;
    scene.add(spotLight.target);

    // 助手
    const hemisphereLightHelper = new HemisphereLightHelper(hemisphereLight, 0.2);
    scene.add(hemisphereLightHelper);

    const directionalLightHelper = new DirectionalLightHelper(directionalLight, 0.2);
    scene.add(directionalLightHelper);

    const pointLightHelper = new PointLightHelper(pointLight, 0.2);
    scene.add(pointLightHelper);

    const spotLightHelper = new SpotLightHelper(spotLight);
    scene.add(spotLightHelper);
    window.requestAnimationFrame(() => {
      spotLightHelper.update();
    });

    const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
    scene.add(rectAreaLightHelper);
  }

  initGui = () => {
    const gui = new dat.GUI();
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
  };

  /**
   * ShapeGeometry: 形状缓冲几何体
   */
  initBasicMaterial = () => {
    // Material
    material = new MeshStandardMaterial();
    material.roughness = 0.4; // 粗糙度

    // Objects
    sphere = new Mesh(new SphereGeometry(0.5, 32, 32), material);
    sphere.position.x = -1.5;

    const plane = new Mesh(new PlaneGeometry(5, 5), material);
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.5;
    plane.receiveShadow = true;

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
    sphere.position.x = Math.cos(elapsedTime) * 1.5;
    sphere.position.z = Math.sin(elapsedTime) * 1.5;
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

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

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
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import * as dat from "lil-gui";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, material: any;
let sphere: Mesh, plane: Mesh, sphereShadow: any;

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
    // gui = new dat.GUI();

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

    // Baking阴影
    renderer.shadowMap.enabled = false;
    this.initLight();

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    this.initBasicMaterial();
  };

  initLight() {
    // Ambient light
    ambientLight = new AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional light
    directionalLight = new DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(2, 2, -1);
    scene.add(directionalLight);

    const spotLight = new SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3);
    spotLight.position.set(0, 2, 2);
    scene.add(spotLight);

    const pointLight = new PointLight(0xffffff, 0.3);
    pointLight.position.set(-1, 1, 0);
    scene.add(pointLight);
  }

  /**
   * ShapeGeometry: 形状缓冲几何体
   */
  initBasicMaterial = () => {
    // shadow add
    const textureLoader = new TextureLoader();
    // 对应public文件夹下的资源
    const bakedShadow = textureLoader.load("/textures/shadows/bakedShadow.jpg");
    const simpleShadow = textureLoader.load("/textures/shadows/simpleShadow.jpg");

    material = new MeshStandardMaterial();
    material.roughness = 0.7;

    // Objects
    sphere = new Mesh(new SphereGeometry(0.5, 32, 32), material);
    sphere.castShadow = true; // 开启阴影

    plane = new Mesh(
      new PlaneGeometry(5, 5),
      // new MeshBasicMaterial({
      //   map: bakedShadow,
      // })
      material
    );
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.5;
    plane.receiveShadow = true; // 开启阴影

    sphereShadow = new Mesh(
      new PlaneGeometry(1.5, 1.5),
      new MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        alphaMap: simpleShadow,
      })
    );
    sphereShadow.rotation.x = -Math.PI * 0.5;
    sphereShadow.position.y = plane.position.y + 0.01;

    scene.add(sphere, plane, sphereShadow);
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

    // Update the shadow
    sphereShadow.position.x = sphere.position.x;
    sphereShadow.position.z = sphere.position.z;
    // sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3;
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.5;

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

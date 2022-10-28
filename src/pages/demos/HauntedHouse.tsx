import { Component } from "react";
import {
  Clock,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  TextureLoader,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  BoxGeometry,
  TorusGeometry,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import doorImg from "@/assets/textures/matcaps/6.png";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, material: any;
let sphere: Mesh, cube: Mesh, plane: Mesh, torus: Mesh;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;

/**
 * 鬼屋
 */
export default class HauntedHouse extends Component {
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

    // light
    this.initLight();

    this.initGui();
  };

  initLight() {
    ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new DirectionalLight(0x00fffc, 0.3);
    scene.add(directionalLight);
  }

  /**
   * ShapeGeometry: 形状缓冲几何体
   */
  initBasicMaterial = () => {
    // Material
    // const material = new MeshStandardMaterial();
    // material.roughness = 0.4;

    //
    const textureLoader = new TextureLoader().load(doorImg);
    material = new MeshBasicMaterial({
      // color: 0xffffff,
    });
    material.map = textureLoader;

    // Objects
    sphere = new Mesh(new SphereGeometry(0.5, 32, 32), material);
    sphere.position.x = -1.5;

    cube = new Mesh(new BoxGeometry(0.75, 0.75, 0.75), material);

    torus = new Mesh(new TorusGeometry(0.3, 0.2, 32, 64), material);
    torus.position.x = 1.5;

    plane = new Mesh(new PlaneGeometry(5, 5), material);
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.65;

    scene.add(sphere, cube, torus, plane);
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

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime;
    cube.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    cube.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    // Update controls
    controls.update();
    // Render
    renderer.render(scene, camera);
    // Call tick again on the next frame
    requestAnimationFrame(this.animation.bind(this));
  }

  /**
   *
   */
  initGui = () => {
    const gui = new dat.GUI();
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
  };

  render() {
    return <div id="webgl"></div>;
  }
}

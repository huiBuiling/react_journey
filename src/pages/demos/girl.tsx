import * as dat from "lil-gui";
import { Component } from "react";
import {
  AmbientLight,
  // animation
  AnimationMixer,
  Box3,
  Clock,
  Color,
  DirectionalLight,
  LoopOnce,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
// import TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./style.css";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;

let tweenStart,
  tweenStop,
  isPlayIng: boolean,
  isLoop: boolean,
  mixer: any,
  animationsList: any[] = [];

/**
 * 酷女孩
 * https://sketchfab.com/3d-models/girl-cartoon-cyber-by-oscar-creativo-5092e20e84754029ab1c49848a007639
 */
export default class Mushroom extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();
    scene.background = new Color(0xffffff);

    // 透视相机
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.set(0, 10, 0);
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 用来获取相机合适的显示位置
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    let pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader(); // search
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment.encoding = 3001; // 3002

    // 不加动画时
    // renderer.render(scene, camera);

    this.initModel();
    // light
    // this.initLight();

    // this.initGui();
  };

  // 加载模型
  initModel() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/public");
    // dracoLoader.preload();
    const gltfLoader = new GLTFLoader();
    // gltfLoader.setCrossOrigin("anonymous");
    gltfLoader.setDRACOLoader(dracoLoader);
    let loadProgress = 0;
    gltfLoader.load(
      "/model/girl_cartoon_cyber_by_oscar_creativo.glb",
      (res) => {
        const model = res.scene;
        // model.position.set(0, 0, -2); // z缩小
        // model.rotation.set(0, 0, 0);
        // model.scale.set(0.03, 0.03, 0.03);
        // model.scale.set(1, 1, 1);

        if (res.animations && res.animations.length > 0) {
          this.playAnim(res);
        }

        this.settingModel(model);
        scene.add(model);
        console.log("model", model);
      },
      (xhr) => {
        loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
        console.log("loadProgress", loadProgress);
      }
    );
  }
  playAnim(_data: any) {
    console.log("modelData", _data.animations);
    mixer = new AnimationMixer(_data.scene);
    const animations = _data.animations;
    for (const animation of animations) {
      const action = mixer.clipAction(animation);
      action.setLoop(LoopOnce); // 不循环播放 setLoop(LoopMode,repetitions)设置循环模式和循环次数
      action.clampWhenFinished = true; // 暂停在最后一帧播放的状态
      // action.time = 10 //操作对象设置开始播放时间
      // animation.duration = 18 //剪辑对象设置播放结束时间

      // tweenStart = new TWEEN.Tween(action).easing(TWEEN.Easing.Linear.None).onUpdate(() => {
      //   action.play()
      // }, 3000)
      // tweenStop = new TWEEN.Tween(action).easing(TWEEN.Easing.Linear.None).onUpdate(() => {
      //   action.stop()
      // }, 3000)
      animationsList.push(action);
    }

    mixer.addEventListener("finished", (e) => {
      console.log("播放结束", e);
      isPlayIng = false;
      if (isLoop) {
        setTimeout(() => {
          this.loopAction();
        }, 5000);
      }
    });
    isPlayIng = true;
    animationsList[0].play();
    // tweenStart.start()
  }
  loopAction() {
    console.log("paused", animationsList[0].isRunning(), animationsList[0].paused);

    if (animationsList[0].paused) {
      //animationsList[0].isRunning()
      console.log("关闭动画且再次播放动画");
      animationsList[0].stop();
      // tweenStop.start()
    }
    isPlayIng = true;
    // tweenStart.start()
    animationsList[0].play();
  }
  activateAction() {
    if (isPlayIng) {
      isLoop = false;
      animationsList[0].stop();
      isPlayIng = false;
    } else {
      isLoop = true;
      this.loopAction();
    }
  }

  settingModel(object: any) {
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());

    // controls.reset()

    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    camera.position.copy(center);
    camera.position.x += size / 2.0;
    camera.position.y += size / 10.0;
    camera.position.z += size / 12.0;

    let _position: { x: number; y: number; z: number } = {
      x: 0.3198645659385441,
      y: 2.6462194910225993,
      z: 3.9745164855326696,
    };

    camera.position.copy(new Vector3(_position.x, _position.y, _position.z));

    console.log("camera", camera);
    controls.enabled = true;
    controls.autoRotate = true;
  }

  initLight() {
    ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new DirectionalLight(0x00fffc, 0.3);
    scene.add(directionalLight);
  }

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
    // Call tick again on the next frame
    requestAnimationFrame(this.animation.bind(this));
    const time = clock.getDelta();
    if (mixer) {
      mixer.update(time);
    }

    // Update controls
    controls.update();
    // Render
    renderer.render(scene, camera);
  }

  /**
   *
   */
  initGui = () => {
    const gui = new dat.GUI();
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
  };

  render() {
    return (
      <div id="webgl">
        <div className="play" onClick={() => this.activateAction}>
          <p>播放</p>
        </div>
      </div>
    );
  }
}

// else if (this.modelName == 'panda_coin2020') {
//   _position = {
//     x: 8.762391323529368,
//     y: -0.19028613156426544,
//     z: -0.7384535104995281
//   }
//   controls.autoRotate = true
// } else if (this.modelName == 'celebrate_coin') {
//   _position = {
//     x: -0.0005073440786635701,
//     y: 4.476648952241251,
//     z: 1.691504102856754
//   }
// } else if (this.modelName == 'coin90') {
//   _position = {
//     x: 0.03502915896753144,
//     y: -0.025947398199080065,
//     z: 0.5826238032191117
//   }
// } else if (this.modelName == 'he_coin') {
//   _position = {
//     x: -0.5828351301052059,
//     y: -0.033772671595415214,
//     z: -0.022658845895826882
//   }
// }

import { FC, useEffect } from "react";
import {
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import "./style.scss";

// 组件
let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, controls: PointerLockControls;

let objects: any[] = [];

let raycaster: any, position;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new Vector3();
const direction = new Vector3();
const vertex = new Vector3();
const color = new Color();

/**
 * PointerLockControls
 * 指针锁定控制器，常用于第一人称3D游戏
 * https://threejs.org/examples/#misc_controls_pointerlock
 */
const LockControl: FC<{}> = ({}) => {
  useEffect(() => {
    init();
    animation();
  }, []);

  const init = () => {
    // 生成场景
    scene = new Scene();
    scene.background = new Color(0xffffff);
    scene.fog = new Fog(0xffffff, 0, 750);

    const light = new HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    // 透视相机
    const aspect = window.innerWidth / window.innerHeight;
    camera = new PerspectiveCamera(75, aspect, 1, 1000);
    scene.add(camera);

    // 渲染
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);

    document.body.appendChild(renderer.domElement);
    // const threeMain = document.getElementById("webgl");
    // threeMain?.appendChild(renderer.domElement);

    raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);

    initControls();
    initListenEvent();
    initGeometry();
    initBoxGeometry();
  };

  // 初始化各类型控制器
  const initControls = () => {
    controls = new PointerLockControls(camera, document.body); // renderer.domElement

    let blocker: any = document.getElementById("blocker");
    let instructions: any = document.getElementById("instructions");
    instructions.addEventListener("click", function () {
      controls.lock();
    });

    // controls.enableDamping = true;
    controls.addEventListener("lock", function () {
      instructions.style.display = "none";
      blocker.style.display = "none";
    });

    controls.addEventListener("unlock", function () {
      blocker.style.display = "block";
      instructions.style.display = "";
    });
    scene.add(controls.getObject());
  };

  const initGeometry = () => {
    let floorGeometry: any = new PlaneGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);
    // vertex displacement
    position = floorGeometry.attributes.position;
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);
      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
    position = floorGeometry.attributes.position;
    const colorsFloor = [];
    for (let i = 0, l = position.count; i < l; i++) {
      color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      colorsFloor.push(color.r, color.g, color.b);
    }
    floorGeometry.setAttribute("color", new Float32BufferAttribute(colorsFloor, 3));

    const floorMaterial = new MeshBasicMaterial({ vertexColors: true });
    const floor = new Mesh(floorGeometry, floorMaterial);
    scene.add(floor);
  };

  const initBoxGeometry = () => {
    const boxGeometry = new BoxGeometry(20, 20, 20).toNonIndexed();
    position = boxGeometry.attributes.position;
    const colorsBox = [];
    for (let i = 0, l = position.count; i < l; i++) {
      color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      colorsBox.push(color.r, color.g, color.b);
    }
    boxGeometry.setAttribute("color", new Float32BufferAttribute(colorsBox, 3));
    for (let i = 0; i < 500; i++) {
      const boxMaterial = new MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: true });
      boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      const box = new Mesh(boxGeometry, boxMaterial);
      box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
      box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
      box.position.z = Math.floor(Math.random() * 20 - 10) * 20;
      scene.add(box);
      objects.push(box);
    }
  };

  // 初始化监听事件
  const initListenEvent = () => {
    window.addEventListener("resize", () => onWindowResize());
    window.addEventListener("keydown", () => onKeyDown(event));
    window.addEventListener("keyup", () => onKeyUp(event));
  };

  // 按键
  const onKeyDown = (event: any) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };
  const onKeyUp = (event: any) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };
  // 监听窗口变化
  const onWindowResize = () => {
    console.log("onWindowResize");
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animation = () => {
    requestAnimationFrame(animation.bind(this));
    // renderer.render(scene, camera);
    const time = performance.now();
    if (controls.isLocked === true) {
      raycaster.ray.origin.copy(controls.getObject().position);
      raycaster.ray.origin.y -= 10;

      const intersections = raycaster.intersectObjects(objects, false);

      const onObject = intersections.length > 0;
      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
      if (onObject === true) {
        velocity.y = Math.max(0, velocity.y);
        canJump = true;
      }

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
      controls.getObject().position.y += velocity.y * delta; // new behavior

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
      }
    }
    prevTime = time;
    renderer.render(scene, camera);
  };

  return (
    <div id="blocker">
      <div id="instructions">
        <p style={{ fontSize: 36 }}>Click to play</p>
        <p>
          Move: WASD
          <br />
          Jump: SPACE
          <br />
          Look: MOUSE
        </p>
      </div>
    </div>
  );
};
export default LockControl;

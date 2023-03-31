import { FC, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

const TransformControlsComp: FC<{}> = ({}) => {
  const [blueDevices, setBlueDevices] = useState<any>([]);

  let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
  let controls: OrbitControls, transformControls: TransformControls;

  const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.addEventListener("change", renderFun);

    transformControls = new TransformControls(camera, renderer.domElement);
    // 开启 TransformControls 的交互功能
    transformControls.addEventListener("change", renderFun);
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });

    transformControls.attach(cube);
    scene.add(transformControls);
  };

  const onDocumentMouseDown = (event: any) => {
    event.preventDefault();
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      transformControls.attach(object);
    }
  };

  const renderFun = () => {
    renderer.render(scene, camera);
    // console.log(`output->change`, camera.position);
    // console.log(`controls->change`, camera.position);
    console.log(`transformControls->scene`, scene);
  };

  // 渲染循环中更新 TransformControls
  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    init();
    // window.addEventListener("mousedown", onDocumentMouseDown, false);
    // window.addEventListener("touchstart", onDocumentMouseDown, false);
    animate();
  }, []);

  return <div id="webgl" className="webgl"></div>;
};
export default TransformControlsComp;

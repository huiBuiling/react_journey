import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * 纹理 -》材质
 * https://www.wjceo.com/blog/threejs/2018-02-09/9.html
 *
 * 重点：
 * map.wrapS = map.wrapT = THREE.RepeatWrapping;
 * map.anisotropy = 16;
 */
export default function Texts3D() {
  let canvas = document.getElementById("webgl");
  let width, height, renderer, scene;

  const initRender = () => {
    // 生成场景
    scene = new THREE.Scene();

    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    //设置canvas尺寸
    renderer.setSize(width, height);
    //设置背景
    renderer.setClearColor(0x000000, 1.0);
    //设置设备像素比
    renderer.setPixelRatio(window.devicePixelRatio);
    //添加到dom
    document.body.appendChild(renderer.domElement);
  };

  const init = () => {};

  return (
    <>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 20] }} id="canvas">
        <OrbitControls makeDefault />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="yellow" />
        <Suspense fallback={null}>
          <HelloText />
        </Suspense>
      </Canvas>
    </>
  );
}

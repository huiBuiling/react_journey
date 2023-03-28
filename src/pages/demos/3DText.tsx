import { OrbitControls } from "@react-three/drei";
import { Canvas, extend, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Mesh } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

extend({ TextGeometry });

/**
 *
 * @returns
 * https://codesandbox.io/s/bfplr
 * https://codesandbox.io/s/circling-birds-c671i?file=/src/Text.js
 */
function HelloText() {
  const ref = useRef<Mesh>(null!);
  const { color, text } = useControls({ color: "aqua", text: "Hello" });
  const font = useLoader(FontLoader, "/fonts/helvetiker_bold.typeface.json");
  const config = useMemo(
    () => ({
      font,
      size: 0.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    }),
    [font]
  );
  useLayoutEffect(() => void ref.current.geometry.center(), [text]);

  console.log("font", font, config);

  return (
    <mesh ref={ref}>
      <textGeometry attach="geometry" args={[text, config]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function Texts3D() {
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

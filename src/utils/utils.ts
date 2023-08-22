import { PerspectiveCamera, Box3, Vector3, PMREMGenerator } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * 模型居中显示
 * @param {THREE.Object3D} object
 * @param {Array<THREE.AnimationClip} clips
 */
const setContent = (camera: PerspectiveCamera, controls: OrbitControls, object: any, clips?: any) => {
  const box = new Box3().setFromObject(object);
  const size = box.getSize(new Vector3()).length();
  const center = box.getCenter(new Vector3());
  controls.reset();

  object.position.x += object.position.x - center.x;
  object.position.y += object.position.y - center.y;
  object.position.z += object.position.z - center.z;
  controls.maxDistance = size * 10;
  camera.near = size / 100;
  camera.far = size * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(center);
  camera.position.x += size / 2.0;
  camera.position.y += size / 5.0;
  camera.position.z += size / 2.0;
  camera.lookAt(center);

  console.log("camera", camera.position);

  //
  object.traverse((node: any) => {
    if (node.isLight) {
    } else if (node.isMesh) {
      // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
      node.material.depthWrite = !node.material.transparent;
    }
  });

  // 动画
  // this.setClips(clips);
};

// 材质遍历处理
const traverseMaterials = (object: any, callback: any) => {
  object.traverse((node: any) => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(callback);
  });
};

//
const getCubeMapTexture = (environment: { path: string }, pmremGenerator: PMREMGenerator) => {
  const { path } = environment;
  // no envmap
  if (!path) return Promise.resolve({ envMap: null });

  // new RGBELoader().setPath("textures/equirectangular/").load("royal_esplanade_1k.hdr", function (texture) {
  //   texture.mapping = THREE.EquirectangularReflectionMapping;
  //   scene.background = texture;
  //   scene.environment = texture;
  // });

  return new Promise((resolve, reject) => {
    new RGBELoader().load(
      path,
      (texture: any) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        pmremGenerator.dispose();
        resolve({ envMap });
      },
      undefined,
      reject
    );
  });
};

export default { setContent, traverseMaterials, getCubeMapTexture };

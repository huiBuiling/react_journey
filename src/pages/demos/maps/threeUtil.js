import {
  Box3,
  CanvasTexture,
  DoubleSide,
  RepeatWrapping,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";

/**
 * 生成地图居中显示
 * @param {*} camera 相机
 * @param {*} object 对象群组
 * @param {*} viewControl 
 * @returns 
 */
const setModelCenter = (camera, object, viewControl) => {
  if (!object) {
    return;
  }
  if (object.updateMatrixWorld) {
    object.updateMatrixWorld();
  }

  // 获得包围盒得min和max
  const box = new Box3().setFromObject(object);

  let objSize = box.getSize(new Vector3());
  // 返回包围盒的中心点
  const center = box.getCenter(new Vector3());

  object.position.x += object.position.x - center.x;
  object.position.y += object.position.y - center.y;
  object.position.z += object.position.z - center.z;

  let width = objSize.x;
  let height = objSize.y;
  let depth = objSize.z;

  let centroid = new Vector3().copy(objSize);
  centroid.multiplyScalar(0.5);

  if (viewControl.autoCamera) {
    camera.position.x = centroid.x * (viewControl.centerX || 0) + width * (viewControl.width || 0);
    camera.position.y = centroid.y * (viewControl.centerY || 0) + height * (viewControl.height || 0);
    camera.position.z = centroid.z * (viewControl.centerZ || 0) + depth * (viewControl.depth || 0);
  } else {
    camera.position.set(viewControl.cameraPosX || 0, viewControl.cameraPosY || 0, viewControl.cameraPosZ || 0);
  }

  camera.lookAt(0, 0, 0);
}

/**
 * 生成canvas贴图
 * @param {*} canvas 
 * @param {*} scale 
 * @returns {材质，网格对象，canvas}
 * 
 * CanvasTexture：使用canvas 画布做纹理贴图
 * SpriteMaterial：精灵材质
 * Sprite：精灵
 */
const getCanvaMat = (canvas, scale = 0.1) => {
  const map = new CanvasTexture(canvas);
  map.wrapS = map.wrapT = RepeatWrapping;

  const material = new SpriteMaterial({
    map: map,
    side: DoubleSide,
  });
  const mesh = new Sprite(material);
  //缩小等比缩小canvas精灵贴图
  mesh.scale.set(canvas.width * scale, canvas.height * scale);
  return { material, mesh, map };
}

export {
  setModelCenter,
  getCanvaMat
}
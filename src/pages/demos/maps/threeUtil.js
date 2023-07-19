import {
  Box3,
  CanvasTexture,
  DoubleSide,
  RepeatWrapping,
  Sprite,
  SpriteMaterial,
  Vector3,
  Vector2,
  Texture,
  MeshBasicMaterial,
  Color
} from "three";
import { getColor } from "./utils";


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
  camera.position.set(9.18, 24.09, 28.78); // 手动设置值
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

/**
 * 鼠标点击
 * @param {*} container 
 * @param {*} mouse 
 * @param {*} raycaster 
 * @param {*} camera 
 * @param {*} callback
 */
const mouseClick = (container, mouse, raycaster, camera, callback) => {
  container.style.cursor = 'pointer';
  window.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    console.log('click');

    mouse.x =
      ((event.offsetX - container.offsetLeft) / container.offsetWidth) * 2 - 1;
    mouse.y =
      -((event.offsetY - container.offsetTop) / container.offsetHeight) * 2 + 1;
    let vector = new Vector3(mouse.x, mouse.y, 1).unproject(camera);

    raycaster.set(camera.position, vector.sub(camera.position).normalize());
    raycaster.setFromCamera(mouse, camera);
    // this.raycasterAction();
    callback()
  }, false);
}

/**
 * 鼠标移入
 * @param {*} container 
 * @param {*} mouse 
 * @param {*} raycaster 
 * @param {*} camera 
 * @param {*} callback
 */
const mouseHover = (container, mouse, raycaster, camera, callback) => {
  this.container.addEventListener('pointermove', (event) => {
    event.preventDefault();

    mouse.x =
      ((event.offsetX - container.offsetLeft) / container.offsetWidth) * 2 - 1;
    mouse.y =
      -((event.offsetY - container.offsetTop) / container.offsetHeight) * 2 + 1;
    let vector = new Vector3(mouse.x, mouse.y, 1).unproject(camera);

    raycaster.set(camera.position, vector.sub(camera.position).normalize());
    raycaster.setFromCamera(mouse, camera);
    // this.mouseHoverAction();
    callback()
  });
}

/**
 * 清楚对象
 */
const cleanObj = (obj) => {
  cleanElmt(obj);
  obj?.parent?.remove && obj.parent.remove(obj);
}


/**
 * 清除对象
 */
const cleanElmt = (obj) => {
  if (obj) {
    if (obj.children && obj.children.length > 0) {
      this.cleanNext(obj, 0);
      obj.remove(...obj.children);
    }
    if (obj.geometry) {
      obj.geometry.dispose && obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => {
          this.cleanElmt(m);
        });
      } else {
        for (const v of Object.values(obj.material)) {
          if (v instanceof Texture) {
            v.dispose && v.dispose();
          }
        }

        obj.material.dispose && obj.material.dispose();
      }
    }

    obj.dispose && obj.dispose();
    obj.clear && obj.clear();
  }
}

/**
   * 散点
   * 3. 封装圆形材质
   * @param radius
   * @param color
   * @returns
   */
const setCircleMaterial = (radius, color) => {
  const canvas = document.createElement("canvas");
  canvas.height = radius * 3.1;
  canvas.width = radius * 3.1;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color;
  // ctx.shadowBlur = radius * 0.1;
  // ctx.shadowColor = color;

  //画三个波纹圈
  //外圈
  ctx.lineWidth = radius * 0.2;
  ctx.lineWidth = ctx.lineWidth < 1 ? 1 : ctx.lineWidth;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.5, canvas.height * 0.5, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();
  //中圈
  ctx.lineWidth = radius * 0.1;
  ctx.lineWidth = ctx.lineWidth < 1 ? 1 : ctx.lineWidth;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.5, canvas.height * 0.5, radius * 1.3, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();
  //内圈
  ctx.lineWidth = radius * 0.05;
  ctx.lineWidth = ctx.lineWidth < 1 ? 1 : ctx.lineWidth;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.5, canvas.height * 0.5, radius * 1.5, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();

  const map = new CanvasTexture(canvas);
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  let res = getColor(color);
  const material = new MeshBasicMaterial({
    map: map,
    transparent: true,
    color: new Color(`rgb(${res.red},${res.green},${res.blue})`),
    opacity: 1,
    // depthTest: false,
    side: DoubleSide,
  });

  return { material, canvas };
}

export {
  setModelCenter,
  getCanvaMat,
  mouseClick,
  mouseHover,
  cleanObj,
  setCircleMaterial
}
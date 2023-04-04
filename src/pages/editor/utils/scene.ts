import { MathUtils } from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

const setBoundingSphere = (_date: number) => {
  return _date.toString().split(".")[0] + "." + _date.toString().split(".")[1].slice(0, 3);
};

// 位置参数
const setPosition = (data: { x: number; y: number; z: number }) => {
  return {
    x: +data.x.toFixed(3),
    y: +data.y.toFixed(3),
    z: +data.z.toFixed(3),
  };
};

const setRotation = (data: { x: number; y: number; z: number }, type: "ToDeg" | "ToRad" = "ToDeg") => {
  // return {
  //   x: MathUtils.degToRad(data.x),
  //   y: MathUtils.degToRad(data.y),
  //   z: MathUtils.degToRad(data.z),
  // };
  let _cur = { x: 0, y: 0, z: 0 };
  if (type == "ToDeg") {
    _cur = {
      x: MathUtils.radToDeg(data.x),
      y: MathUtils.radToDeg(data.y),
      z: MathUtils.radToDeg(data.z),
    };
  } else {
    _cur = {
      x: MathUtils.degToRad(data.x),
      y: MathUtils.degToRad(data.y),
      z: MathUtils.degToRad(data.z),
    };
  }
  // const radians = _rotation > 0 ? _rotation : 2 * Math.PI + _rotation;
  // const degrees = MathUtils.radToDeg(2.0106192982974678); // 转换为度数
  // console.log("degrees", degrees);
  return {
    x: +_cur.x.toFixed(2),
    y: +_cur.y.toFixed(2),
    z: +_cur.z.toFixed(2),
  };
};

// scene 显示标签
const buildHTML = (object: any) => {
  let html = "";
  if (object.isMesh) {
    const geometry = object.geometry;
    const material = object.material;
    html += ` <span class="type Geometry"></span> ${escapeHTML(geometry.name)}`;
    html += ` <span class="type Material"></span> ${escapeHTML(getMaterialName(material))}`;
  }
  return html;
};

const escapeHTML = (html: string) => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

// 获取类型
const getObjectType = (object: any) => {
  if (object.isScene) return "Scene";
  if (object.isCamera) return "Camera";
  if (object.isLight) return "Light";
  if (object.isMesh) return "Mesh";
  if (object.isLine) return "Line";
  if (object.isPoints) return "Points";

  return "Object3D";
};

// 材质名字
const getMaterialName = (material: any) => {
  if (Array.isArray(material)) {
    const array = [];
    for (let i = 0; i < material.length; i++) {
      array.push(material[i].name);
    }
    return array.join(",");
  }
  return material.name;
};

const keyCheckFun = (transformControls: TransformControls, keyCode: number) => {
  switch (keyCode) {
    case 81: // Q
      transformControls.setSpace(transformControls.space === "local" ? "world" : "local");
      break;
    case 16: // Shift
      transformControls.setTranslationSnap(100);
      transformControls.setRotationSnap(MathUtils.degToRad(15));
      transformControls.setScaleSnap(0.25);
      break;
    case 87: // W
      transformControls.setMode("translate");
      break;

    case 69: // E
      transformControls.setMode("rotate");
      break;

    case 82: // R
      transformControls.setMode("scale");
      break;

    case 187:
    case 107: // +, =, num+
      transformControls.setSize(transformControls.size + 0.1);
      break;

    case 189:
    case 109: // -, _, num-
      transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
      break;

    case 88: // X
      transformControls.showX = !transformControls.showX;
      break;

    case 89: // Y
      transformControls.showY = !transformControls.showY;
      break;

    case 90: // Z
      transformControls.showZ = !transformControls.showZ;
      break;

    case 32: // Spacebar
      transformControls.enabled = !transformControls.enabled;
      break;

    case 27: // Esc
      transformControls.reset();
      break;
  }
};

export {
  buildHTML,
  escapeHTML,
  getMaterialName,
  getObjectType,
  keyCheckFun,
  setBoundingSphere,
  setPosition,
  setRotation,
};

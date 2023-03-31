const buildHTML = (object: any) => {
  let html = `<span class="type ${getObjectType(object)}"></span> ${escapeHTML(object.name)}`;
  if (object.isMesh) {
    const geometry = object.geometry;
    const material = object.material;
    html += ` <span class="type Geometry"></span> ${escapeHTML(geometry.name)}`;
    html += ` <span class="type Material"></span> ${escapeHTML(getMaterialName(material))}`;
  }
  // html += getScript(object.uuid);
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

export { buildHTML, getObjectType };

import { Component } from "react";
import * as dat from "lil-gui";
import {
  BufferGeometry,
  Clock,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Fog,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  Vector3,
  WebGLRenderer,
  Box3,
  Raycaster,
  Vector2,
  CircleGeometry,
  ShaderMaterial,
  QuadraticBezierCurve3,
  TubeGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { getGeoInfo, latlng2px, queryGeojson } from "./maps/geo";
import mapOption from "./maps/mapOption.js";
import { getGadientArray, getCanvasText, getColor, getRgbColor } from "./maps/utils";
import { setModelCenter, getCanvaMat, mouseClick, mouseHover, cleanObj, setCircleMaterial } from "./maps/threeUtil";
import VertexShader from "./maps/vertex.glsl";
import FragmentShader from "./maps/fragment.glsl";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any, gui: any;
let raycaster: Raycaster, mouse_click, mouse_hover;

// attr
let options: any, geoJson: any, adcode: any, geoJson1: any, geoInfo: any;
let bounding: any = {
  minlat: Number.MAX_VALUE,
  minlng: Number.MAX_VALUE,
  maxlng: 0,
  maxlat: 0,
};
let sizeScale: number = 1,
  latlngScale: number = 10,
  colorNum: number = 5;
let datas: any;
let activeRegionMaterial: any, // 区块选中材质
  mapGroup: Group, // 区块群组
  objGroup: Group; // 整体对象群组
let actionElmts: any[] = []; // 收集动作元素
let regionsDatas: any[], // 上一次点击区块
  beforeMaterial: any, // 上一次点击材质
  activeObj: any, // 当前点击时选中对象
  tooltip: any, // 提示
  tooltip_mesh: any;

let scatterGroup: any, circleGroup: any;

let linesMaterial: any[] = [], // 飞线材质数组，主要区分颜色
  linesGroup: any,
  lineTime = 0;

/**
 * 3D区块地图
 * https://juejin.cn/post/7250375753598844983
 * https://www.jianshu.com/p/27dca8d1bb9b
 * https://juejin.cn/post/7247027696822304827
 *
 * 波纹散点、渐变柱体、飞线、下钻上卷、视角适配
 *
 * d3-geo:https://github.com/d3/d3-geo
 * yarn add d3-geo colorname
 *
 * THREE.ExtrudeGeometry: 将shape从二维挤出成三维
 */
interface IProps {}
interface IState {
  // isLoading: Boolean;
}
export default class Map extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.init();
    this.animation();
  }

  init = () => {
    clock = new Clock();
    container = document.getElementById("container");
    // 渲染
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 定义渲染器的输出编码
    // renderer.outputEncoding = sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 生成场景
    scene = new Scene();
    scene.background = new Color(0x020924);
    scene.fog = new Fog(0x020924, 200, 1000);
    // 透视相机
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2;
    controls.enablePan = true;
    // 限制控制器角度
    controls.maxPolarAngle = Math.PI * 0.5;
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    raycaster = new Raycaster();

    //事件监听
    window.addEventListener("resize", () => this.onWindowResize(), false);

    gui = new dat.GUI();

    this.createChart(mapOption);
  };

  // 配置射线碰撞检测：鼠标点击，鼠标移入
  initRaycaster() {
    mouse_click = new Vector2();
    mouse_hover = new Vector2();
    // mouseHover(container, mouse_click, raycaster, camera, this.doMouseAction(false));
    mouseClick(container, mouse_hover, raycaster, camera, () => this.doMouseAction(true));
  }

  /**
   * 画有热力的3D区块
   * 1. 基本行政区区块信息
   * adcode: 440100
   */
  async createChart(_data: any) {
    if (_data) {
      datas = _data;
    }

    options = datas;
    if (adcode != options.adcode || !geoJson) {
      //获取geojson
      let res = await queryGeojson(options.adcode, true);
      // let res1 = await queryGeojson(options.adcode, false);
      geoJson = res;
      adcode = options.adcode;
      // geoJson1 = res1;
      //获取区块信息
      let info = getGeoInfo({ ...geoJson });
      geoInfo = info;
      //坐标范围
      bounding = info.bounding;
      //元素缩放比例
      sizeScale = info.scale;
    }

    objGroup = new Group();
    this.loaderExturdeGeometry();

    if (options.series && options.series.length > 0) {
      // barGroup = new Group();
      linesGroup = new Group();
      scatterGroup = new Group();
      circleGroup = new Group();
      for (let idx = 0; idx < options.series.length; idx++) {
        let op = options.series[idx];

        switch (op.type) {
          case "bar3D":
            break;
          case "lines3D":
            this.createLines(op, idx);
            break;
          case "scatter3D":
            // 散点
            this.createScatter(op, idx);
            break;
        }
      }
    }

    objGroup.add(circleGroup);
    objGroup.add(scatterGroup);
    objGroup.add(linesGroup);
  }

  /**
   * 2. 画出区块
   * 根据生成热力颜色列表值所在的区间取对应颜色值
   */
  loaderExturdeGeometry() {
    let minValue: any;
    let maxValue: any;
    let valueLen: any;
    if (options.data.length > 0) {
      minValue = options.data[0].value;
      maxValue = options.data[0].value;
      options.data.forEach((item: any) => {
        if (item.value < minValue) {
          minValue = item.value;
        }
        if (item.value > maxValue) {
          maxValue = item.value;
        }
      });
      valueLen = (maxValue - minValue) / colorNum;
    }
    //生成热力颜色列表
    const _cdata = getColor(options.regionStyle.emphasisColor);
    // 区块被时的选中材质
    activeRegionMaterial = new MeshBasicMaterial({
      color: new Color(_cdata.result),
      // color: _cdata.result,
      transparent: true,
      opacity: 0.01 * _cdata.alpha,
      side: DoubleSide,
    });

    mapGroup = new Group();
    let colorList = getGadientArray(options.regionStyle.colorList[0], options.regionStyle.colorList[1], colorNum);
    const extrudeSettings = {
      depth: options.regionStyle.depth * sizeScale, // 当前区块深度
      bevelEnabled: false,
    };
    //区块边框线颜色
    const lineM = new LineBasicMaterial({
      color: options.regionStyle.borderColor,
      linewidth: options.regionStyle.borderWidth,
    });

    for (let idx = 0; idx < geoJson.features.length; idx++) {
      let a = geoJson.features[idx];

      let regionColor = options.regionStyle.color;
      let regionName = a.properties.name;
      let regionIdx = options.data.findIndex((item: any) => item.name == regionName);
      //计算区块热力值颜色
      if (regionIdx >= 0) {
        let regionData = options.data[regionIdx];
        let cIdx = Math.floor((regionData.value - minValue) / valueLen);
        cIdx = cIdx >= colorNum ? colorNum - 1 : cIdx;
        regionColor = colorList[cIdx];
        // console.log("%c" + regionName + regionData.value, "background:" + regionColor);
      }

      let op: {
        extrudeSettings: any;
        lineM: any;
        regionName: any;
        regionColor: any;
        idx: number;
        regionIdx: number;
        c?: any;
      } = {
        extrudeSettings,
        lineM,
        regionColor,
        regionName,
        regionIdx,
        idx,
      };

      // 生成区块
      //多区块的行政区
      if (a.geometry.type == "MultiPolygon") {
        a.geometry.coordinates.forEach((b: any) => {
          b.forEach((c: any) => {
            op.c = c;
            this.createRegion(op);
          });
        });
      } else {
        //单区块的行政区
        a.geometry.coordinates.forEach((c: any) => {
          op.c = c;
          this.createRegion(op);
        });
      }
    }

    objGroup.add(mapGroup);
    scene.add(objGroup);
    setModelCenter(camera, objGroup, options.viewControl);

    // console.log("aaa", geoJson.features, "---bbbb--", actionElmts);
    this.initRaycaster();
  }

  /**
   * 3. 每个区块形状和线框
   * 区块形状使用的是Shape的ExtrudeGeometry，差不多就是有厚度的canvas图形
   * ExtrudeGeometry:
   *    - depth：图形挤出的深度，默认值为1
   *    - bevelEnabled：对挤出的形状应用是否斜角，默认值为true
   * @param param0
   */
  createRegion({
    c,
    extrudeSettings,
    lineM,
    regionName,
    regionColor,
    idx,
    regionIdx,
  }: {
    c?: any;
    extrudeSettings: any;
    lineM: any;
    regionName: any;
    regionColor: any;
    idx: number;
    regionIdx: number;
  }) {
    // console.log("op", {
    //   c,
    //   extrudeSettings,
    //   lineM,
    //   regionName,
    //   regionColor,
    //   idx,
    //   regionIdx,
    // });

    const shape: any = new Shape();
    const points = [];

    let pos0 = latlng2px(c[0]);
    shape.moveTo(...pos0);
    let h = 0;
    points.push(new Vector3(...pos0, h));

    for (let i = 1; i < c.length; i++) {
      let p = latlng2px(c[i]);
      shape.lineTo(...p);
      points.push(new Vector3(...p, h));
    }
    shape.lineTo(...pos0);
    //添加区块形状
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    const _cdata = getColor(regionColor);
    let material = new MeshBasicMaterial({
      color: _cdata.result,
      transparent: true,
      opacity: 0.01 * _cdata.alpha,
      side: DoubleSide,
    });

    const mesh: any = new Mesh(geometry, material);
    mesh.name = regionName;
    mesh.IDX = idx;
    mesh.regionIdx = regionIdx;
    mesh.rotateX(Math.PI * 0.5);

    // 将每一个区块的不同构成都添加
    if (actionElmts.length > 0) {
      actionElmts.push(mesh);
    } else {
      actionElmts = [mesh];
    }

    //添加边框
    const lineGeo = new BufferGeometry().setFromPoints(points);
    const line = new Line(lineGeo, lineM);
    line.name = "regionline-" + idx;
    line.rotateX(Math.PI * 0.5);
    line.position.y = 0.03 * sizeScale;
    let group = new Group();
    group.name = "region-" + idx;
    group.add(mesh, line);
    mapGroup.add(group);
  }

  /**
   * 4. 点击区块 激活区块 -> 高亮
   * 存储原来的区块材质，赋值激活状态材质
   */
  doMouseAction(isChange: boolean) {
    // console.log("isChange", isChange, actionElmts);
    const intersects = raycaster.intersectObjects(actionElmts, true);
    let newActiveObj: any;
    if (intersects.length > 0) {
      newActiveObj = intersects[0].object; // 当前点击 射线检测 选中块
    }

    // 判断是否点击和上一次 区块 是否不相同
    if ((activeObj && newActiveObj && activeObj.name != newActiveObj.name) || (!activeObj && newActiveObj)) {
      // 删除上一次的提示文本
      if (tooltip) {
        cleanObj(tooltip);
        tooltip = null;
      }

      /**
       * 如果已经有点击过，就存在上一次点击的
       * 区块对象和区块材质，需要遍历还原区块的材质
       */
      if (regionsDatas && beforeMaterial) {
        regionsDatas.forEach((elmt: any) => {
          elmt.material = beforeMaterial;
        });
      }
      /**
       * 存储当前点击对象区块材质
       * 便于下一次点击时，恢复上一次材质
       */
      beforeMaterial = newActiveObj.material;

      // 获取当前点击区块，区块可能由多个 mesh 构成，n > length > 1
      let regions = actionElmts.filter((item) => item.name == newActiveObj.name);

      if (regions?.length) {
        let center = new Vector3();
        regions.forEach((elmt: any) => {
          // 将当前选中区块材质设置成 激活状态材质
          elmt.material = activeRegionMaterial;
          elmt.updateMatrixWorld();

          // 跟随区块位置显示
          const box = new Box3().setFromObject(elmt);
          const c = box.getCenter(new Vector3());
          center.x += c.x;
          center.y += c.y;
          center.z += c.z;
          console.log("center", center);
        });

        // 计算中心点，创建提示文本
        center.x = center.x / regions.length;
        center.y = center.y / regions.length;
        center.z = center.z / regions.length;
        newActiveObj.updateMatrixWorld();
        const objBox = new Box3().setFromObject(newActiveObj);

        // const idx = newActiveObj.IDX;
        this.createToolTip(newActiveObj.name, newActiveObj.regionIdx, center, objBox.getSize(new Vector3()));
      }

      // 更新点击数据
      regionsDatas = regions; // 当前选中总区块 length > 1
      activeObj = newActiveObj; // 当前点击选中块 length = 1
    }

    // 选中区块高度降低，显示为下降状态
    // console.log("geoJson.features", geoJson.features, datas);
    // if (isChange && newActiveObj && activeObj) {
    //   let f = geoJson.features[activeObj.IDX];
    //   console.log("datas", datas, f);
    //   datas.adcode = f.properties.adcode;
    //   datas.address = f.properties.name;
    //   this.createChart(datas);
    // }
  }

  /**
   * 5.点击区块 -> 创建提示文本
   */
  createToolTip(
    regionName: string,
    regionIdx: number,
    center: {
      x: number;
      y: number;
      z: number;
    },
    scale: any
  ) {
    console.log(regionName, regionIdx, center, scale);
    let op = datas;
    let text;
    let data;
    //文本格式化替换
    if (regionIdx >= 0) {
      data = op.data[regionIdx];
      text = op.tooltip.formatter;
    } else {
      text = "{name}";
    }

    if (text.indexOf("{name}") >= 0) {
      text = text.replace("{name}", regionName);
    }
    if (text.indexOf("{value}") >= 0) {
      text = text.replace("{value}", data.value);
    }

    // 生成五倍（sizeScale）大小的canvas贴图，避免大小问题出现显示模糊 sizeScale
    const canvas = getCanvasText(text, op.tooltip.fontSize * sizeScale - 5, op.tooltip.color, op.tooltip.bg);
    console.log(canvas.width, canvas.height);

    tooltip_mesh = getCanvaMat(canvas, 0.02)?.mesh;
    // let s = latlngScale / sizeScale;
    const _scale = 2;
    //注意canvas精灵的大小要保持比例
    tooltip_mesh.scale.set(canvas.width * 0.01 * _scale, canvas.height * 0.01 * _scale);
    let box: any = new Box3().setFromObject(tooltip_mesh);
    tooltip = tooltip_mesh;

    tooltip_mesh.position.set(center.x, center.y + scale.y + box.getSize(new Vector3()).y, center.z);
    scene.add(tooltip_mesh);
  }

  /**
   * 散点
   * 1.热力散点
   */
  createScatter(op: any, idx: number) {
    console.log("op", op);
    let min = op.data[0].value,
      max = op.data[0].value;
    op.data.forEach((item: any) => {
      if (item.value < min) {
        min = item.value;
      }
      if (item.value > max) {
        max = item.value;
      }
    });

    let len = max - min;
    let unit = len / colorNum;

    let size = op.itemStyle.maxRadius - op.itemStyle.minRadius || 1;
    // 热力颜色列表
    let colorList = getGadientArray(op.itemStyle.colorList[0], op.itemStyle.colorList[1], colorNum);
    for (let index = 0; index < op.data.length; index++) {
      let item = op.data[index];
      let pos = latlng2px([item.lng, item.lat]);
      // 检查散点是否在范围内
      if (this.checkBounding(pos)) {
        // 获取热力颜色
        let cIdx = Math.floor((item.value - min) / unit);
        cIdx = cIdx >= colorNum ? colorNum - 1 : cIdx;
        let color = colorList[cIdx];
        let c = getColor(color);
        let _color = getColor(`rgba(${c.red},${c.green},${c.blue},${op.itemStyle.opacity})`);
        const material = new MeshBasicMaterial({
          color: _color.result,
          transparent: true,
          opacity: 0.01 * _color.alpha,
          side: DoubleSide,
        });

        // 获取散点大小
        let r;
        if (len == 0) {
          r = op.itemStyle.minRadius * sizeScale;
          console.log("0", r);
        } else {
          r = ((item.value - min) / len) * size + op.itemStyle.minRadius;
          console.log("10", r);
          // r = r * sizeScale;
        }

        if (r > 4) {
          r -= 1.89;
        }
        // 散点-> 中间部分
        const _scale = 0.18;
        let geometry = new CircleGeometry(r * _scale, 32);

        let mesh = new Mesh(geometry, material);
        mesh.name = "scatter-" + idx + "-" + index;

        mesh.rotateX(0.5 * Math.PI);
        mesh.position.set(pos[0], 0, pos[1]);
        scatterGroup.add(mesh);
        // 散点-> 波纹圈
        if (op.itemStyle.isCircle) {
          const { material: circleMaterial } = setCircleMaterial(op.itemStyle.maxRadius * 20, color);

          let circle = new Mesh(new CircleGeometry(r * 2 * _scale, 32), circleMaterial);
          circle.name = "circle" + idx + "-" + index;
          circle.rotateX(0.5 * Math.PI);
          circle.position.set(pos[0], 0, pos[1]);

          circleGroup.add(circle);
        }
      }
    }
    scatterGroup.position.y = 0.1 * sizeScale;
    if (op.itemStyle.isCircle) {
      circleGroup.position.y = 0.1 * sizeScale;
    }
  }

  /**
   * 散点
   * 2. 检查散点是否在范围内
   * @param pos
   * @returns
   */
  checkBounding(pos: any[]) {
    if (
      pos[0] >= bounding.minlng &&
      pos[0] <= bounding.maxlng &&
      pos[1] >= bounding.minlat &&
      pos[1] <= bounding.maxlat
    ) {
      return true;
    }
    return false;
  }

  /**
   * 创建飞线
   * 飞线管道: 使用' QuadraticBezierCurve3' 贝塞尔曲线算出来
   */
  createLines(op: any, idx: number) {
    // const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const material = new ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        time: {
          value: 0,
        },
        // colorA: { value: new Color(getRgbColor(op.itemStyle.color)) },
        // colorB: { value: new Color(getRgbColor(op.itemStyle.runColor)) },
        colorB: { value: new Color("#E54674") },
        colorA: { value: new Color("#16BDFF") },
      },
    });
    if (linesMaterial?.length > 0) {
      linesMaterial = [material];
    } else {
      linesMaterial.push(material);
    }

    for (let index = 0; index < op.data.length; index++) {
      let item = op.data[index];

      let pos = latlng2px([item.fromlng, item.fromlat]);
      let pos2 = latlng2px([item.tolng, item.tolat]);
      //过滤飞线范围
      if (this.checkBounding(pos) && this.checkBounding(pos2)) {
        //中间点
        let pos1 = latlng2px([(item.fromlng + item.tolng) / 2, (item.fromlat + item.tolat) / 2]);
        //贝塞尔曲线
        const curve = new QuadraticBezierCurve3(
          new Vector3(pos[0], 0, pos[1]),
          new Vector3(pos1[0], op.itemStyle.lineHeight * sizeScale, pos1[1]),
          new Vector3(pos2[0], 0, pos2[1])
        );

        const geometry = new TubeGeometry(curve, 32, op.itemStyle.lineWidth * sizeScale, 8, false);

        const line = new Mesh(geometry, material);
        line.name = "lines-" + idx + "-" + index;
        linesGroup.add(line);
      }
    }
  }

  // 控制波动
  addGui() {
    if (tooltip_mesh) {
      gui.add(tooltip_mesh.position, "x").min(-80).max(80).step(1).name("x");
      gui.add(tooltip_mesh.position, "y").min(-80).max(80).step(1).name("y");
      gui.add(tooltip_mesh.position, "z").min(-80).max(80).step(1).name("z");
    }
  }

  // 添加监听
  onWindowResize() {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animation() {
    //散点波纹扩散
    if (circleGroup?.children?.length > 0) {
      let circleScale = 1;
      circleGroup.children.forEach((elmt: any) => {
        if (elmt.material.opacity <= 0) {
          elmt.material.opacity = 1;
          circleScale = 1;
        } else {
          //大小变大，透明度减小
          elmt.material.opacity += -0.01;
          circleScale += 0.0002;
        }
        elmt.scale.x = circleScale;
        elmt.scale.y = circleScale;
      });
    }

    //飞线颜色变化
    if (linesGroup?.children?.length > 0) {
      if (lineTime >= 1.0) {
        lineTime = 0.0;
      } else {
        lineTime += 0.005;
      }
      linesMaterial.forEach((m) => {
        m.uniforms.time.value = lineTime;
      });
    }

    //
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container"></div>;
  }
}

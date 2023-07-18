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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { getGeoInfo, latlng2px, queryGeojson } from "./maps/geo";
import mapOption from "./maps/mapOption.js";
import { getGadientArray, getCanvasText, getColor } from "./maps/utils";
import { setModelCenter, getCanvaMat } from "./maps/threeUtil";

let container: any, scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, clock: any;
let controls: any, gui: any;
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
let activeRegionMat: any, mapGroup: Group, objGroup: Group;
let actionElmts: any[]; // 收集动作元素
let tooltip: any; // 提示
let datas: any;
/**
 * 3D区块地图
 * https://juejin.cn/post/7250375753598844983
 * https://www.jianshu.com/p/27dca8d1bb9b
 *
 * 波纹散点、渐变柱体、飞线、下钻上卷、视角适配
 *
 * d3-geo:https://github.com/d3/d3-geo
 * yarn add d3-geo colorname
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
    camera.position.set(5, -20, 200);
    // camera.position.set(-44.71, -173.71829664983076, 90.81687760650826);

    camera.lookAt(0, 3, 0);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2;
    controls.enablePan = true;
    // controls.addEventListener("change", () => {
    //   console.log(`output->change`, camera.position);
    // });

    // camera.position.x = -45.17972180789299;
    // camera.position.y = 191.26308250679668;
    // camera.position.z = 42.45263251389207;

    // camera.position.x = -71.68;
    // camera.position.y = 303.47;
    // camera.position.z = 67.358;

    //事件监听
    window.addEventListener("resize", () => this.onWindowResize(), false);

    gui = new dat.GUI();

    this.createChart(mapOption);
  };

  /**
   * 画有热力的3D区块
   * 1. 基本行政区区块信息
   * adcode: 440100
   */
  async createChart(_data: any) {
    datas = _data;
    let startTime = new Date().getTime();

    //限制控制器角度
    controls.maxPolarAngle = Math.PI * 0.5;

    options = datas;

    if (adcode != options.adcode || !geoJson) {
      //获取geojson
      let res = await queryGeojson(options.adcode, true);
      let res1 = await queryGeojson(options.adcode, false);
      geoJson = res;
      adcode = options.adcode;
      geoJson1 = res1;

      //获取区块信息
      let info = getGeoInfo(geoJson1);
      geoInfo = info;
      //坐标范围
      bounding = info.bounding;
      //元素缩放比例
      sizeScale = info.scale;
    }

    objGroup = new Group();
    this.loaderExturdeGeometry();
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
    activeRegionMat = new MeshBasicMaterial({
      color: new Color(_cdata.result),
      // color: _cdata.result,
      transparent: true,
      opacity: 0.01 * _cdata.alpha,
      side: DoubleSide,
    });

    mapGroup = new Group();
    let colorList = getGadientArray(options.regionStyle.colorList[0], options.regionStyle.colorList[1], colorNum);

    const extrudeSettings = {
      depth: options.regionStyle.depth * sizeScale,
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
  }

  /**
   * 3. 每个区块形状和线框
   * 区块形状使用的是Shape的ExtrudeGeometry，差不多就是有厚度的canvas图形
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
    mesh.IDX = regionIdx;
    mesh.rotateX(Math.PI * 0.5);
    // actionElmts.push(mesh);
    actionElmts = [mesh];
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
   * 创建提示文本
   */
  // createToolTip(
  //   regionName: string,
  //   regionIdx: number,
  //   center: {
  //     x: number;
  //     y: number;
  //     z: number;
  //   },
  //   scale: any
  // ) {
  //   let op = datas;
  //   let text;
  //   let data;
  //   //文本格式化替换
  //   if (regionIdx >= 0) {
  //     data = op.data[regionIdx];
  //     text = op.tooltip.formatter;
  //   } else {
  //     text = "{name}";
  //   }

  //   if (text.indexOf("{name}") >= 0) {
  //     text = text.replace("{name}", regionName);
  //   }
  //   if (text.indexOf("{value}") >= 0) {
  //     text = text.replace("{value}", data.value);
  //   }

  //   // 生成五倍（sizeScale）大小的canvas贴图，避免大小问题出现显示模糊
  //   const canvas = getCanvasText(text, op.tooltip.fontSize * sizeScale, op.tooltip.color, op.tooltip.bg);
  //   console.log(canvas.width, canvas.height);

  //   let mesh: any = getCanvaMat(canvas, 0.02);
  //   let s = latlngScale / sizeScale;
  //   //注意canvas精灵的大小要保持比例
  //   mesh.scale.set(canvas.width * 0.01 * s, canvas.height * 0.01 * s);
  //   let box: any = new Box3().setFromObject(mesh);
  //   tooltip = mesh;
  //   tooltip.position.set(center.x, center.y + scale.y + box.getSize().y, center.z);
  //   scene.add(mesh);
  // }

  // 控制波动
  addGui() {
    // gui.add(earthPoints.position, "x").min(-800).max(800).step(1).name("x");
    // gui.add(earthPoints.position, "y").min(-800).max(800).step(1).name("y");
    // gui.add(earthPoints.position, "z").min(-800).max(800).step(1).name("z");
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
    // TWEEN.update(); // !!!
    controls.update();
    // 页面重绘时调用自身
    requestAnimationFrame(this.animation.bind(this));
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container"></div>;
  }
}

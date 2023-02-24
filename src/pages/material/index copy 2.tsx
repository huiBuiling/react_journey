import { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

let canvas: any;
let scene: any, camera: any, renderer: any;
/**
 *
 */

const constants = {
  combine: {
    "THREE.MultiplyOperation": THREE.MultiplyOperation,
    "THREE.MixOperation": THREE.MixOperation,
    "THREE.AddOperation": THREE.AddOperation,
  },

  side: {
    "THREE.FrontSide": THREE.FrontSide,
    "THREE.BackSide": THREE.BackSide,
    "THREE.DoubleSide": THREE.DoubleSide,
  },

  blendingMode: {
    "THREE.NoBlending": THREE.NoBlending,
    "THREE.NormalBlending": THREE.NormalBlending,
    "THREE.AdditiveBlending": THREE.AdditiveBlending,
    "THREE.SubtractiveBlending": THREE.SubtractiveBlending,
    "THREE.MultiplyBlending": THREE.MultiplyBlending,
    "THREE.CustomBlending": THREE.CustomBlending,
  },

  equations: {
    "THREE.AddEquation": THREE.AddEquation,
    "THREE.SubtractEquation": THREE.SubtractEquation,
    "THREE.ReverseSubtractEquation": THREE.ReverseSubtractEquation,
  },

  destinationFactors: {
    "THREE.ZeroFactor": THREE.ZeroFactor,
    "THREE.OneFactor": THREE.OneFactor,
    "THREE.SrcColorFactor": THREE.SrcColorFactor,
    "THREE.OneMinusSrcColorFactor": THREE.OneMinusSrcColorFactor,
    "THREE.SrcAlphaFactor": THREE.SrcAlphaFactor,
    "THREE.OneMinusSrcAlphaFactor": THREE.OneMinusSrcAlphaFactor,
    "THREE.DstAlphaFactor": THREE.DstAlphaFactor,
    "THREE.OneMinusDstAlphaFactor": THREE.OneMinusDstAlphaFactor,
  },

  sourceFactors: {
    "THREE.DstColorFactor": THREE.DstColorFactor,
    "THREE.OneMinusDstColorFactor": THREE.OneMinusDstColorFactor,
    "THREE.SrcAlphaSaturateFactor": THREE.SrcAlphaSaturateFactor,
  },
};
export default class Stu extends Component {
  componentDidMount() {
    this.init();
    this.animation();
  }

  init2 = () => {
    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    const envMaps = (function () {
      const path = "../../examples/textures/cube/SwedishRoyalCastle/";
      const format = ".jpg";
      const urls = [
        path + "px" + format,
        path + "nx" + format,
        path + "py" + format,
        path + "ny" + format,
        path + "pz" + format,
        path + "nz" + format,
      ];

      const reflectionCube = cubeTextureLoader.load(urls);

      const refractionCube = cubeTextureLoader.load(urls);
      refractionCube.mapping = THREE.CubeRefractionMapping;

      return {
        none: null,
        reflection: reflectionCube,
        refraction: refractionCube,
      };
    })();

    const diffuseMaps = (function () {
      const bricks = textureLoader.load("../../examples/textures/brick_diffuse.jpg");
      bricks.wrapS = THREE.RepeatWrapping;
      bricks.wrapT = THREE.RepeatWrapping;
      bricks.repeat.set(9, 1);

      return {
        none: null,
        bricks: bricks,
      };
    })();

    const roughnessMaps = (function () {
      const bricks = textureLoader.load("../../examples/textures/brick_roughness.jpg");
      bricks.wrapT = THREE.RepeatWrapping;
      bricks.wrapS = THREE.RepeatWrapping;
      bricks.repeat.set(9, 1);

      return {
        none: null,
        bricks: bricks,
      };
    })();

    const matcaps = (function () {
      return {
        none: null,
        porcelainWhite: textureLoader.load("../../examples/textures/matcaps/matcap-porcelain-white.jpg"),
      };
    })();

    const alphaMaps = (function () {
      const fibers = textureLoader.load("../../examples/textures/alphaMap.jpg");
      fibers.wrapT = THREE.RepeatWrapping;
      fibers.wrapS = THREE.RepeatWrapping;
      fibers.repeat.set(9, 1);

      return {
        none: null,
        fibers: fibers,
      };
    })();

    const gradientMaps = (function () {
      const threeTone = textureLoader.load("../../examples/textures/gradientMaps/threeTone.jpg");
      threeTone.minFilter = THREE.NearestFilter;
      threeTone.magFilter = THREE.NearestFilter;

      const fiveTone = textureLoader.load("../../examples/textures/gradientMaps/fiveTone.jpg");
      fiveTone.minFilter = THREE.NearestFilter;
      fiveTone.magFilter = THREE.NearestFilter;

      return {
        none: null,
        threeTone: threeTone,
        fiveTone: fiveTone,
      };
    })();

    const envMapKeys = getObjectsKeys(envMaps);
    const envMapKeysPBR = envMapKeys.slice(0, 2);
    const diffuseMapKeys = getObjectsKeys(diffuseMaps);
    const roughnessMapKeys = getObjectsKeys(roughnessMaps);
    const matcapKeys = getObjectsKeys(matcaps);
    const alphaMapKeys = getObjectsKeys(alphaMaps);
    const gradientMapKeys = getObjectsKeys(gradientMaps);

    function generateVertexColors(geometry) {
      const positionAttribute = geometry.attributes.position;

      const colors = [];
      const color = new THREE.Color();

      for (let i = 0, il = positionAttribute.count; i < il; i++) {
        color.setHSL((i / il) * Math.random(), 0.5, 0.5);
        colors.push(color.r, color.g, color.b);
      }

      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }

    function handleColorChange(color, converSRGBToLinear = false) {
      return function (value) {
        if (typeof value === "string") {
          value = value.replace("#", "0x");
        }

        color.setHex(value);

        if (converSRGBToLinear === true) color.convertSRGBToLinear();
      };
    }

    function needsUpdate(material, geometry) {
      return function () {
        material.side = parseInt(material.side); //Ensure number
        material.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
      };
    }

    function updateCombine(material) {
      return function (combine) {
        material.combine = parseInt(combine);
        material.needsUpdate = true;
      };
    }

    function updateTexture(material, materialKey, textures) {
      return function (key) {
        material[materialKey] = textures[key];
        material.needsUpdate = true;
      };
    }

    function guiScene(gui, scene) {
      const folder = gui.addFolder("Scene");

      const data = {
        background: "#000000",
        "ambient light": ambientLight.color.getHex(),
      };

      folder.addColor(data, "ambient light").onChange(handleColorChange(ambientLight.color, true));

      guiSceneFog(folder, scene);
    }

    function guiSceneFog(folder, scene) {
      const fogFolder = folder.addFolder("scene.fog");

      const fog = new THREE.Fog(0x3f7b9d, 0, 60);

      const data = {
        fog: {
          "THREE.Fog()": false,
          "scene.fog.color": fog.color.getHex(),
        },
      };

      fogFolder.add(data.fog, "THREE.Fog()").onChange(function (useFog) {
        if (useFog) {
          scene.fog = fog;
        } else {
          scene.fog = null;
        }
      });

      fogFolder.addColor(data.fog, "scene.fog.color").onChange(handleColorChange(fog.color));
    }

    function guiMaterial(gui, mesh, material, geometry) {
      const folder = gui.addFolder("THREE.Material");

      folder.add(material, "transparent").onChange(needsUpdate(material, geometry));
      folder.add(material, "opacity", 0, 1).step(0.01);
      // folder.add( material, 'blending', constants.blendingMode );
      // folder.add( material, 'blendSrc', constants.destinationFactors );
      // folder.add( material, 'blendDst', constants.destinationFactors );
      // folder.add( material, 'blendEquation', constants.equations );
      folder.add(material, "depthTest");
      folder.add(material, "depthWrite");
      // folder.add( material, 'polygonOffset' );
      // folder.add( material, 'polygonOffsetFactor' );
      // folder.add( material, 'polygonOffsetUnits' );
      folder.add(material, "alphaTest", 0, 1).step(0.01).onChange(needsUpdate(material, geometry));
      folder.add(material, "visible");
      folder.add(material, "side", constants.side).onChange(needsUpdate(material, geometry));
    }

    function guiMeshBasicMaterial(gui, mesh, material, geometry) {
      const data = {
        color: material.color.getHex(),
        envMaps: envMapKeys[0],
        map: diffuseMapKeys[0],
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshBasicMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));
      folder.add(material, "wireframe");
      folder.add(material, "vertexColors").onChange(needsUpdate(material, geometry));
      folder.add(material, "fog").onChange(needsUpdate(material, geometry));

      folder.add(data, "envMaps", envMapKeys).onChange(updateTexture(material, "envMap", envMaps));
      folder.add(data, "map", diffuseMapKeys).onChange(updateTexture(material, "map", diffuseMaps));
      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));
      folder.add(material, "combine", constants.combine).onChange(updateCombine(material));
      folder.add(material, "reflectivity", 0, 1);
      folder.add(material, "refractionRatio", 0, 1);
    }

    function guiMeshDepthMaterial(gui, mesh, material) {
      const data = {
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshDepthMaterial");

      folder.add(material, "wireframe");

      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));
    }

    function guiMeshNormalMaterial(gui, mesh, material, geometry) {
      const folder = gui.addFolder("THREE.MeshNormalMaterial");

      folder.add(material, "flatShading").onChange(needsUpdate(material, geometry));
      folder.add(material, "wireframe");
    }

    function guiLineBasicMaterial(gui, mesh, material, geometry) {
      const data = {
        color: material.color.getHex(),
      };

      const folder = gui.addFolder("THREE.LineBasicMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));
      folder.add(material, "linewidth", 0, 10);
      folder.add(material, "linecap", ["butt", "round", "square"]);
      folder.add(material, "linejoin", ["round", "bevel", "miter"]);
      folder.add(material, "vertexColors").onChange(needsUpdate(material, geometry));
      folder.add(material, "fog").onChange(needsUpdate(material, geometry));
    }

    function guiMeshLambertMaterial(gui, mesh, material, geometry) {
      const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeys[0],
        map: diffuseMapKeys[0],
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshLambertMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));
      folder.addColor(data, "emissive").onChange(handleColorChange(material.emissive, true));

      folder.add(material, "wireframe");
      folder.add(material, "vertexColors").onChange(needsUpdate(material, geometry));
      folder.add(material, "fog").onChange(needsUpdate(material, geometry));

      folder.add(data, "envMaps", envMapKeys).onChange(updateTexture(material, "envMap", envMaps));
      folder.add(data, "map", diffuseMapKeys).onChange(updateTexture(material, "map", diffuseMaps));
      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));
      folder.add(material, "combine", constants.combine).onChange(updateCombine(material));
      folder.add(material, "reflectivity", 0, 1);
      folder.add(material, "refractionRatio", 0, 1);
    }

    function guiMeshMatcapMaterial(gui, mesh, material, geometry) {
      const data = {
        color: material.color.getHex(),
        matcap: matcapKeys[1],
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshMatcapMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));

      folder.add(material, "flatShading").onChange(needsUpdate(material, geometry));
      folder.add(data, "matcap", matcapKeys).onChange(updateTexture(material, "matcap", matcaps));
      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));
    }

    function guiMeshPhongMaterial(gui, mesh, material, geometry) {
      const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        specular: material.specular.getHex(),
        envMaps: envMapKeys[0],
        map: diffuseMapKeys[0],
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshPhongMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));
      folder.addColor(data, "emissive").onChange(handleColorChange(material.emissive, true));
      folder.addColor(data, "specular").onChange(handleColorChange(material.specular));

      folder.add(material, "shininess", 0, 100);
      folder.add(material, "flatShading").onChange(needsUpdate(material, geometry));
      folder.add(material, "wireframe");
      folder.add(material, "vertexColors").onChange(needsUpdate(material, geometry));
      folder.add(material, "fog").onChange(needsUpdate(material, geometry));
      folder.add(data, "envMaps", envMapKeys).onChange(updateTexture(material, "envMap", envMaps));
      folder.add(data, "map", diffuseMapKeys).onChange(updateTexture(material, "map", diffuseMaps));
      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));
      folder.add(material, "combine", constants.combine).onChange(updateCombine(material));
      folder.add(material, "reflectivity", 0, 1);
      folder.add(material, "refractionRatio", 0, 1);
    }

    function guiMeshToonMaterial(gui, mesh, material) {
      const data = {
        color: material.color.getHex(),
        map: diffuseMapKeys[0],
        gradientMap: gradientMapKeys[1],
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshToonMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));
      folder.add(data, "map", diffuseMapKeys).onChange(updateTexture(material, "map", diffuseMaps));
      folder.add(data, "gradientMap", gradientMapKeys).onChange(updateTexture(material, "gradientMap", gradientMaps));
      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));
    }

    function guiMeshStandardMaterial(gui, mesh, material, geometry) {
      const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeysPBR[0],
        map: diffuseMapKeys[0],
        roughnessMap: roughnessMapKeys[0],
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshStandardMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));
      folder.addColor(data, "emissive").onChange(handleColorChange(material.emissive, true));

      folder.add(material, "roughness", 0, 1);
      folder.add(material, "metalness", 0, 1);
      folder.add(material, "flatShading").onChange(needsUpdate(material, geometry));
      folder.add(material, "wireframe");
      folder.add(material, "vertexColors").onChange(needsUpdate(material, geometry));
      folder.add(material, "fog").onChange(needsUpdate(material, geometry));
      folder.add(data, "envMaps", envMapKeysPBR).onChange(updateTexture(material, "envMap", envMaps));
      folder.add(data, "map", diffuseMapKeys).onChange(updateTexture(material, "map", diffuseMaps));
      folder
        .add(data, "roughnessMap", roughnessMapKeys)
        .onChange(updateTexture(material, "roughnessMap", roughnessMaps));
      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));

      // TODO metalnessMap
    }

    function guiMeshPhysicalMaterial(gui, mesh, material, geometry) {
      const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeys[0],
        map: diffuseMapKeys[0],
        roughnessMap: roughnessMapKeys[0],
        alphaMap: alphaMapKeys[0],
      };

      const folder = gui.addFolder("THREE.MeshPhysicalMaterial");

      folder.addColor(data, "color").onChange(handleColorChange(material.color, true));
      folder.addColor(data, "emissive").onChange(handleColorChange(material.emissive, true));

      folder.add(material, "roughness", 0, 1);
      folder.add(material, "metalness", 0, 1);
      folder.add(material, "reflectivity", 0, 1);
      folder.add(material, "clearcoat", 0, 1).step(0.01);
      folder.add(material, "clearcoatRoughness", 0, 1).step(0.01);
      folder.add(material, "flatShading").onChange(needsUpdate(material, geometry));
      folder.add(material, "wireframe");
      folder.add(material, "vertexColors").onChange(needsUpdate(material, geometry));
      folder.add(material, "fog").onChange(needsUpdate(material, geometry));
      folder.add(data, "envMaps", envMapKeysPBR).onChange(updateTexture(material, "envMap", envMaps));
      folder.add(data, "map", diffuseMapKeys).onChange(updateTexture(material, "map", diffuseMaps));
      folder
        .add(data, "roughnessMap", roughnessMapKeys)
        .onChange(updateTexture(material, "roughnessMap", roughnessMaps));
      folder.add(data, "alphaMap", alphaMapKeys).onChange(updateTexture(material, "alphaMap", alphaMaps));

      // TODO metalnessMap
    }

    function chooseFromHash(gui, mesh, geometry) {
      const selectedMaterial = window.location.hash.substring(1) || "MeshBasicMaterial";

      let material;

      switch (selectedMaterial) {
        case "MeshBasicMaterial":
          material = new THREE.MeshBasicMaterial({ color: 0x049ef4 });
          guiMaterial(gui, mesh, material, geometry);
          guiMeshBasicMaterial(gui, mesh, material, geometry);

          return material;

          break;

        case "MeshLambertMaterial":
          material = new THREE.MeshLambertMaterial({ color: 0x049ef4 });
          guiMaterial(gui, mesh, material, geometry);
          guiMeshLambertMaterial(gui, mesh, material, geometry);

          return material;

          break;

        case "MeshMatcapMaterial":
          material = new THREE.MeshMatcapMaterial({ matcap: matcaps.porcelainWhite });
          guiMaterial(gui, mesh, material, geometry);
          guiMeshMatcapMaterial(gui, mesh, material, geometry);

          // no need for lights

          light1.visible = false;
          light2.visible = false;
          light3.visible = false;

          return material;

          break;

        case "MeshPhongMaterial":
          material = new THREE.MeshPhongMaterial({ color: 0x049ef4 });
          guiMaterial(gui, mesh, material, geometry);
          guiMeshPhongMaterial(gui, mesh, material, geometry);

          return material;

          break;

        case "MeshToonMaterial":
          material = new THREE.MeshToonMaterial({ color: 0x049ef4, gradientMap: gradientMaps.threeTone });
          guiMaterial(gui, mesh, material, geometry);
          guiMeshToonMaterial(gui, mesh, material);

          // only use a single point light

          light1.visible = false;
          light3.visible = false;

          return material;

          break;

        case "MeshStandardMaterial":
          material = new THREE.MeshStandardMaterial({ color: 0x049ef4 });
          guiMaterial(gui, mesh, material, geometry);
          guiMeshStandardMaterial(gui, mesh, material, geometry);

          // only use scene environment

          light1.visible = false;
          light2.visible = false;
          light3.visible = false;

          return material;

          break;

        case "MeshPhysicalMaterial":
          material = new THREE.MeshPhysicalMaterial({ color: 0x049ef4 });
          guiMaterial(gui, mesh, material, geometry);
          guiMeshPhysicalMaterial(gui, mesh, material, geometry);

          // only use scene environment

          light1.visible = false;
          light2.visible = false;
          light3.visible = false;

          return material;

          break;

        case "MeshDepthMaterial":
          material = new THREE.MeshDepthMaterial();
          guiMaterial(gui, mesh, material, geometry);
          guiMeshDepthMaterial(gui, mesh, material);

          return material;

          break;

        case "MeshNormalMaterial":
          material = new THREE.MeshNormalMaterial();
          guiMaterial(gui, mesh, material, geometry);
          guiMeshNormalMaterial(gui, mesh, material, geometry);

          return material;

          break;

        case "LineBasicMaterial":
          material = new THREE.LineBasicMaterial({ color: 0x2194ce });
          guiMaterial(gui, mesh, material, geometry);
          guiLineBasicMaterial(gui, mesh, material, geometry);

          return material;

          break;
      }
    }

    //

    const selectedMaterial = window.location.hash.substring(1);

    if (THREE[selectedMaterial] !== undefined) {
      document.getElementById("newWindow").href += "#" + selectedMaterial;
    }

    const gui = new GUI();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x444444);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 10, 100);
    camera.position.z = 35;

    const ambientLight = new THREE.AmbientLight(0x000000);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0xffffff, 1, 0);
    light1.position.set(0, 200, 0);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffffff, 1, 0);
    light2.position.set(100, 200, 100);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xffffff, 1, 0);
    light3.position.set(-100, -200, -100);
    scene.add(light3);

    guiScene(gui, scene);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 200, 32).toNonIndexed();

    generateVertexColors(geometry);

    const mesh = new THREE.Mesh(geometry);
    mesh.material = chooseFromHash(gui, mesh, geometry);

    scene.add(mesh);

    let prevFog = false;

    function render() {
      requestAnimationFrame(render);

      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.005;

      if (prevFog !== scene.fog) {
        mesh.material.needsUpdate = true;
        prevFog = scene.fog;
      }

      renderer.render(scene, camera);
    }

    window.addEventListener(
      "resize",
      function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      },
      false
    );

    render();
  };

  init = () => {
    canvas = document.getElementById("webgl");

    // 生成场景
    scene = new THREE.Scene();

    // 辅助坐标系
    var axesHelper = new THREE.AxesHelper(250);
    scene.add(axesHelper);

    // 使用点材质
    // this.usePointsMaterial();
    // 使用基础线材质
    // this.useLineBasicMaterial();
    // 使用虚线材质
    // this.useLineDashedMaterial();
    // 使用 高光网格材质
    this.useMeshLambertMaterial();

    /**
     * 相机设置
     */
    var width = window.innerWidth; //窗口宽度
    var height = window.innerHeight; //窗口高度

    // 创建相机对象
    camera = new THREE.PerspectiveCamera(75, width / height, 1, 100);
    camera.position.set(-30, 45, 35); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

    /**
     * 创建渲染器对象
     */
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height); //设置渲染区域尺寸
    renderer.setClearColor(0x111111, 1); //设置背景颜色

    // 启用阴影
    renderer.shadowMap.enabled = true;

    const axes = new AxesHelper(100);
    // 设置不同线的颜色
    // axes.setColors(0xf0f8ff, 0xfaebd7, 0x00ffff);
    scene.add(axes);

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // 执行渲染操作   指定场景、相机作为参数
    renderer.render(scene, camera);

    // CTRL
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 阻尼将通过添加某种加速度和摩擦公式来平滑动画
  };

  getObjectsKeys = (obj: any) => {
    const keys = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    return keys;
  };

  /**
   * 创建点模型
   * PointsMaterial 点材质
   * SphereGeometry 球体几何对象
   * Points 用于显示点的类
   */
  usePointsMaterial = () => {
    const _geometry = new THREE.SphereGeometry(30, 25, 25);
    const material = new THREE.PointsMaterial({
      color: 0xff2288,
      size: 3, //点渲染尺寸
    });

    let point_cube = new THREE.Points(_geometry, material); // 网格模型对象Mesh
    scene.add(point_cube); // 网格模型添加到场景中
  };

  animation = () => {
    renderer.render(scene, camera); //执行渲染操作
    requestAnimationFrame(this.animation.bind(this));
  };

  render() {
    return <div id="webgl"></div>;
  }
}

import { FC, useCallback, useEffect, useState } from "react";
import {
  AmbientLight,
  BoxHelper,
  Clock,
  DirectionalLight,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  sRGBEncoding,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// 框选模型

import { keyCheckFun, setBoundingSphere, setPosition, setRotation } from "./utils/scene";

// 组件
import SceneComp from "./scene";

import "./style.scss";

let scene: Scene, camera: any, renderer: WebGLRenderer, clock: Clock;
let controls: OrbitControls, transformControls: TransformControls;
let pmremGenerator: any;

let ambientLight: AmbientLight, directionalLight: DirectionalLight;

let cameraPersp: PerspectiveCamera, cameraOrtho: OrthographicCamera;
let boxHelper: BoxHelper; // 框选 包围盒

const width = window.innerWidth - 350;
/**
 * 汇总
 */
const Editor: FC<{}> = ({}) => {
  const [modelData, setModelData] = useState<any>(); // 模型数据
  const [modelObj, setModelObj] = useState<any>(); // 模型数据
  const [uuid, setUuid] = useState<string>(""); // 模型数据

  useEffect(() => {
    // 销毁
    clearModel();
    // return () => {};
  }, []);

  const clearModel = () => {
    if (scene) {
      // console.log('scene.children', scene.children)
      // 建议使用
      scene.children.pop();

      const threeMain = document.getElementById("webgl");
      if (threeMain !== null) {
        threeMain.removeChild(threeMain.firstChild);
      }

      // 重要
      // if (AnimationId !== null) cancelAnimationFrame(AnimationId)
    }
  };

  useEffect(() => {
    init();
    animation();
  }, []);

  const init = () => {
    clock = new Clock();

    // 生成场景
    scene = new Scene();
    scene.add(new GridHelper(1000, 10, 0x888888, 0x444444));

    // 透视相机
    const aspect = width / window.innerHeight;
    cameraPersp = new PerspectiveCamera(50, aspect, 0.01, 30000);
    cameraOrtho = new OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
    camera = cameraPersp;
    camera.lookAt(0, 0, 0);

    const _position = {
      x: 1.2395763962841813,
      y: 758.5665228974968,
      z: 1478.8458458838509,
    };
    camera.position.copy(new Vector3(_position.x, _position.y, _position.z));

    scene.add(camera);
    // const _scene_pos = {
    //   x: 56.09944382235683,
    //   y: 300.6991828482033,
    //   z: 750.6051948924159,
    // };
    // scene.lookAt(_scene_pos.x, _scene_pos.y, _scene_pos.z);

    // 渲染
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);
    // 解决丢失了细节以及发光太严重后，导致图像都失真
    renderer.outputEncoding = sRGBEncoding;

    const threeMain = document.getElementById("webgl");
    threeMain?.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    controls.update();
    controls.addEventListener("change", renderFun);

    transformControls = new TransformControls(camera, renderer.domElement);

    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });
    scene.add(transformControls);

    // 使用hdr作为背景色 模型贴图
    pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 不加动画时
    // renderer.render(scene, camera);

    initModel();
    // addXdrEnvironment();

    // light
    // initLight();

    // initGui();

    window.addEventListener("resize", () => onWindowResize());
    window.addEventListener("keydown", () => keyFun(event));
    window.addEventListener("keyup", function (event) {
      switch (event.keyCode) {
        case 16: // Shift
          transformControls.setTranslationSnap(null);
          transformControls.setRotationSnap(null);
          transformControls.setScaleSnap(null);
          break;
      }
    });
  };

  const renderFun = (model?: any) => {
    renderer.render(scene, camera);
    console.log(`output->change`, camera.position);
  };

  // 按键
  const keyFun = (event: any) => {
    if (event.keyCode == 67) {
      // C
      const position = camera.position.clone();

      camera = camera?.isPerspectiveCamera ? cameraOrtho : cameraPersp;
      camera.position.copy(position);

      controls.object = camera;
      transformControls.camera = camera;

      camera.lookAt(controls.target.x, controls.target.y, controls.target.z);
      console.log("camera target", controls.target);
      onWindowResize();
    } else if (event.keyCode == 86) {
      // V

      const randomFoV = Math.random() + 0.1;
      const randomZoom = Math.random() + 0.1;

      cameraPersp.fov = randomFoV * 160;
      cameraOrtho.bottom = -randomFoV * 500;
      cameraOrtho.top = randomFoV * 500;

      cameraPersp.zoom = randomZoom * 5;
      cameraOrtho.zoom = randomZoom * 5;
      onWindowResize();
    } else {
      keyCheckFun(transformControls, event.keyCode);
    }
  };

  // 加载模型
  const initModel = () => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/divublic");
    dracoLoader.preload();
    const gltfLoader = new GLTFLoader();
    // gltfLoader.setCrossOrigin("anonymous");
    gltfLoader.setDRACOLoader(dracoLoader);

    const self = this;
    let loadProgress = 0;
    gltfLoader.load(
      "/model/mushy_buddy.glb", // Horse panda2013 girl_cartoon_cyber_by_oscar_creativo
      (gltf) => {
        const model = gltf.scene;

        // 获取更新后的模型位置设置
        const _position = {
          x: 0.7455702388863585,
          y: 264.63885385928137,
          z: -4.936013200733115,
        };
        model.position.copy(new Vector3(_position.x, _position.y, _position.z));

        boxHelper = new BoxHelper(model); // 框选 包围盒
        scene.add(boxHelper);

        scene.add(model);
        setTransformControlsOBJ(model);
        setModelData(model);
        // setCamera(model);
      },
      (xhr) => {
        // loadProgress = Math.floor((xhr.loaded / xhr.total) * 100);
        // console.log("loadProgress", xhr, xhr.loaded, xhr.total);
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    );
  };

  // 设置 transformControls 对象
  const setTransformControlsOBJ = (_model: any) => {
    // setModelObj();
    transformControls.detach();

    // 更新指定对象的线框盒子
    boxHelper.setFromObject(_model);

    setUuid(_model.uuid);
    setModelObj(() => _model);

    // 可视化变换控件对象
    transformControls.attach(_model);
    transformControls.addEventListener("change", () => {
      renderer.render(scene, camera);
      boxHelper.update();
      const position = _model.position.clone();
      // setModelObj(() => _model);
      // console.log("New position----:", position);
      // console.log("modelObj", modelObj);
    });
  };

  const onWindowResize = () => {
    // Update sizes
    window.innerWidth = width;
    window.innerHeight = window.innerHeight;

    // Update camera
    camera.aspect = width / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(width, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  const animation = () => {
    controls.update();
    // transformControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animation.bind(this));
  };

  const constinitLight = () => {
    ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new DirectionalLight(0x00fffc, 0.3);
    scene.add(directionalLight);
  };

  // 切换材质
  const checkMaterial = () => {
    var material1 = new MeshBasicMaterial({ color: 0xff0000 }); // 红色
    var material2 = new MeshBasicMaterial({ color: 0x00ff00 }); // 绿色
    var material3 = new MeshBasicMaterial({ color: 0x0000ff }); // 蓝色
    if (modelData instanceof Mesh) {
      modelData.material = material1; // 将材质更改为新的红色材质
    }
  };

  const [tab, setTab] = useState("GEOMETRY"); // ["OBJECT", "GEOMETRY", "MATERIAL"]

  // useEffect(() => {
  //   console.log("modelObj", modelObj);
  // }, modelObj);

  // useCallback(() => {
  //   setModelObj(modelObj);
  // }, [uuid]);

  // OBJECT
  const renderObject = useCallback(() => {
    console.log("renderObject", modelObj);
    const _pos = modelObj && modelObj?.position ? setPosition(modelObj.position) : { x: 0, y: 0, z: 0 };
    const _rotation = modelObj && modelObj?.rotation ? setRotation(modelObj.rotation) : { x: 0, y: 0, z: 0 };
    const _scale = modelObj && modelObj?.scale ? setPosition(modelObj.scale) : { x: 0, y: 0, z: 0 };

    return (
      <div className="">
        <div className="obj_row">
          <span className="row_tit">Type</span>
          <div className="row_con">{modelObj?.type}</div>
        </div>
        <div className="obj_row">
          <span className="row_tit">UUID</span>
          <div className="row_con">{modelObj?.uuid}</div>
        </div>
        <div className="obj_row">
          <span className="row_tit">Name</span>
          <div className="row_con"> {modelObj?.name}</div>
        </div>
        <div className="obj_row">
          <span className="row_tit">Position</span>
          <div className="row_con">
            <span>{_pos.x}</span>
            <span>{_pos.y}</span>
            <span>{_pos.z}</span>
          </div>
        </div>
        <div className="obj_row">
          <span className="row_tit">Rotation</span>
          <div className="row_con">
            <span>{_rotation.x}°</span>
            <span>{_rotation.y}°</span>
            <span>{_rotation.z}°</span>
          </div>
        </div>
        <div className="obj_row">
          <span className="row_tit">Scale</span>
          <div className="row_con">
            <span>{_scale.x}</span>
            <span>{_scale.y}</span>
            <span>{_scale.z}</span>
          </div>
        </div>
        <div className="obj_row">
          <span className="row_tit">Shadow</span>
          <div className="row_con">
            <span className="flex">
              <input
                className="checkbox"
                name="cast"
                type="checkbox"
                checked={modelObj?.castShadow || false}
                onChange={() => {}}
              />
              cast
            </span>
            <span className="flex">
              <input
                className="checkbox"
                name="receive"
                type="checkbox"
                checked={modelObj?.receiveShadow || false}
                onChange={() => {}}
              />
              receive
            </span>
          </div>
        </div>
        <div className="obj_row">
          {/* 物体是否显示 */}
          <span className="row_tit">Visible</span>
          <div className="row_con">
            <input
              className="checkbox"
              name="visible"
              type="checkbox"
              checked={modelObj?.visible || false}
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="obj_row">
          {/* 控制呈现对象的顺序 */}
          <span className="row_tit">Render Order</span>
          <div className="row_con">
            <input className="number" autoComplete="off" value={modelObj?.renderOrder || 0} onChange={() => {}} />
          </div>
        </div>

        {/* <p><span>Frustum Cull</span></div> */}
        {/* <p><span>Script</span></div> */}
      </div>
    );
  }, [uuid, modelObj]);

  // GEOMETRY
  const renderGeometry = useCallback(() => {
    const _pos = {
      x: setBoundingSphere(modelObj?.geometry?.boundingSphere?.center.x),
      y: setBoundingSphere(modelObj?.geometry?.boundingSphere?.center.y),
      z: setBoundingSphere(modelObj?.geometry?.boundingSphere?.center.z),
    };
    console.log("_pos", _pos);
    return (
      <div className="">
        <div className="obj_row">
          <span className="row_tit">Type</span>
          <div className="row_con">{modelObj?.geometry?.type}</div>
        </div>
        <div className="obj_row">
          <span className="row_tit">UUID</span>
          <div className="row_con">{modelObj?.geometry?.uuid}</div>
        </div>
        <div className="obj_row">
          <span className="row_tit">Attributes</span>
          <div className="row_con flex_col col_con">
            <p>
              <span>index</span>
              {modelObj?.geometry?.index?.count}
            </p>
            <p>
              <span>normal</span>
              {modelObj?.geometry?.attributes?.normal?.count}({modelObj?.geometry?.attributes?.normal?.itemSize})
            </p>
            <p>
              <span>position</span>
              {modelObj?.geometry?.attributes?.position?.count}({modelObj?.geometry?.attributes?.position?.itemSize})
            </p>
            <p>
              <span>uv</span>
              {modelObj?.geometry?.attributes?.uv?.count}({modelObj?.geometry?.attributes?.uv?.itemSize})
            </p>
          </div>
        </div>
        <div className="obj_row">
          <span className="row_tit">Bounds</span>
          <div className="row_con flex_col col_con">
            <p>{_pos.x}</p>
            <p>{_pos.y}</p>
            <p>{_pos.z}</p>
          </div>
        </div>
      </div>
    );
  }, [uuid]);

  // console.log("modelObj", modelObj);

  return (
    <div className="canvas">
      <div id="webgl" className="webgl"></div>
      <div className="right">
        <div className="dir">
          <div className="scene">SCENE</div>
          <SceneComp uuid={uuid} modelData={modelData} transformControlsOBJ={setTransformControlsOBJ} />
        </div>
        <div className="dir obj">
          <div className="scene_tab">
            {["OBJECT", "GEOMETRY", "MATERIAL"].map((item) => (
              <div key={item} className={tab == item ? "scene scene_act" : "scene"} onClick={() => setTab(item)}>
                {item}
              </div>
            ))}
          </div>

          <div className="dir_con obj_con">
            {modelObj && tab == "OBJECT" ? renderObject() : null}

            {modelObj && modelObj?.geometry && tab == "GEOMETRY" ? renderGeometry() : null}

            {modelObj && modelObj?.material && tab == "MATERIAL" ? (
              <div>
                <div className="obj_row">
                  <span className="row_tit">Type</span>
                  <div className="row_con">{modelObj?.geometry?.type}</div>
                </div>
                <div className="obj_row">
                  <span className="row_tit">UUID</span>
                  <div className="row_con">{modelObj?.geometry?.uuid}</div>
                </div>
                <div className="obj_row">
                  <span className="row_tit">Attributes</span>
                  <div className="row_con flex_col col_con">
                    <p>
                      <span>index</span>
                      {modelObj?.geometry?.index?.count}
                    </p>
                    <p>
                      <span>normal</span>
                      {modelObj?.geometry?.attributes?.normal?.count}({modelObj?.geometry?.attributes?.normal?.itemSize}
                      )
                    </p>
                    <p>
                      <span>position</span>
                      {modelObj?.geometry?.attributes?.position?.count}(
                      {modelObj?.geometry?.attributes?.position?.itemSize})
                    </p>
                    <p>
                      <span>uv</span>
                      {modelObj?.geometry?.attributes?.uv?.count}({modelObj?.geometry?.attributes?.uv?.itemSize})
                    </p>
                  </div>
                </div>
                <div className="obj_row">
                  <span className="row_tit">Bounds</span>
                  <div className="row_con flex_col col_con">
                    <p>{modelObj?.geometry?.boundingSphere?.center.x}</p>
                    <p>{modelObj?.geometry?.boundingSphere?.center.y}</p>
                    <p>{modelObj?.geometry?.boundingSphere?.center.z}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Editor;

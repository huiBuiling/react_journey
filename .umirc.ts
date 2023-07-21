import { defineConfig } from "umi";

export default defineConfig({
  npmClient: "yarn",
  routes: [
    { path: "/", component: "@/pages/index" },
    { path: "/transformObj", component: "@/pages/transformObj" },
    { path: "/camera", component: "@/pages/camera" },
    { path: "/orbitControls", component: "@/pages/OrbitControls" },
    { path: "/geometry", component: "@/pages/geometry" },
    { path: "/ligui", component: "@/pages/ligui" },
    { path: "/texture", component: "@/pages/texture" },
    { path: "/materials", component: "@/pages/materials" },
    { path: "/standardMaterial", component: "@/pages/meshStandardMaterial" },
    { path: "/fontLoader", component: "@/pages/fontLoader" },
    //
    { path: "/light", component: "@/pages/lights/light" },
    { path: "/lightAnim", component: "@/pages/lights/lightAnim" },
    { path: "/shadowBase", component: "@/pages/lights/shadows_base" },
    { path: "/shadow", component: "@/pages/lights/shadows" },
    { path: "/shadowsBaking", component: "@/pages/lights/shadowsBaking" },

    // DEMO
    { path: "/dlight", component: "@/pages/lights/DLights" },
    { path: "/3DText", component: "@/pages/demos/3DText" },
    { path: "/mushroom", component: "@/pages/demos/mushroom" },
    { path: "/girl", component: "@/pages/demos/girl" },
    { path: "/editor", component: "@/pages/editor/index" },
    { path: "/transformCtro", component: "@/pages/editor/transformCtro" },
    { path: "/map", component: "@/pages/demos/map" },
    { path: "/hauntedHouse", component: "@/pages/demos/HauntedHouse" },
    // OK
    { path: "/webview", component: "@/pages/lights/webview" },
    // { path: "/webview2", component: "@/pages/lights/webview2" },
    { path: "/2DImages", component: "@/pages/demos/2DImages" },

    // particle
    { path: "/particle_1", component: "@/pages/particle/particle_1" },
    { path: "/ParticlGalaxy", component: "@/pages/particle/ParticlGalaxy" },
    { path: "/particleObj", component: "@/pages/particle/particle" },
    { path: "/particleMap", component: "@/pages/particle/particleMap" },
    { path: "/particleMap2", component: "@/pages/particle/particleMap2" },

    // mzww
    { path: "/mz_geometry", component: "@/pages/mzww/geometry" },

    // website
    { path: "/lockControl", component: "@/pages/website/LockControl" },

    // hall
    { path: "/hall", component: "@/pages/demos/showroom" },

    // shader
    { path: "/raw", component: "@/pages/shaders/raw" },
    { path: "/demo", component: "@/pages/shaders/demo" },
    { path: "/IronBall", component: "@/pages/shaders/IronBall" },
    { path: "/points", component: "@/pages/shaders/points" },
  ],
  // publicPath: "/public/",
  // publicPath: "/",
  // devtool: "eval", //生成map文件
  // devtool: process.env.NODE_ENV === 'development' ? 'eval' : false
  chainWebpack(config: any) {
    // Set alias
    // config.resolve.alias.set('a', 'path/to/a');

    const GLSL_REG = /\.(glsl|vs|fs)$/;
    config.module.rule("asset").exclude.add(GLSL_REG).end();
    config.module
      .rule("glslify")
      .test(GLSL_REG)
      //添加include选项，其值是数组
      // .include.add("/src/")
      // .add("/assets/")
      // .add("/shaders/")
      // .end()
      .exclude.add(/node_modules/)
      .end()
      .use("raw-loader")
      .loader("raw-loader")
      .end();
    // .use("glslify-loader")
    // .loader("glslify-loader")
    // .end();

    // .use("webpack-glsl-loader") // 指定一个名叫 eslint 的 loader 配置
    // .loader("webpack-glsl-loader")
    // .end();
  },
});

/**
 * https://umijs.org/docs/api/config
 */

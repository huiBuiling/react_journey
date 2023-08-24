import { defineConfig } from "umi";

export default defineConfig({
  npmClient: "yarn",
  routes: [
    // base
    { path: "/", component: "@/pages/index" },
    { path: "/transformObj", component: "@/pages/transformObj" },
    { path: "/camera", component: "@/pages/camera" },
    { path: "/orbitControls", component: "@/pages/OrbitControls" },
    { path: "/geometry", component: "@/pages/geometry" },
    { path: "/ligui", component: "@/pages/ligui" },
    { path: "/texture", component: "@/pages/texture" },
    { path: "/materials", component: "@/pages/materials" },
    { path: "/standardMaterial", component: "@/pages/meshStandardMaterial" },

    // light
    { path: "/light", component: "@/pages/lights/light" },
    { path: "/lightAnim", component: "@/pages/lights/lightAnim" },
    { path: "/shadowBase", component: "@/pages/lights/shadows_base" },
    { path: "/shadow", component: "@/pages/lights/shadows" },
    { path: "/shadowsBaking", component: "@/pages/lights/shadowsBaking" },

    // DEMO
    { path: "/hauntedHouse", component: "@/pages/demos/HauntedHouse" },
    { path: "/showroom", component: "@/pages/demos/showroom" },

    // types
    { path: "/glb", component: "@/pages/types/glb" },
    { path: "/gltf", component: "@/pages/types/gltf" },

    // particle
    { path: "/particle", component: "@/pages/particle/particle_base" },
    { path: "/particle_1", component: "@/pages/particle/particle_1" },

    // mzww
    { path: "/mz_geometry", component: "@/pages/mzww/geometry" },

    // shader
    { path: "/raw", component: "@/pages/shaders/raw" },
    { path: "/demo", component: "@/pages/shaders/demo" },
    { path: "/IronBall", component: "@/pages/shaders/IronBall" },
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

export default {
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
    { path: "/3DText", component: "@/pages/demos/3DText" },
    { path: "/dlight", component: "@/pages/lights/DLights" },
    { path: "/hauntedHouse", component: "@/pages/demos/HauntedHouse" },

    // http://www.webgl3d.cn/Three.js/?_blank
    { path: "/gdemo", component: "@/pages/1_demo/index" },
    { path: "/geometry", component: "@/pages/geometry/index" },
    { path: "/material", component: "@/pages/material/index" },
    { path: "/video", component: "@/pages/videoStu/index" },
  ],
  // publicPath: "/public/",
  publicPath: "/",
};

/**
 *
 */

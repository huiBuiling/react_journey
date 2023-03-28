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
    { path: "/dlight", component: "@/pages/lights/DLights" },
    { path: "/3DText", component: "@/pages/demos/3DText" },
    { path: "/mushroom", component: "@/pages/demos/mushroom" },
    { path: "/girl", component: "@/pages/demos/girl" },
    { path: "/editor", component: "@/pages/editor/index" },
    { path: "/hauntedHouse", component: "@/pages/demos/HauntedHouse" },
  ],
  // publicPath: "/public/",
  publicPath: "/",
};

/**
 *
 */

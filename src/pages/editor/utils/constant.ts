const materialBlendingOptions = {
  0: "No",
  1: "Normal",
  2: "Additive",
  3: "Subtractive",
  4: "Multiply",
  5: "Custom",
};

const materialSideOptions = {
  0: "Front",
  1: "Back",
  2: "Double",
};

export { materialBlendingOptions, materialSideOptions };

// 模型中心显示
// calcMeshCenter(group) {
//   /**
//    * 包围盒全自动计算：模型整体居中
//    */
//   var box3 = new THREE.Box3()
//   // 计算层级模型group的包围盒
//   // 模型group是加载一个三维模型返回的对象，包含多个网格模型
//   box3.expandByObject(group)
//   // 计算一个层级模型对应包围盒的几何体中心在世界坐标中的位置
//   var center = new THREE.Vector3()
//   box3.getCenter(center)
//   // console.log('查看几何体中心坐标', center);

//   // 重新设置模型的位置，使之居中。
//   group.position.x = group.position.x - center.x
//   group.position.y = group.position.y - center.y
//   group.position.z = group.position.z - center.z
// }

/**
 * 场景：Scene
 * 立方缓冲几何体：BoxGeometry(X轴上面的宽度, Y轴上面的高度, Z轴上面的深度)
 * 基础网格材质：MeshBasicMaterial
 * 网格：Mesh
 */
const canvas = document.querySelector('.webgl')

// scence
const scene = new THREE.Scene()

// red cube(立方体)
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const sizes = {
  width: 600,
  height: 400
}

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
// move camera
// 不添加看不到，是因为相机距离物体太近
camera.position.z = 3
scene.add(camera)

// render
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
// 更新渲染器的大小
renderer.setSize(sizes.width, sizes.height)
// 渲染 scene, camera
renderer.render(scene, camera)


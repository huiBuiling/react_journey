# code address

- https://vercel.com/huibuiling/react-journey
- https://react-journey.vercel.app/

# 基础案例

![image](../img/gdemo_1.png)

```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>第一个three.js文件_WebGL三维场景</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      /* 隐藏body窗口区域滚动条 */
    }
  </style>
  <!--引入three.js三维引擎-->
  <script src="http://www.yanhuangxueyuan.com/versions/threejsR92/build/three.js"></script>
  <!-- <script src="./three.js"></script> -->
  <!-- <script src="http://www.yanhuangxueyuan.com/threejs/build/three.js"></script> -->
</head>

<body>
  <script>
    /**
     * 创建场景对象Scene
     */
    var scene = new THREE.Scene();
    /**
     * 创建网格模型
     */
    // var geometry = new THREE.SphereGeometry(60, 40, 40); //创建一个球体几何对象
    var geometry = new THREE.BoxGeometry(100, 100, 100); //创建一个立方体几何对象Geometry
    var material = new THREE.MeshLambertMaterial({
      color: 0x0000ff
    }); // 材质对象Material
    var mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    scene.add(mesh); //网格模型添加到场景中

    /**
     * 光源设置
     */
    // 点光源
    var point = new THREE.PointLight(0xffffff);
    point.position.set(400, 200, 300); //点光源位置
    scene.add(point); //点光源添加到场景中
    // 环境光
    var ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);
    // console.log(scene)
    // console.log(scene.children)

    /**
     * 相机设置
     */
    var width = window.innerWidth; //窗口宽度
    var height = window.innerHeight; //窗口高度
    var k = width / height; //窗口宽高比
    var s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
    // 创建相机对象
    var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
    camera.position.set(200, 300, 200); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

    /**
     * 创建渲染器对象
     */
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);//设置渲染区域尺寸
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
    document.body.appendChild(renderer.domElement); //body元素中插入canvas对象
    // 执行渲染操作   指定场景、相机作为参数
    renderer.render(scene, camera);
  </script>
</body>
</html>
```

## 程序结构

![image](../jiegou.png)

## 梳理

![image](../shuli.png)

## Three.js 对 WebGL 的封装

![image](../webgl.png)

# requestAnimationFrame 周期性渲染

- requestAnimationFrame()调用一个函数不是立即调用
- 而是向浏览器发起一个执行某函数的请求， 什么时候会执行由浏览器决定，一般默认保持 60FPS 的频率，大约每 16.7ms 调用一次 requestAnimationFrame()方法指定的函数
- 60FPS 是理想的情况下，如果渲染的场景比较复杂或者说硬件性能有限可能会低于这个频率。
- FPS(屏幕刷新率)

![image](../img/gdemo_2.gif)

```
function render() {
  renderer.render(scene,camera);//执行渲染操作
  mesh.rotateY(0.01);//每次绕y轴旋转0.01弧度
  requestAnimationFrame(render);//请求再次执行渲染函数render
}
render();
```

# 鼠标操作三维场景

- OrbitControls.js
- 支持鼠标左中右键操作和键盘方向键操作

![image](../img/gdemo_3.gif)

```
// 创建控件对象
var controls = new THREE.OrbitControls(camera,renderer.domElement);
// 监听鼠标、键盘事件
controls.addEventListener('change', render);
```

## 场景操作

- 缩放：滚动—鼠标中键
- 旋转：拖动—鼠标左键
- 平移：拖动—鼠标右键

- **注意**： 开发中不要同时使用以下方法调用同一个函数，会冲突
  - requestAnimationFrame()
  - controls.addEventListener('change', render)

# 插入新的几何体

## 更多几何体

```
// 长方体 参数：长，宽，高
var geometry = new THREE.BoxGeometry(100, 100, 100);
// 球体 参数：半径60  经纬度细分数40,40
var geometry = new THREE.SphereGeometry(60, 40, 40);
// 圆柱  参数：圆柱面顶部、底部直径50,50   高度100  圆周分段数
var geometry = new THREE.CylinderGeometry( 50, 50, 100, 25 );
// 正八面体
var geometry = new THREE.OctahedronGeometry(50);
// 正十二面体
var geometry = new THREE.DodecahedronGeometry(50);
// 正二十面体
var geometry = new THREE.IcosahedronGeometry(50);
```

## 同时绘制了立方体、球体和圆柱三个几何体对应的网格模型

![image](../img/gdemo_4.png)

- 立方体网格模型

```
var geometry1 = new THREE.BoxGeometry(100, 100, 100);
var material1 = new THREE.MeshLambertMaterial({
  color: 0x0000ff
});
// 材质对象Material
var mesh1 = new THREE.Mesh(geometry1, material1); //网格模型对象Mesh
scene.add(mesh1); // !!! 网格模型添加到场景中
```

- 球体网格模型

```
var geometry2 = new THREE.SphereGeometry(60, 40, 40);
var material2 = new THREE.MeshLambertMaterial({
  color: 0xff00ff
});
var mesh2 = new THREE.Mesh(geometry2, material2); //网格模型对象Mesh
mesh2.translateY(120); //球体网格模型沿Y轴正方向平移120
scene.add(mesh2);
```

- 圆柱网格模型

```
var geometry3 = new THREE.CylinderGeometry(50, 50, 100, 25);
var material3 = new THREE.MeshLambertMaterial({
  color: 0xffff00
});
var mesh3 = new THREE.Mesh(geometry3, material3); //网格模型对象Mesh
// mesh3.translateX(120); // 球体网格模型沿Y轴正方向平移120
mesh3.position.set(120,0,0);// 设置mesh3模型对象的xyz坐标为120,0,0
scene.add(mesh3); //
```

# 材质效果

## 半透明效果

![image](../img/gdemo_5.png)

- 更改场景中的球体材质对象构造函数 THREE.MeshLambertMaterial()的参数，添加 opacity 和 transparent 属性，opacity 的值是 0~1 之间，transparent 表示是否开启透明度效果， 默认是 false 表示透明度设置不起作用，值设置为 true，网格模型就会呈现透明的效果

```
// 材质对象
var sphereMaterial=new THREE.MeshLambertMaterial({
    color:0xff0000,
    opacity:0.7,
    transparent:true
});

or 材质对象的属性设置

material.opacity = 0.5 ;
material.transparent = true ;

```

### 材质常见属性

<table>
  <thead>
      <th>材质属性</th>
      <th>简介</th>
  </thead>
  <tbody>
    <tr>
      <td>color</td>
      <td>材质颜色，比如蓝色 0x0000ff</td>
    </tr>
    <tr>
      <td>opacity</td>
      <td>透明度设置，0 表示完全透明，1 表示完全不透明</td>
    </tr>
     <tr>
      <td>transparent</td>
      <td>是否开启透明，默认 false</td>
    </tr>
    <tr>
      <td>wireframe</td>
      <td>将几何图形渲染为线框。 默认值为 false</td>
    </tr>
  </tbody>
</table>

### 添加高光效果

![image](../img/gdemo_6.png)

```
var sphereMaterial = new THREE.MeshPhongMaterial({
    color:0x0000ff,
    specular:0x4488ee,
    shininess:12
});
```

- 漫反射: MeshLambertMaterial()
- 镜面反射: MeshPhongMaterial()

### 材质类型

<table>
  <thead>
      <th>材质类型</th>
      <th>功能</th>
  </thead>
  <tbody>
    <tr>
      <td>MeshBasicMaterial</td>
      <td>基础网格材质，不受光照影响的材质</td>
    </tr>
    <tr>
      <td>MeshLambertMaterial</td>
      <td>Lambert网格材质，与光照有反应，漫反射</td>
    </tr>
     <tr>
      <td>MeshPhongMaterial</td>
      <td>高光Phong材质,与光照有反应</td>
    </tr>
    <tr>
      <td>MeshStandardMaterial</td>
      <td>PBR物理材质，相比较高光Phong材质可以更好的模拟金属、玻璃等效果</td>
    </tr>
  </tbody>
</table>

# 光源光照强度

- 通过光源构造函数的参数可以设置光源的颜色，一般设置明暗程度不同的白光 RGB 三个分量值是一样的
- 把 THREE.AmbientLight(0x444444); => 光照参数 0xffffff,立方体渲染效果更明亮

## 光源位置

![image](../img/gdemo_7.gif)

```
// 点光源
var point = new THREE.PointLight(0x444444);
// point.position.set(400, 200, 300); //点光源位置
point.position.set(0, 0, 0); //点光源位置

var point2 = new THREE.AmbientLight(0x444444);
point2.position.set(400, 200, 300); //点光源位置
scene.add(point, point2); //点光源添加到场景中
```

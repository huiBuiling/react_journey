uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;

// attribute float aRandom;
// varying float vRandom; // 随机尖峰着色

// uniform float uFrequency; // 波动平面 频率
uniform vec2  uFrequency; // 波动平面 频率 
uniform float uTime; // 波动平面 动起来

// 纹理
attribute vec2 uv; // 纹理：获取 uv 定义属性
varying vec2 vUv; // 定义 顶点着色器传递给片元着色器的参数

// 阴影
varying float vElevation;

void main(){
  // 简写
  // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // modelPosition.y -= 1.0; // 向下移动模型
  // modelPosition.z += sin(modelPosition.x * 10.0) * 0.1; // 波浪

  // 随机尖峰
  // modelPosition.z += aRandom * 0.1;

  // 波动平面
  // modelPosition.z += sin(modelPosition.x * uFrequency) * 0.1;

  // 波动平面 配合 gui 动起来
  // modelPosition.z += sin(modelPosition.x * uFrequency.x) * 0.1;
  // modelPosition.z += sin(modelPosition.y * uFrequency.y) * 0.1;

  // 根据时间自己波动
  modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
  modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  // vRandom = aRandom; // 随机尖峰着色

  vUv = uv; // 纹理

  // 阴影
  float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
  modelPosition.z += elevation;
  vElevation = elevation;
}
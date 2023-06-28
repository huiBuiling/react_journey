
varying vec2 vUv; // 纹理：接收 顶点着色器传递的参数

void main(){
  // 随机颜色
  // gl_FragColor = vec4(vUv, 0.0,1.0);

  // float strength = vUv.x; // x轴渐变
  // gl_FragColor = vec4(vec3(strength), 1.0);
  // 等价于
  // gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 1.0);

  // float strength = vUv.y; // y轴渐变
  // float strength = 1.0 - vUv.y; // y轴反向渐变
  // float strength = vUv.y * 10.0; // 挤压渐变效果
  // float strength = mod(vUv.y * 10.0, 1.0); // 模运算 重复挤压渐变效果

  // 线条
  // float strength = mod(vUv.y * 10.0, 1.0);
  // float strength = mod(vUv.x * 10.0, 1.0);
  // strength = step(0.5, strength);
  // strength = step(0.8, strength);

  // 相加
  // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
  // strength += step(0.8, mod(vUv.y * 10.0, 1.0));

  // 相乘
  // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

  // 段线条
  // float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

  // new -----------------------------------------
  // float strength = abs(vUv.x - 0.5); // 渐变中间着重 abs 16
  // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5)); // min 17
  // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)); // max
  float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5))); // 渐变色变为纯色

  gl_FragColor = vec4(vec3(strength), 1.0);
}
precision mediump float; // 决定浮点数的精度

// varying float vRandom; // 随机尖峰着色
uniform vec3 uColor; // 颜色

uniform sampler2D uTexture; // 纹理：获取 uniform  定义属性
varying vec2 vUv; // 纹理：接收 顶点着色器传递的参数

// 阴影
varying float vElevation;

void main()
{
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色

  // 更改颜色，紫色
  // gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);

  // 随机尖峰着色
  // gl_FragColor = vec4(0.5, vRandom, 1.0, 1.0);

  // 读取 uniforms 设置的颜色 uColor
  // gl_FragColor = vec4(uColor, 1.0);

  // 纹理
  vec4 textureColor = texture2D(uTexture, vUv);

  textureColor.rgb *= vElevation * 1.0 + 0.5; // 阴影

  gl_FragColor = textureColor;
}
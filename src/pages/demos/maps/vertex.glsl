varying vec2 vUv; // 定义 顶点着色器传递给片元着色器的参数
// varying vec3 vNormal;  

void main(){
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

  vUv = uv; // 纹理
  // vNormal = normal;  
}
uniform float time;
uniform vec3 colorA; 
uniform vec3 colorB;   
varying vec2 vUv;   

void main() {  
  vec3 color = vUv.x < time ? colorB : colorA; 
  gl_FragColor = vec4(color,1.0);
}

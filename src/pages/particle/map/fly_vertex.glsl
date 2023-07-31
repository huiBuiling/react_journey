uniform float size; 
uniform float time; 
uniform float u_len; 
attribute float u_index;
varying float u_opacitys;
void main() { 
  if( u_index < time + u_len && u_index > time){
      float u_scale = 1.0 - (time + u_len - u_index) /u_len;
      u_opacitys = u_scale;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = size * u_scale * 300.0 / (-mvPosition.z);
  } 
}
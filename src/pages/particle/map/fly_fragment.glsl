uniform sampler2D u_map;
uniform float u_opacity;
uniform vec3 color;
uniform float isTexture;
varying float u_opacitys;
void main() {
  vec4 u_color = vec4(color,u_opacity * u_opacitys);
  if( isTexture != 0.0 ){
    gl_FragColor = u_color * texture2D(u_map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
  }else{
    gl_FragColor = u_color;
  }
}
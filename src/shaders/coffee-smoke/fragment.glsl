uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

void main() {
  // scale and animate
  vec2 smokeUv = vUv;
  smokeUv.x *= 0.5;
  smokeUv.y *= 0.3;
  smokeUv.y -= uTime * 0.03;

  // smoke 
  float smoke = texture(uPerlinTexture, smokeUv).r;
  gl_FragColor = vec4(vec3(1.0), smoke);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
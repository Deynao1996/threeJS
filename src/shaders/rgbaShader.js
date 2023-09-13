export const rgbaShader = {
  vertexShader:
    'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
  fragmentShader: `
        uniform float progress;
        uniform sampler2D tex;
        
        varying vec2 vUv;

        void main() {
          vec2 p = vUv;

          vec4 cr = texture2D(tex, p + progress * vec2(0.1, 0.));
          vec4 cg = texture2D(tex, p);
          vec4 cb = texture2D(tex, p - progress * vec2(0.1, 0.));

          vec4 color = vec4(cr.r, cg.g, cb.b, 1.);
          gl_FragColor = color;
        }`
}

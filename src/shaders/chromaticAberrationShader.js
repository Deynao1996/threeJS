export const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    distortion: { value: 2.0 },
    offset: { value: 0.01 }
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float distortion;
    uniform float offset;

    varying vec2 vUv;

    void main() {
      vec2 r = vUv - 0.5;
      float dis = length(r);
      vec2 offset = r * distortion * dis * offset;
      vec4 red = texture2D(tDiffuse, vUv + offset);
      vec4 green = texture2D(tDiffuse, vUv);
      vec4 blue = texture2D(tDiffuse, vUv - offset);
      gl_FragColor = vec4(red.r, green.g, blue.b, 1.0);
      gl_FragColor *= 1.5;
    }
  `
}

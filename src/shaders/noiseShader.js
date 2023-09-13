export const noiseShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.00001 },
    speed: { value: 1.0 },
    scale: { value: 1.0 },
    time: { value: 0.0 }
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
    uniform float intensity;
    uniform float speed;
    uniform float scale;
    uniform float time;

    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float noise = 0.0;

      noise += rand(vUv * scale + time * speed) * 0.1;
      noise += rand(vUv * scale * 2.0 + time * speed * 2.0) * 0.2;
      noise += rand(vUv * scale * 4.0 + time * speed * 4.0) * 0.4;
      noise += rand(vUv * scale * 8.0 + time * speed * 8.0) * 0.8;
      noise = 1.0 - noise * intensity;

      vec4 texel = texture2D(tDiffuse, vUv);
      gl_FragColor = texel * vec4(vec3(noise), 1.0);
      gl_FragColor.rgb *= 1.;
    }
  `
}

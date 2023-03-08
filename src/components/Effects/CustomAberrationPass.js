import { ShaderMaterial, UniformsUtils, Vector2 } from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'

const AberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uSize: { value: new Vector2(window.innerWidth, window.innerHeight) }
    // center: { value: new Vector2(0.5, 0.5) },
    // angle: { value: 1.57 },
    // scale: { value: 1.0 },
    // progress: { value: 0.0 }
  },

  vertexShader: /* glsl */ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

  fragmentShader: /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec2 uSize;

  vec2 barrelDistortion(vec2 coord, float amt) {
    vec2 cc = coord - 0.5;
    float dist = dot(cc, cc);
    return coord + cc * dist * amt;
  }

  float sat( float t )
  {
    return clamp( t, 0.0, 1.0 );
  }

  float linterp( float t ) {
    return sat( 1.0 - abs( 2.0*t - 1.0 ) );
  }

  float remap( float t, float a, float b ) {
    return sat( (t - a) / (b - a) );
  }

  vec4 spectrum_offset( float t ) {
    vec4 ret;
    float lo = step(t,0.5);
    float hi = 1.0-lo;
    float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
    ret = vec4(lo,1.0,hi, 1.) * vec4(1.0-w, w, 1.0-w, 1.);

    return pow( ret, vec4(1.0/2.2) );
  }

  const float max_distort = 2.2;
  const int num_iter = 12;
  const float reci_num_iter_f = 1.0 / float(num_iter);

  void main()
  {	
    vec2 uv=(gl_FragCoord.xy/uSize.xy*.5)+.25;

    vec4 sumcol = vec4(0.0);
    vec4 sumw = vec4(0.0);	
    for ( int i=0; i<num_iter;++i )
    {
      float t = float(i) * reci_num_iter_f;
      vec4 w = spectrum_offset( t );
      sumw += w;
      sumcol += w * texture2D( tDiffuse, barrelDistortion(uv, .6 * max_distort*t ) );
    }
      
    gl_FragColor = sumcol / sumw;
  }`
}

class CustomAberrationPass extends Pass {
  constructor(center, angle, scale, progress = 0) {
    super()

    const shader = AberrationShader

    this.uniforms = UniformsUtils.clone(shader.uniforms)
    // this.progress = progress

    // if (center !== undefined) this.uniforms['center'].value.copy(center)
    // if (angle !== undefined) this.uniforms['angle'].value = angle
    // if (scale !== undefined) this.uniforms['scale'].value = scale
    // if (scale !== undefined) this.uniforms['progress'].value = 0

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    })

    this.fsQuad = new FullScreenQuad(this.material)
  }

  render(renderer, writeBuffer, readBuffer, deltaTime) {
    this.uniforms['tDiffuse'].value = readBuffer.texture
    this.uniforms['uTime'].value += 0.05
    this.uniforms['uSize'].value.set(readBuffer.width, readBuffer.height)
    // this.uniforms['progress'].value = this.progress

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }

  dispose() {
    this.material.dispose()
    this.fsQuad.dispose()
  }
}

export { CustomAberrationPass }

import { ShaderMaterial, UniformsUtils } from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import { noiseShader } from '../../shaders/noiseShader'

class NoiseEffectPass extends Pass {
  constructor(intensity = 0.2, speed = 1.0, scale = 1.0) {
    super()

    if (noiseShader === undefined) {
      console.error('THREE.NoiseEffectPass relies on NoiseShader')
    }

    const shader = noiseShader

    this.uniforms = UniformsUtils.clone(shader.uniforms)

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    })

    this.uniforms.intensity.value = intensity
    this.uniforms.speed.value = speed
    this.uniforms.scale.value = scale

    this.fsQuad = new FullScreenQuad(this.material)
  }

  render(renderer, writeBuffer, readBuffer, deltaTime) {
    this.uniforms.tDiffuse.value = readBuffer.texture
    this.uniforms.time.value += deltaTime

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }
}

export { NoiseEffectPass }

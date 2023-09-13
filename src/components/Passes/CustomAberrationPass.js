import { ShaderMaterial, UniformsUtils, Vector2 } from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import { ChromaticAberrationShader } from '../../shaders/chromaticAberrationShader'

class CustomAberrationPass extends Pass {
  constructor(distortion = 2.0, offset = 0.01) {
    super()

    if (ChromaticAberrationShader === undefined) {
      console.error(
        'THREE.ChromaticAberrationPass relies on ChromaticAberrationShader'
      )
    }

    const shader = ChromaticAberrationShader

    this.uniforms = UniformsUtils.clone(shader.uniforms)

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    })

    this.uniforms.distortion.value = distortion
    this.uniforms.offset.value = offset

    this.fsQuad = new FullScreenQuad(this.material)
  }

  render(renderer, writeBuffer, readBuffer, deltaTime) {
    this.uniforms.tDiffuse.value = readBuffer.texture

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

export { CustomAberrationPass }

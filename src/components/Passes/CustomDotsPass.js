import { ShaderMaterial, UniformsUtils, Vector2 } from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import { dotScreenShader } from '../../shaders/dotScreenShader'

class CustomDotsPass extends Pass {
  constructor(center, angle, scale, progress = 0) {
    super()

    const shader = dotScreenShader
    this.uniforms = UniformsUtils.clone(shader.uniforms)
    this.progress = progress

    if (center !== undefined) this.uniforms['center'].value.copy(center)
    if (angle !== undefined) this.uniforms['angle'].value = angle
    if (scale !== undefined) this.uniforms['scale'].value = scale
    if (scale !== undefined) this.uniforms['progress'].value = 0

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
    this.uniforms['progress'].value = this.progress

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

export { CustomDotsPass }

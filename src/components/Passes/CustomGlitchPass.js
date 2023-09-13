import {
  DataTexture,
  FloatType,
  MathUtils,
  RedFormat,
  LuminanceFormat,
  ShaderMaterial,
  UniformsUtils,
  Clock
} from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import { digitalGlitchShader } from '../../shaders/digitalGlitchShader'

class CustomGlitchPass extends Pass {
  constructor(dt_size = 64, distortion = 0.1, delay = 1, duration = 1) {
    super()

    if (digitalGlitchShader === undefined)
      console.error('THREE.GlitchPass relies on DigitalGlitch')

    const shader = digitalGlitchShader
    this.uniforms = UniformsUtils.clone(shader.uniforms)

    this.uniforms['tDisp'].value = this.generateHeightmap(dt_size)

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    })

    this.fsQuad = new FullScreenQuad(this.material)

    this.bypState = 1
    this.waiting = false
    this.delayPassed = false
    this.clock = new Clock()
    this.distortion = distortion
    this.delay = delay
    this.duration = duration

    this.goWild = false
    this.curF = 0
    this.generateTrigger()
  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime , maskActive */) {
    if (renderer.capabilities.isWebGL2 === false)
      this.uniforms['tDisp'].value.format = LuminanceFormat

    this.uniforms['tDiffuse'].value = readBuffer.texture
    this.uniforms['seed'].value = Math.random() //default seeding

    const elapsedTime = this.clock.getElapsedTime()

    if (this.delayPassed) {
      this.currentDuration = this.duration
    } else {
      this.currentDuration = this.delay
    }

    if (elapsedTime >= this.currentDuration) {
      this.bypState = this.bypState === 1 ? 0 : 1
      this.clock.start()

      if (this.bypState === 0) {
        this.waiting = true
        setTimeout(() => {
          this.bypState = 1
          this.waiting = false
          if (!this.delayPassed) this.delayPassed = true
        }, 1000)
      }
    }

    this.uniforms['byp'].value = this.bypState

    if (this.curF % this.randX === 0 || this.goWild === true) {
      this.uniforms['amount'].value = Math.random() / 3000
      this.uniforms['angle'].value = MathUtils.randFloat(-Math.PI, Math.PI)
      this.uniforms['seed_x'].value = MathUtils.randFloat(-1, 1)
      this.uniforms['seed_y'].value = MathUtils.randFloat(-1, 1)
      this.uniforms['distortion_x'].value = MathUtils.randFloat(
        0,
        this.distortion
      )
      this.uniforms['distortion_y'].value = MathUtils.randFloat(
        0,
        this.distortion
      )
      this.curF = 0
      this.generateTrigger()
    } else if (this.curF % this.randX < this.randX / 5) {
      this.uniforms['amount'].value = Math.random() / 9000
      this.uniforms['angle'].value = MathUtils.randFloat(-Math.PI, Math.PI)
      this.uniforms['distortion_x'].value = MathUtils.randFloat(
        0,
        this.distortion
      )
      this.uniforms['distortion_y'].value = MathUtils.randFloat(
        0,
        this.distortion
      )
      this.uniforms['seed_x'].value = MathUtils.randFloat(-0.3, 0.3)
      this.uniforms['seed_y'].value = MathUtils.randFloat(-0.3, 0.3)
    } else if (this.goWild === false && !this.waiting) {
      this.uniforms['byp'].value = 1
    }

    this.curF++

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }

  generateTrigger() {
    this.randX = MathUtils.randInt(120, 240)
  }

  generateHeightmap(dt_size) {
    const data_arr = new Float32Array(dt_size * dt_size)
    const length = dt_size * dt_size

    for (let i = 0; i < length; i++) {
      const val = MathUtils.randFloat(0, 1)
      data_arr[i] = val
    }

    const texture = new DataTexture(
      data_arr,
      dt_size,
      dt_size,
      RedFormat,
      FloatType
    )
    texture.needsUpdate = true
    return texture
  }
}

export { CustomGlitchPass }

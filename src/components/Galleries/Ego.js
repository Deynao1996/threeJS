import { OrbitControls } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DoubleSide, Mesh, PlaneGeometry, TextureLoader, Vector2 } from 'three'
import SimplexNoise from 'simplex-noise'
import image from '../../resources/img/antoni/antoni2.jpg'
import image1 from '../../resources/img/antoni/antoni1.jpg'
import image2 from '../../resources/img/billie.jpg'
import image3 from '../../resources/img/boeve.jpg'
import image4 from '../../resources/img/fashion.jpg'
import image5 from '../../resources/img/firstImage.jpg'
import { EgoShaderMaterial } from '../ExtendableShaders/EgoShader'

const simplex = new SimplexNoise()

const Ego = () => {
  const textures = useLoader(TextureLoader, [
    image,
    image1,
    image2,
    image3,
    image4,
    image5
  ])
  const {
    size: { height, width },
    scene,
    camera
  } = useThree()
  const [planes, setPlanes] = useState([])
  //VALUES
  const mouseRef = useRef(new Vector2(0, 0))
  const screenSpaceWidth =
    0.15 *
    Math.tan((camera.fov * Math.PI) / 180 / 2) *
    camera.position.z *
    camera.aspect
  //MATERIALS
  const material = useMemo(
    () =>
      new EgoShaderMaterial({
        side: DoubleSide,
        uniforms: {
          uResolution: { value: new Vector2(width, height) }
        }
      }),
    [height, width]
  )

  function handleMouseMove(e) {
    mouseRef.current = new Vector2(e.point.x, e.point.y)
  }

  function renderMeshes(textures, screenSpaceWidth) {
    setPlanes(
      textures.map((t, i) => {
        const k = i - 2
        const m = material.clone()
        m.uniforms.uProgress = { value: k * screenSpaceWidth }
        m.uniforms.uTexture = { value: t }
        const mesh = new Mesh(new PlaneGeometry(1, 2, 1, 1), m)
        mesh.position.x = k
        scene.add(mesh)
        return mesh
      })
    )
  }

  function getPoints(planes) {
    if (!planes.length) return
    const points = []
    planes.forEach((p) => {
      const posArr = p.geometry.attributes.position.array
      for (let i = 0; i < posArr.length; i += 3) {
        const x = posArr[i] + p.position.x
        const y = posArr[i + 1]
        const r1 = 0.1 * simplex.noise2D(x, y)
        const r2 = 0.1 * simplex.noise2D(x, y)
        points.push(
          <Point x={x + r1} y={y + r2} mousePos={mouseRef} mesh={p} i={i / 3} />
        )
      }
    })
    return points
  }

  useFrame(({ clock }) => {
    const uTime = clock.getElapsedTime()
    material.uniforms.uTime = { value: uTime }
  })

  useEffect(() => {
    renderMeshes(textures, screenSpaceWidth)
  }, [textures, screenSpaceWidth])

  const points = useMemo(() => getPoints(planes), [planes])

  return (
    <>
      <OrbitControls camera={camera} />
      <group>
        <mesh visible={false} onPointerMove={handleMouseMove}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial />
        </mesh>
        {points}
      </group>
    </>
  )
}

const Point = ({ x, y, mousePos, mesh, i }) => {
  const meshRef = useRef()
  const strength = 0.2
  let position = new Vector2(x, y)
  let originalPos = new Vector2(x, y)

  function mouseMovePoints() {
    const mouseForce = originalPos.clone().sub(mousePos.current)
    const distance = mouseForce.length()
    const forceFactor = 1 / Math.max(distance, strength)
    const posToGo = originalPos
      .clone()
      .sub(
        mouseForce
          .normalize()
          .multiplyScalar(-distance * strength * forceFactor)
      )
    position.lerp(posToGo, 0.1)
    meshRef.current.position.x = position.x
    meshRef.current.position.y = position.y

    let posArr = mesh.geometry.attributes.position.array
    posArr[i * 3] = position.x - mesh.position.x
    posArr[i * 3 + 1] = position.y
    mesh.geometry.attributes.position.needsUpdate = true
  }

  useFrame(() => {
    mouseMovePoints()
  })

  return (
    <mesh position={[x, y, 0]} ref={meshRef} visible={false}>
      <sphereGeometry args={[0.05, 10, 10]} />
      <meshBasicMaterial color={0x00ff00} />
    </mesh>
  )
}

export default Ego

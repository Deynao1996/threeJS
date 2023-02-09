import React, {useCallback, useEffect, useRef} from 'react'
import {useFrame, useLoader, useThree} from '@react-three/fiber'
import {Cloud, OrbitControls, PerspectiveCamera, Scroll, ScrollControls, Text, useHelper, useScroll} from '@react-three/drei'
import {TextureLoader} from 'three'
import gsap from 'gsap'

import firstImage from '../../resources/img/firstImage.jpg'
import secondImage from '../../resources/img/secondImage.jpg'
import thirdImage from '../../resources/img/thirdImage.jpg'
import fourthImage from '../../resources/img/fourthImage.jpg'

const Card = ({i, onEnter, onLeave, map}) => {
  let y = 0

  switch (i) {
    case 1:
      y = -1.8
    break
    case 2:
      y = -3.6
    break
    case 3:
      y = -5.4
    break
    default:
      y = 0
      break
  }

  return (
    <mesh position={[1, y, 0]} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <planeGeometry args={[1, 1.5]} />
      <meshStandardMaterial map={map}/>
    </mesh>
  )
}


const ScrollImages = () => {
  const cameraRef = useRef()
  const textRef = useRef()
  const [...maps] = useLoader(TextureLoader, [firstImage, secondImage, thirdImage, fourthImage])

  // const onMouseWheel = useCallback(event => {
  //   yRef.current = event.deltaY * 0.0020
  // }, [])

  // useEffect(() => {
  //   window.addEventListener('mousewheel', onMouseWheel)
  //   return () => window.removeEventListener('keydown', onMouseWheel)
  // }, [])

  // useFrame(() => {
  //   positionRef.current += yRef.current
  //   yRef.current *= .5
  //   cameraRef.current.position.y = positionRef.current
  // })

  const onEnter = (e) => {
    gsap.to(e.object.rotation, {y: -.5})
    gsap.to(e.object.scale, {x: 1.1, y: 1.1})
    gsap.to(e.object.position, {z: -.9})
  }
 
  const onLeave = (e) => {
    gsap.to(e.object.rotation, {y: 0})
    gsap.to(e.object.scale, {x: 1, y: 1})
    gsap.to(e.object.position, {z: 0})
  }

  useEffect(() => {
    gsap.from(textRef.current, {
      duration: 1,
      fillOpacity: 0,
      delay: 1.2
    })
    gsap.from(textRef.current.position, {
      duration: 2,
      x: -.5
    })
  }, [])


  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} ref={cameraRef}/>
      <ScrollControls
        damping={10}
        pages={1.7}
      >
        <Text color="white" anchorX="75%" anchorY="middle" fontSize={0.3} ref={textRef}>
          The city of excellence
        </Text>
        <Scroll>
          <group>
            {maps.map((map, i) => {
              return <Card 
                key={i}
                i={i}
                onEnter={onEnter}
                onLeave={onLeave}
                map={map}
              />
            })}
          </group>
        </Scroll>
      </ScrollControls>

      <ambientLight args={['#ffffff', 0.5]}/>
    </>
  )
}

export default ScrollImages
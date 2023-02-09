import {
  ChromaticAberration,
  EffectComposer,
  Noise,
  Sepia
} from '@react-three/postprocessing'

export const BoeveComposer = () => {
  return (
    <EffectComposer multisampling={0.5} renderPriority={3}>
      <Noise opacity={0.8} />
      <ChromaticAberration offset={[0.001, 0.003]} />
      <Sepia opacity={1} intensity={1} />
    </EffectComposer>
  )
}

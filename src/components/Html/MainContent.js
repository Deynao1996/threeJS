import { Grid, Typography } from '@mui/material'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

const startAnimationParams = {
  y: '-100%',
  opacity: 0,
  filter: 'blur(5px)'
}

const endAnimationParams = {
  delay: 4,
  y: '0%',
  opacity: 1,
  filter: 'blur(0px)',
  duration: 1,
  stagger: { from: 'random', each: 0.1 },
  ease: 'slow(0.7, 0.7, false)'
}

const MainContent = ({ title = 'WEB', subtitle = 'DEVELOPER' }) => {
  const titleCharsRef = useRef([])
  const subtitleCharsRef = useRef([])

  function fadeInAnimation() {
    gsap.fromTo(titleCharsRef.current, startAnimationParams, endAnimationParams)

    gsap.fromTo(subtitleCharsRef.current, startAnimationParams, {
      ...endAnimationParams,
      delay: 4.2
    })
  }

  function splitText(text, refsArr) {
    return text.split('').map((item, i) => (
      <div
        key={i}
        ref={(el) => (refsArr.current[i] = el)}
        style={{
          opacity: 0
        }}
      >
        {item}
      </div>
    ))
  }

  useEffect(() => {
    if (titleCharsRef) fadeInAnimation()
  }, [titleCharsRef])

  return (
    <Grid container component="main">
      <Grid item xs={2}></Grid>
      <Grid item xs={12} md={8} sx={{ pointerEvents: 'none', height: '100%' }}>
        <Typography
          variant="h1"
          component="h1"
          color="text.primary"
          sx={{ display: 'flex', overflow: 'hidden' }}
        >
          {splitText(title, titleCharsRef)}
        </Typography>
        <Typography
          variant="h1"
          component="h2"
          sx={(theme) => ({
            color: 'transparent',
            WebkitTextStrokeWidth: '1px',
            WebkitTextStrokeColor: theme.palette.text.primary,
            variant: { sm: 'h4', md: 'h1' },
            display: 'flex'
          })}
        >
          {splitText(subtitle, subtitleCharsRef)}
        </Typography>
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  )
}

export default MainContent

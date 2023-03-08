import styled from '@emotion/styled'
import { Box, Grid, keyframes, Typography } from '@mui/material'
import gsap from 'gsap'
import React, { useEffect, useRef } from 'react'

const mouseWheel = keyframes`
  0% { top: 1px; }
  25% { top: 2px; }
  50% { top: 3px;}
  75% { top: 2px;}
  100% { top: 1px;}
`

const mouseScroll = keyframes`
  0%   { opacity: 0; }
  50%  { opacity: .5; }
  100% { opacity: 1; }
`

const MouseScroll = styled('div')(({ theme }) => ({
  display: 'block',
  margin: '0 auto',
  width: '24px',
  height: '100px',
  [theme.breakpoints.down('md')]: {
    margin: '0 0 0 auto'
  }
}))

const Mouse = styled('div')({
  height: '42px',
  width: '24px',
  borderRadius: '14px',
  transform: 'none',
  border: '2px solid white',
  top: '170px'
})

const Wheel = styled('div')(({ theme }) => ({
  height: '5px',
  width: '2px',
  display: 'block',
  margin: '5px auto',
  background: theme.palette.text.primary,
  position: 'relative',
  height: '4px',
  width: '4px',
  border: `2px solid ${theme.palette.text.primary}`,
  WebkitBorderRadius: '8px',
  borderRadius: '8px',
  WebkitAnimation: `${mouseWheel} 0.6s linear infinite`,
  MozAnimation: `${mouseWheel} 0.6s linear infinite`,
  animation: `${mouseWheel} 0.6s linear infinite`
}))

const Arrow = styled('span')(({ theme }) => ({
  display: 'block',
  width: '5px',
  height: '5px',
  MsTransform: 'rotate(45deg)',
  WebkitTransform: 'rotate(45deg)',
  transform: 'rotate(45deg)',
  borderRight: `2px solid ${theme.palette.text.primary}`,
  borderBottom: `2px solid ${theme.palette.text.primary}`,
  margin: '0 0 3px 4px',
  width: '16px',
  height: '16px',
  WebkitAnimation: `${mouseScroll} 1s infinite`,
  MozAnimation: `${mouseScroll} 1s infinite`,
  animation: `${mouseScroll} 1s infinite`
}))

const FirstArrow = styled(Arrow)({
  marginTop: '1px',
  WebkitAnimationDelay: '.1s',
  MozAnimationDelay: '.1s',
  WebkitAnimationDirection: 'alternate',
  animationDirection: 'alternate',
  animationDelay: 'alternate'
})

const SecondArrow = styled(Arrow)({
  WebkitAnimationDelay: '.2s',
  MozAnimationDelay: '.2s',
  WebkitAnimationDirection: 'alternate',
  animationDelay: '.2s',
  animationDirection: 'alternate',
  marginTop: '-6px'
})

const ThirdArrow = styled(Arrow)({
  WebkitAnimationDelay: '.3s',
  MozAnimationDelay: '.3s',
  WebkitAnimationDirection: 'alternate',
  animationDelay: '.3s',
  animationDirection: 'alternate',
  marginTop: '-6px'
})

const ProgressCircleWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  height: '100%',
  pointerEvents: 'none',
  '& > svg': {
    height: '20px',
    transform: 'rotate(-90deg)',
    width: '20px',
    '& > circle': {
      fill: 'none',
      stroke: theme.palette.text.primary,
      strokeDasharray: '100 100',
      strokeDashoffset: '100',
      strokeLinecap: 'round',
      strokeWidth: '1.8'
    }
  }
}))

const Footer = React.forwardRef((_props, ref) => {
  const containerRef = useRef()

  useEffect(() => {
    gsap.to(containerRef.current, {
      opacity: 1,
      duration: 3,
      delay: 5
    })
  }, [])

  return (
    <Grid container component="footer" ref={containerRef} sx={{ opacity: 0 }}>
      <Grid item xs={12} md={2}>
        <ProgressCircleWrapper>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 34 34">
            <circle cx="16" cy="16" ref={ref} r="15.9155" />
          </svg>
        </ProgressCircleWrapper>
      </Grid>
      <Grid item xs={6} md={8}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <Typography variant="caption" component="div" color="text.primary">
            PORTFOLIO 2023
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} md={2}>
        <MouseScroll>
          <Mouse>
            <Wheel />
          </Mouse>
          <div>
            <FirstArrow />
            <SecondArrow />
            <ThirdArrow />
          </div>
        </MouseScroll>
      </Grid>
    </Grid>
  )
})

export default Footer

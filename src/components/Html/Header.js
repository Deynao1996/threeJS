import styled from '@emotion/styled'
import { Menu } from '@mui/icons-material'
import { Box, Grid, IconButton, Link, Typography } from '@mui/material'
import gsap from 'gsap'
import React, { useEffect, useRef } from 'react'
import logo from '../../resources/img/svg/letter_d.svg'

const pathVariants = [
  { label: 'Home', path: '/' },
  { label: 'Works', path: '/works/social' },
  { label: 'About me', path: '/about' }
]

const StyledLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'content'
})(({ theme, content }) => ({
  overflow: 'hidden',
  position: 'relative',
  display: 'inline-block',
  fontSize: '0.9rem',
  cursor: 'pointer',
  color: theme.palette.text.primary,
  [theme.breakpoints.down('md')]: {
    display: 'none'
  },
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    left: 0
  },
  '&::before': {
    backgroundColor: theme.palette.text.primary,
    height: '2px',
    bottom: 0,
    transformOrigin: '100% 50%',
    transform: 'scaleX(0)',
    transition: 'transform .3s cubic-bezier(0.76, 0, 0.24, 1)'
  },
  '&::after': {
    content: `'${content}'`,
    height: '100%',
    top: 0,
    transformOrigin: '100% 50%',
    transform: 'translate3d(200%, 0, 0)',
    transition: 'transform .3s cubic-bezier(0.76, 0, 0.24, 1)',
    color: theme.palette.text.primary
  },
  '&:hover::before': {
    transformOrigin: '0% 50%',
    transform: 'scaleX(1)'
  },
  '&:hover::after': {
    transform: 'translate3d(0, 0, 0)'
  },
  '& > span': {
    display: 'inline-block',
    transition: 'transform .3s cubic-bezier(0.76, 0, 0.24, 1)'
  },
  '&:hover > span': {
    transform: 'translate3d(-200%, 0, 0)'
  }
}))

const Header = ({ handleNavigate, layoutRef }) => {
  const ref = useRef()
  const currentPathName = window.location.pathname

  function handleClick(path) {
    if (currentPathName === path) return
    gsap.to(layoutRef.current, {
      opacity: 0,
      duration: 2,
      filter: 'blur(5px)',
      onComplete: () => handleNavigate(path)
    })
  }

  function filterRelativePaths(variant) {
    if (currentPathName.includes('works') && variant.label === 'Works')
      return false
    return variant.path !== currentPathName
  }

  function setRelativeLinks() {
    return pathVariants
      .filter(filterRelativePaths)
      .map(({ path, label }, i) => (
        <React.Fragment key={i}>
          <StyledLink onClick={() => handleClick(path)} content={label}>
            <span>{label}</span>
          </StyledLink>
          {i === 0 && <Box color="text.primary">/</Box>}
        </React.Fragment>
      ))
  }

  useEffect(() => {
    gsap.to(ref.current, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1,
      delay: 3,
      ease: 'power2.out'
    })
  }, [])

  return (
    <Grid
      container
      component="header"
      sx={{
        alignItems: { xs: 'center', sm: 'flex-start' },
        opacity: 0,
        filter: 'blur(5px)'
      }}
      ref={ref}
    >
      <Grid item xs={6} sm={2}>
        <IconButton
          aria-label="main"
          size="small"
          onClick={() => handleClick('/')}
        >
          <img
            src={logo}
            alt="logo"
            style={{
              width: '4rem',
              height: '4rem'
            }}
          />
        </IconButton>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{ pointerEvents: 'none', display: { xs: 'none', sm: 'block' } }}
      >
        <Typography
          variant="body2"
          component="div"
          fontWeight={'bold'}
          color="text.primary"
        >
          DMYTRO BLUDOV
        </Typography>
        <Typography
          variant="caption"
          component="div"
          mt={3}
          color="text.primary"
        >
          UKRAINE
        </Typography>
        <Typography variant="caption" component="div" color="text.primary">
          KHARKIV
        </Typography>
      </Grid>
      <Grid item xs={6} sm={2} component="nav">
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: { xs: 'flex-end', md: 'flex-start' },
            alignItems: 'center'
          }}
        >
          {setRelativeLinks()}
          <IconButton
            color="text.primary"
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <Menu />
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  )
}

export default Header

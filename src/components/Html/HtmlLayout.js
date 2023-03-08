import { Box, Container } from '@mui/material'
import { Html } from '@react-three/drei'
import React from 'react'
import { ThemeProvider } from './ThemeContext'

const HtmlLayout = React.forwardRef(({ children }, ref) => {
  return (
    <Html center zIndexRange={[10, 1]}>
      <ThemeProvider>
        <Box
          ref={ref}
          sx={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="90%">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100vh',
                py: { xs: 2, sm: 6 }
              }}
            >
              {children}
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </Html>
  )
})

export default HtmlLayout

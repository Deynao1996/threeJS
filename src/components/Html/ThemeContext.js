import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider
} from '@mui/material'
import React, { useContext, useState, useMemo, useEffect } from 'react'

const ThemeContext = React.createContext()

export const useThemeProvider = () => {
  return useContext(ThemeContext)
}

export const ThemeProvider = ({ children }) => {
  let theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: [
            'Orbitron',
            'Chakra Petch',
            'Josefin Sans, Roboto',
            'sans-serif'
          ].join(',')
        },
        palette: {
          mode: 'dark'
        }
      }),
    []
  )

  theme = responsiveFontSizes(theme)

  const value = {
    theme
  }

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </MuiThemeProvider>
  )
}

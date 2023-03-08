import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const withNavigate = (BaseComponent) => {
  return (props) => {
    const navigate = useNavigate()

    const handleNavigate = useCallback(
      (to) => {
        navigate(to)
      },
      [navigate]
    )

    return <BaseComponent {...props} handleNavigate={handleNavigate} />
  }
}

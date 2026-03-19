'use client'

import { useEffect, useState } from 'react'

interface ChartWrapperProps {
  children: React.ReactNode
  height?: number
}

export default function ChartWrapper({ children, height = 400 }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ width: '100%', height, minWidth: 0 }} />
  }

  return (
    <div style={{ width: '100%', height, minWidth: 0 }}>
      {children}
    </div>
  )
}
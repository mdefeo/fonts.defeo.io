"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { JSX } from "react"

interface ContentEditableProps {
  html: string
  onChange: (html: string) => void
  as?: keyof JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
}

export default function ContentEditable({
  html,
  onChange,
  as: Component = "div",
  className,
  style,
  ...props
}: ContentEditableProps) {
  const contentEditableRef = useRef<HTMLElement>(null)
  const htmlRef = useRef(html)

  // Initialize content when component mounts and update when html prop changes
  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = html
      htmlRef.current = html
    }
  }, [html])

  // Only update parent state when focus is lost
  const handleBlur = () => {
    if (contentEditableRef.current) {
      const newHtml = contentEditableRef.current.innerHTML
      if (newHtml !== htmlRef.current) {
        htmlRef.current = newHtml
        onChange(newHtml)
      }
    }
  }

  return (
    <Component
      ref={contentEditableRef}
      contentEditable={true}
      onBlur={handleBlur}
      className={cn("focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm", className)}
      style={style}
      suppressContentEditableWarning={true}
      {...props}
    />
  )
}


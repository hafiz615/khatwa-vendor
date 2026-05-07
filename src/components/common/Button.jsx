import React from 'react'

function Button({
    onClick,
    className,
    children,
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 text-white cursor-pointer shadow-lg rounded-md 
                  hover:bg-blue-700 hover:scale-105 transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  )
}

export default Button

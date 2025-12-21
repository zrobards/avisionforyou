'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiZoomIn } from 'react-icons/fi'

interface ImageLightboxProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  caption?: string
  showZoomIcon?: boolean
}

export default function ImageLightbox({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  caption,
  showZoomIcon = true
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openLightbox = () => {
    setIsOpen(true)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setIsOpen(false)
    // Re-enable body scroll
    document.body.style.overflow = 'unset'
  }

  return (
    <>
      {/* Thumbnail Image */}
      <div className="relative group cursor-pointer" onClick={openLightbox}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
        />
        
        {/* Hover Overlay with Zoom Icon */}
        {showZoomIcon && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <FiZoomIn className="w-6 h-6 text-gray-900" />
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-[10000] bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 group"
              aria-label="Close lightbox"
            >
              <FiX className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring', damping: 25 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={src}
                  alt={alt}
                  width={width * 2}
                  height={height * 2}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  quality={100}
                />
              </div>

              {/* Caption */}
              {(caption || alt) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 text-center"
                >
                  <p className="text-white text-sm md:text-base bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                    {caption || alt}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Click anywhere to close hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <p className="text-white/60 text-sm">Click anywhere to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}



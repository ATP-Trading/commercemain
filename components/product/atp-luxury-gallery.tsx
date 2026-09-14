"use client";

/**
 * ATPLuxuryGallery Component
 * 
 * Award-winning product gallery with:
 * - Fullscreen lightbox mode with proper zoom/pan/pinch
 * - Enhanced zoom controls (in/out/reset/fit)
 * - Mouse wheel zoom support
 * - Mobile pinch-to-zoom gestures
 * - Pan/drag when zoomed
 * - Thumbnail strip with scroll
 * - Mobile swipe gestures for navigation
 * - Keyboard navigation
 * - RTL support
 * - Reduced motion support
 * - Zoom level indicator
 * 
 * Part of ATP Trading luxury e-commerce redesign.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";
import { 
  TransformWrapper, 
  TransformComponent,
  useControls,
  type ReactZoomPanPinchRef 
} from "react-zoom-pan-pinch";
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";
import { Expand, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minus, Plus } from "lucide-react";
import { 
  overlayVariants, 
  scaleVariants, 
  containerVariants,
  itemVariants,
  transitions 
} from "@/lib/animations/variants";
import { useProduct, useUpdateURL } from "@/components/product/product-context";
import { useRTL } from "@/hooks/use-rtl";
import { useGallerySwipe } from "@/hooks/use-gallery-swipe";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ATPLuxuryGalleryProps {
  images: Array<{ src: string; altText: string }>;
  productTitle: string;
  enableZoom?: boolean;
  enableLightbox?: boolean;
  enableSwipe?: boolean;
}

// Zoom controls component for the lightbox
function LightboxZoomControls({ 
  onZoomChange,
  isRTL 
}: { 
  onZoomChange?: (scale: number) => void;
  isRTL: boolean;
}) {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls();
  const t = useTranslations("gallery");

  const buttonClass = cn(
    "h-10 w-10 flex items-center justify-center rounded-full",
    "bg-white/10 hover:bg-white/20 text-white transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-atp-gold",
    "disabled:opacity-50 disabled:pointer-events-none",
    "backdrop-blur-sm"
  );

  return (
    <div className={cn(
      "absolute bottom-20 z-20 flex items-center gap-2 px-3 py-2 rounded-full",
      "bg-black/40 backdrop-blur-md border border-white/10",
      isRTL ? "right-4" : "left-4"
    )}>
      <button
        onClick={() => zoomOut()}
        className={buttonClass}
        aria-label={t("zoomOut")}
        title={t("zoomOut")}
      >
        <Minus className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => resetTransform()}
        className={buttonClass}
        aria-label={t("resetZoom")}
        title={t("resetZoom")}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => centerView(1)}
        className={buttonClass}
        aria-label={t("fitToScreen")}
        title={t("fitToScreen")}
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => zoomIn()}
        className={buttonClass}
        aria-label={t("zoomIn")}
        title={t("zoomIn")}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// Main gallery zoom controls for hover state
function MainGalleryZoomControls({ 
  isZooming, 
  onToggleZoom,
  isRTL 
}: { 
  isZooming: boolean; 
  onToggleZoom: () => void;
  isRTL: boolean;
}) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const t = useTranslations("gallery");

  const buttonClass = cn(
    "h-9 w-9 flex items-center justify-center rounded-full",
    "bg-white/90 dark:bg-black/90",
    "border border-neutral-200 dark:border-neutral-700",
    "text-neutral-700 dark:text-neutral-200",
    "hover:scale-110 transition-transform",
    "focus:outline-none focus:ring-2 focus:ring-atp-gold"
  );

  return (
    <div className={cn(
      "absolute bottom-3 z-20 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100",
      isRTL ? "left-3" : "right-3"
    )}>
      <button
        className={buttonClass}
        aria-label={t("zoomOut")}
        onClick={() => zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        className={buttonClass}
        aria-label={t("resetZoom")}
        onClick={() => resetTransform()}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        className={buttonClass}
        aria-label={t("zoomIn")}
        onClick={() => zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ATPLuxuryGallery({
  images,
  productTitle,
  enableZoom = true,
  enableLightbox = true,
  enableSwipe = true,
}: ATPLuxuryGalleryProps) {
  const { state, updateImage } = useProduct();
  const updateURL = useUpdateURL();
  const { isRTL } = useRTL();
  const t = useTranslations("gallery");
  const prefersReducedMotion = useReducedMotion();
  
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lightboxZoomLevel, setLightboxZoomLevel] = useState(1);
  
  const imageIndex = state.image ? parseInt(state.image) : 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const lightboxTransformRef = useRef<ReactZoomPanPinchRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset zoom when image changes
  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
    if (lightboxTransformRef.current) {
      lightboxTransformRef.current.resetTransform();
    }
    setZoomLevel(1);
    setLightboxZoomLevel(1);
  }, [imageIndex]);

  // Navigation handlers
  const goToImage = useCallback((index: number) => {
    const newState = updateImage(index.toString());
    updateURL(newState);
  }, [updateImage, updateURL]);

  const goNext = useCallback(() => {
    const nextIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
    goToImage(nextIndex);
  }, [imageIndex, images.length, goToImage]);

  const goPrev = useCallback(() => {
    const prevIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;
    goToImage(prevIndex);
  }, [imageIndex, images.length, goToImage]);

  // Swipe handling
  const { dragProps, isDragging } = useGallerySwipe({
    totalImages: images.length,
    currentIndex: imageIndex,
    onIndexChange: goToImage,
    isRTL,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        isRTL ? goNext() : goPrev();
      } else if (e.key === "ArrowRight") {
        isRTL ? goPrev() : goNext();
      } else if (e.key === "+" || e.key === "=") {
        lightboxTransformRef.current?.zoomIn();
      } else if (e.key === "-") {
        lightboxTransformRef.current?.zoomOut();
      } else if (e.key === "0") {
        lightboxTransformRef.current?.resetTransform();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, isRTL, goNext, goPrev]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const currentImage = images[imageIndex];
  if (!currentImage || images.length === 0) return null;

  // Navigation button styling
  const navButtonClass = cn(
    "absolute top-1/2 -translate-y-1/2 z-10",
    "h-10 w-10 flex items-center justify-center",
    "rounded-full bg-white/90 dark:bg-black/90",
    "border border-neutral-200 dark:border-neutral-700",
    "text-neutral-700 dark:text-neutral-300",
    "transition-all duration-200",
    "hover:scale-110 hover:bg-white dark:hover:bg-black",
    "hover:shadow-lg hover:shadow-atp-gold/10",
    "focus:outline-none focus:ring-2 focus:ring-atp-gold",
    "disabled:opacity-50 disabled:pointer-events-none"
  );

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Image Container */}
        <div 
          ref={containerRef}
          className={cn(
            "relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-xl",
            "bg-neutral-100 dark:bg-neutral-900",
            "group"
          )}
        >
          {enableZoom ? (
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={1}
              maxScale={4}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
              pinch={{ step: 5 }}
              doubleClick={{ mode: "toggle", step: 2 }}
              panning={{ 
                disabled: zoomLevel <= 1,
                velocityDisabled: true 
              }}
              onTransformed={(ref, state) => {
                setZoomLevel(state.scale);
              }}
              limitToBounds={true}
              centerZoomedOut={true}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent
                    wrapperStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    contentStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <m.div
                      {...(enableSwipe && images.length > 1 && zoomLevel <= 1 ? dragProps : {})}
                      className={cn(
                        "relative h-full w-full",
                        enableSwipe && images.length > 1 && zoomLevel <= 1 && "cursor-grab active:cursor-grabbing",
                        zoomLevel > 1 && "cursor-move"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        <m.div
                          key={imageIndex}
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                          transition={transitions.normal}
                          className="relative h-full w-full"
                        >
                          <Image
                            src={currentImage.src}
                            alt={currentImage.altText || `${productTitle} - Image ${imageIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="(min-width: 1024px) 66vw, 100vw"
                            priority={imageIndex === 0}
                            draggable={false}
                          />
                        </m.div>
                      </AnimatePresence>
                    </m.div>
                  </TransformComponent>

                  {/* Zoom Controls */}
                  <div className={cn(
                    "absolute bottom-3 z-20 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100",
                    isRTL ? "left-3" : "right-3"
                  )}>
                    <button
                      className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-full",
                        "bg-white/90 dark:bg-black/90",
                        "border border-neutral-200 dark:border-neutral-700",
                        "text-neutral-700 dark:text-neutral-200",
                        "hover:scale-110 transition-transform",
                        "focus:outline-none focus:ring-2 focus:ring-atp-gold"
                      )}
                      aria-label={t("zoomOut")}
                      onClick={() => zoomOut()}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <button
                      className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-full",
                        "bg-white/90 dark:bg-black/90",
                        "border border-neutral-200 dark:border-neutral-700",
                        "text-neutral-700 dark:text-neutral-200",
                        "hover:scale-110 transition-transform",
                        "focus:outline-none focus:ring-2 focus:ring-atp-gold"
                      )}
                      aria-label={t("resetZoom")}
                      onClick={() => resetTransform()}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-full",
                        "bg-white/90 dark:bg-black/90",
                        "border border-neutral-200 dark:border-neutral-700",
                        "text-neutral-700 dark:text-neutral-200",
                        "hover:scale-110 transition-transform",
                        "focus:outline-none focus:ring-2 focus:ring-atp-gold"
                      )}
                      aria-label={t("zoomIn")}
                      onClick={() => zoomIn()}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    {enableLightbox && (
                      <button
                        className={cn(
                          "h-9 w-9 flex items-center justify-center rounded-full",
                          "bg-white/90 dark:bg-black/90",
                          "border border-neutral-200 dark:border-neutral-700",
                          "text-neutral-700 dark:text-neutral-200",
                          "hover:scale-110 transition-transform",
                          "focus:outline-none focus:ring-2 focus:ring-atp-gold"
                        )}
                        aria-label={t("expandImage")}
                        onClick={() => setIsLightboxOpen(true)}
                      >
                        <Expand className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </TransformWrapper>
          ) : (
            // Non-zoom fallback
            <m.div
              {...(enableSwipe && images.length > 1 ? dragProps : {})}
              className={cn(
                "relative h-full w-full",
                enableSwipe && images.length > 1 && "cursor-grab active:cursor-grabbing"
              )}
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={imageIndex}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={transitions.normal}
                  className="relative h-full w-full"
                >
                  <Image
                    src={currentImage.src}
                    alt={currentImage.altText || `${productTitle} - Image ${imageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    priority={imageIndex === 0}
                  />
                </m.div>
              </AnimatePresence>
            </m.div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={isRTL ? goNext : goPrev}
                className={cn(navButtonClass, isRTL ? "right-3" : "left-3")}
                aria-label={isRTL ? t("nextImage") : t("previousImage")}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={isRTL ? goPrev : goNext}
                className={cn(navButtonClass, isRTL ? "left-3" : "right-3")}
                aria-label={isRTL ? t("previousImage") : t("nextImage")}
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom Level Indicator */}
          {enableZoom && zoomLevel > 1 && (
            <div className={cn(
              "absolute top-3 px-3 py-1 rounded-full",
              "bg-black/60 text-white text-xs font-medium",
              "transition-opacity",
              isRTL ? "right-3" : "left-3"
            )}>
              {Math.round(zoomLevel * 100)}%
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className={cn(
              "absolute bottom-3 px-3 py-1 rounded-full",
              "bg-black/60 text-white text-xs font-medium",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              isRTL ? "right-3" : "left-3"
            )}>
              {imageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <m.ul 
            variants={prefersReducedMotion ? {} : containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "mt-4 flex items-center justify-center gap-2",
              "overflow-x-auto py-2 scrollbar-hide",
              "-mx-2 px-2"
            )}
          >
            {images.map((image, index) => (
              <m.li 
                key={image.src}
                variants={prefersReducedMotion ? {} : itemVariants}
              >
                <button
                  onClick={() => goToImage(index)}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg",
                    "border-2 transition-all duration-200",
                    index === imageIndex 
                      ? "border-atp-gold ring-2 ring-atp-gold/30 ring-offset-2 ring-offset-white dark:ring-offset-black" 
                      : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600",
                    "focus:outline-none focus:ring-2 focus:ring-atp-gold"
                  )}
                  aria-label={`${t("thumbnailLabel")} ${index + 1}`}
                  aria-current={index === imageIndex ? "true" : undefined}
                >
                  <Image
                    src={image.src}
                    alt={image.altText || `Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              </m.li>
            ))}
          </m.ul>
        )}
      </div>

      {/* Lightbox Portal */}
      {mounted && enableLightbox && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <div 
              className="fixed inset-0 z-[100]" 
              role="dialog" 
              aria-modal="true"
              aria-label={t("expandImage")}
            >
              {/* Backdrop */}
              <m.div
                variants={prefersReducedMotion ? {} : overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
                onClick={() => setIsLightboxOpen(false)}
              />

              {/* Content */}
              <m.div
                variants={prefersReducedMotion ? {} : scaleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative h-full w-full flex items-center justify-center p-4 md:p-8"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className={cn(
                    "absolute top-4 z-20 h-12 w-12 flex items-center justify-center rounded-full",
                    "bg-white/10 hover:bg-white/20 text-white transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-atp-gold",
                    isRTL ? "left-4" : "right-4"
                  )}
                  aria-label={t("closeFullscreen")}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={isRTL ? goNext : goPrev}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 z-20 h-14 w-14",
                        "flex items-center justify-center rounded-full",
                        "bg-white/10 hover:bg-white/20 text-white transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-atp-gold",
                        isRTL ? "right-4" : "left-4"
                      )}
                      aria-label={isRTL ? t("nextImage") : t("previousImage")}
                    >
                      <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={isRTL ? goPrev : goNext}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 z-20 h-14 w-14",
                        "flex items-center justify-center rounded-full",
                        "bg-white/10 hover:bg-white/20 text-white transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-atp-gold",
                        isRTL ? "left-4" : "right-4"
                      )}
                      aria-label={isRTL ? t("previousImage") : t("nextImage")}
                    >
                      <ArrowRightIcon className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Lightbox Image with Full Zoom/Pan/Pinch */}
                <div className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center">
                  <TransformWrapper
                    ref={lightboxTransformRef}
                    initialScale={1}
                    minScale={0.5}
                    maxScale={5}
                    centerOnInit={true}
                    wheel={{ step: 0.1 }}
                    pinch={{ step: 5 }}
                    doubleClick={{ mode: "toggle", step: 2 }}
                    panning={{ velocityDisabled: true }}
                    onTransformed={(ref, state) => {
                      setLightboxZoomLevel(state.scale);
                    }}
                    limitToBounds={false}
                    centerZoomedOut={true}
                  >
                    {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                      <>
                        <TransformComponent
                          wrapperStyle={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          contentStyle={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AnimatePresence mode="wait">
                            <m.div
                              key={imageIndex}
                              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                              transition={transitions.normal}
                              className={cn(
                                "relative",
                                lightboxZoomLevel > 1 ? "cursor-move" : "cursor-zoom-in"
                              )}
                            >
                              <Image
                                src={currentImage.src}
                                alt={currentImage.altText || `${productTitle} - Image ${imageIndex + 1}`}
                                width={1200}
                                height={1200}
                                className="max-h-[85vh] w-auto object-contain rounded-lg select-none"
                                priority
                                draggable={false}
                              />
                            </m.div>
                          </AnimatePresence>
                        </TransformComponent>

                        {/* Lightbox Zoom Controls */}
                        <div className={cn(
                          "absolute bottom-20 z-20 flex items-center gap-2 px-3 py-2 rounded-full",
                          "bg-black/40 backdrop-blur-md border border-white/10",
                          isRTL ? "right-4" : "left-4"
                        )}>
                          <button
                            onClick={() => zoomOut()}
                            className={cn(
                              "h-10 w-10 flex items-center justify-center rounded-full",
                              "bg-white/10 hover:bg-white/20 text-white transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-atp-gold",
                              "backdrop-blur-sm"
                            )}
                            aria-label={t("zoomOut")}
                            title={t("zoomOut")}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => resetTransform()}
                            className={cn(
                              "h-10 w-10 flex items-center justify-center rounded-full",
                              "bg-white/10 hover:bg-white/20 text-white transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-atp-gold",
                              "backdrop-blur-sm"
                            )}
                            aria-label={t("resetZoom")}
                            title={t("resetZoom")}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => centerView(1)}
                            className={cn(
                              "h-10 w-10 flex items-center justify-center rounded-full",
                              "bg-white/10 hover:bg-white/20 text-white transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-atp-gold",
                              "backdrop-blur-sm"
                            )}
                            aria-label={t("fitToScreen")}
                            title={t("fitToScreen")}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => zoomIn()}
                            className={cn(
                              "h-10 w-10 flex items-center justify-center rounded-full",
                              "bg-white/10 hover:bg-white/20 text-white transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-atp-gold",
                              "backdrop-blur-sm"
                            )}
                            aria-label={t("zoomIn")}
                            title={t("zoomIn")}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Lightbox Zoom Level Indicator */}
                        <div className={cn(
                          "absolute bottom-20 px-3 py-1.5 rounded-full",
                          "bg-black/40 backdrop-blur-md border border-white/10",
                          "text-white text-sm font-medium",
                          isRTL ? "left-4" : "right-4"
                        )}>
                          {Math.round(lightboxZoomLevel * 100)}%
                        </div>
                      </>
                    )}
                  </TransformWrapper>
                </div>

                {/* Lightbox Thumbnails */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 z-20">
                    {images.map((image, index) => (
                      <button
                        key={image.src}
                        onClick={() => goToImage(index)}
                        className={cn(
                          "w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                          index === imageIndex 
                            ? "border-atp-gold scale-110" 
                            : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                        )}
                        aria-label={`${t("thumbnailLabel")} ${index + 1}`}
                      >
                        <Image
                          src={image.src}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium z-20">
                    {imageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Keyboard Shortcuts Hint */}
                <div className={cn(
                  "absolute bottom-4 px-3 py-1.5 rounded-full",
                  "bg-black/40 backdrop-blur-md border border-white/10",
                  "text-white/60 text-xs",
                  "hidden md:block",
                  isRTL ? "left-4" : "right-4"
                )}>
                  {t("keyboardShortcuts")}
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

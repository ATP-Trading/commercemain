"use client";
import { isEmsPromotion } from "@/lib/publication-policy";

/**
 * InstagramFeed Component
 * 
 * Award-winning Instagram feed integration for ATP Trading.
 * Features:
 * - Responsive grid layout (2/3/4 columns)
 * - Hover effects with caption reveal
 * - Video thumbnail support
 * - Lightbox modal for full view
 * - Skeleton loading states
 * - RTL support
 * - Reduced motion preference
 */

import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRTL } from "@/hooks/use-rtl";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  Instagram, 
  Heart, 
  MessageCircle, 
  Play, 
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Images
} from "lucide-react";
import { 
  containerVariants, 
  overlayVariants,
  modalVariants,
  transitions,
  easing 
} from "@/lib/animations/variants";
import { cn } from "@/lib/utils";
import type { InstagramPost } from "@/app/api/instagram/route";

interface InstagramFeedProps {
  limit?: number;
  className?: string;
}

export function InstagramFeed({ limit = 8, className }: InstagramFeedProps) {
  const t = useTranslations("instagram");
  const { isRTL } = useRTL();
  const prefersReducedMotion = useReducedMotion();
  
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Fetch Instagram posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/instagram?limit=${limit}`);
        const data = await response.json();
        
        if (data.posts) {
          setPosts(data.posts.filter((post: InstagramPost) => !isEmsPromotion(post.caption || "")));
          setIsDemo(data.demo || false);
        }
        if (data.error) {
          console.warn('Instagram API:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch Instagram posts:', err);
        setError('Failed to load Instagram feed');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit]);

  const openLightbox = useCallback((post: InstagramPost) => {
    setSelectedPost(post);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedPost(null);
    document.body.style.overflow = '';
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (!selectedPost) return;
    const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % posts.length
      : (currentIndex - 1 + posts.length) % posts.length;
    setSelectedPost(posts[newIndex]);
  }, [selectedPost, posts]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPost) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(isRTL ? 'next' : 'prev');
      if (e.key === 'ArrowRight') navigateLightbox(isRTL ? 'prev' : 'next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost, closeLightbox, navigateLightbox, isRTL]);

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.4, ease: easing.smooth }
    },
  };

  if (!loading && posts.length === 0) return null;

  return (
    <section className={cn("section-padding bg-atp-light-gray overflow-hidden", className)}>
      <div className="container-premium">
        {/* Section Header */}
        <m.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: easing.smooth }}
        >
          <div className={cn(
            "flex items-center justify-center gap-3 mb-4",
            isRTL && "flex-row-reverse"
          )}>
            <m.div
              className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={transitions.springBouncy}
            >
              <Instagram className="w-6 h-6 text-white" />
            </m.div>
            <h2 className={cn(
              "text-3xl md:text-4xl font-serif text-atp-black",
              isRTL && "font-arabic"
            )}>
              {t("title")}
            </h2>
          </div>
          <p className={cn(
            "text-lg text-atp-charcoal max-w-2xl mx-auto",
            isRTL && "font-arabic"
          )}>
            {t("subtitle")}
          </p>
          
          <m.a
              href="https://www.instagram.com/atp_trading/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 mt-4 text-sm font-medium text-atp-gold hover:text-atp-gold/80 transition-colors",
              isRTL && "flex-row-reverse"
            )}
            whileHover={{ x: isRTL ? -5 : 5 }}
          >
            <span>@atpgroupservices</span>
            <ExternalLink className="w-4 h-4" />
          </m.a>
        </m.div>

        {/* Demo Banner */}
        {isDemo && (
          <m.div 
            className="mb-6 p-3 bg-amber-100 border border-amber-300 rounded-lg text-center text-sm text-amber-800"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("demoMode")}
          </m.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div 
                key={i}
                className="aspect-square bg-neutral-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 text-atp-charcoal">
            <Instagram className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        )}

        {/* Instagram Grid */}
        {!loading && !error && posts.length > 0 && (
          <m.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {posts.map((post, index) => (
              <m.div
                key={post.id}
                variants={itemVariants}
                className="group relative aspect-square cursor-pointer"
                onClick={() => openLightbox(post)}
              >
                <m.div
                  className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-200"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  transition={transitions.fast}
                >
                  {/* Image - handle empty demo URLs */}
                  {(post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url) ? (
                    <Image
                      src={post.media_type === 'VIDEO' && post.thumbnail_url 
                        ? post.thumbnail_url 
                        : post.media_url}
                      alt={post.caption?.slice(0, 100) || 'Instagram post'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    /* CSS placeholder for demo mode */
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-400/20 flex items-center justify-center"
                    >
                      <Instagram className="w-12 h-12 text-atp-gold/50" />
                    </div>
                  )}
                  
                  {/* Video/Carousel Badge */}
                  {post.media_type === 'VIDEO' && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                  {post.media_type === 'CAROUSEL_ALBUM' && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                      <Images className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <m.div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                    initial={false}
                  >
                    {/* Caption Preview */}
                    {post.caption && (
                      <p className={cn(
                        "text-white text-sm line-clamp-3 leading-relaxed",
                        isRTL && "font-arabic text-right"
                      )}>
                        {post.caption}
                      </p>
                    )}
                    
                    {/* Engagement Icons */}
                    <div className={cn(
                      "flex items-center gap-4 mt-3 text-white/80",
                      isRTL && "flex-row-reverse"
                    )}>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                      </span>
                    </div>
                  </m.div>

                  {/* Gold border on hover */}
                  <m.div
                    className="absolute inset-0 rounded-xl border-2 border-atp-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  />
                </m.div>
              </m.div>
            ))}
          </m.div>
        )}

        {/* View More CTA */}
        {!loading && posts.length > 0 && (
          <m.div 
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <m.a
            href="https://www.instagram.com/atp_trading/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-medium rounded-full shadow-lg",
                isRTL && "flex-row-reverse"
              )}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
              transition={transitions.springBouncy}
            >
              <Instagram className="w-5 h-5" />
              <span className={isRTL ? "font-arabic" : ""}>
                {t("viewMore")}
              </span>
            </m.a>
          </m.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPost && (
          <m.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <m.div
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              variants={overlayVariants}
              onClick={closeLightbox}
            />
            
            {/* Modal Content */}
            <m.div
              className="relative z-10 max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
              variants={modalVariants}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation Arrows */}
              {posts.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox(isRTL ? 'next' : 'prev')}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors",
                      isRTL ? "right-4" : "left-4"
                    )}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateLightbox(isRTL ? 'prev' : 'next')}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors",
                      isRTL ? "left-4" : "right-4"
                    )}
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image - handle empty demo URLs */}
              <div className="relative flex-1 min-h-[300px] md:min-h-[500px] bg-black">
                {selectedPost.media_type === 'VIDEO' && selectedPost.media_url ? (
                  <video
                    src={selectedPost.media_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    poster={selectedPost.thumbnail_url}
                  />
                ) : selectedPost.media_url ? (
                  <Image
                    src={selectedPost.media_url}
                    alt={selectedPost.caption?.slice(0, 100) || 'Instagram post'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  /* CSS placeholder for demo mode */
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-400/30 flex flex-col items-center justify-center gap-4">
                    <Instagram className="w-20 h-20 text-white/50" />
                    <p className="text-white/70 text-sm">{t("demoPostPreview")}</p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className={cn(
                "w-full md:w-80 p-6 bg-white overflow-y-auto",
                isRTL && "text-right"
              )}>
                <div className={cn(
                  "flex items-center gap-3 mb-4 pb-4 border-b",
                  isRTL && "flex-row-reverse"
                )}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">atpgroupservices</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedPost.timestamp).toLocaleDateString(
                        isRTL ? 'ar-AE' : 'en-AE',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>
                
                {selectedPost.caption && (
                  <p className={cn(
                    "text-sm leading-relaxed text-atp-charcoal whitespace-pre-line",
                    isRTL && "font-arabic"
                  )}>
                    {selectedPost.caption}
                  </p>
                )}

                <m.a
                  href={selectedPost.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 mt-6 text-sm font-medium text-atp-gold hover:text-atp-gold/80",
                    isRTL && "flex-row-reverse"
                  )}
                  whileHover={{ x: isRTL ? -3 : 3 }}
                >
                  <span>{t("viewOnInstagram")}</span>
                  <ExternalLink className="w-4 h-4" />
                </m.a>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}

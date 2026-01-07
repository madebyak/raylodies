"use client";

import { useEffect, useRef, useCallback } from "react";

// Trail images from public folder
const TRAIL_IMAGES = [
  "/image-trail/u9655297567_httpss_mj_runvPhqtbVPlcQ_Herms_brand_campaign_with_aa9d663f.png",
  "/image-trail/u9655297567_httpss_mj_run1hCnWd9hoqY_Elegant_Asian_woman_wearin.png",
  "/image-trail/raylodies_product_photography_featuring_a_perfume_bottle_cent_1a85b9da.png",
  "/image-trail/raylodies_overhead_high_resolution_close_up_photo_of_a_woman_7f20b067.png",
  "/image-trail/raylodies_natureza_snica_SONIC_NATURE_the_world_where_everyth_c61a943f.png",
  "/image-trail/raylodies_low_angle_shot_of_a_realistic_slavic_nordic_teen_in_74b771fd.png",
  "/image-trail/raylodies_httpss_mj_runxqjVr_IWi0Y_low_motion_flower_opens_up_8ea474d7.png",
  "/image-trail/raylodies_httpss_mj_runCh98fGGLjWM_Fashion_campaign_style_reali.png",
  "/image-trail/raylodies_httpss_mj_run1LBawx9wUso_high_fashion_brunette_fema_6ff432c7.png",
  "/image-trail/raylodies_Full_body_high_fashion_editorial_photo_of_a_stunnin_1a591f2f.png",
  "/image-trail/raylodies_an_arabian_woman_wearing_a_black_sheer_dress_her_ha_87e299d8.png",
  "/image-trail/raylodies_A_woman_wearing_an_off_white_canvas_bucket_hat_in_t_67f7b468.png",
  "/image-trail/openart-image_jt6A0vFa_1763379712686_raw.jpg",
];

// Configuration
const CONFIG = {
  // Sizing
  baseImageSize: 220,
  minImageSize: 160,
  maxImageSize: 320,

  // Timing
  imageLifespan: 700,
  inDuration: 550,
  outDuration: 850,

  // Easing
  inEasing: "cubic-bezier(0.07, 0.5, 0.5, 1)",
  outEasing: "cubic-bezier(0.87, 0, 0.13, 1)",

  // Thresholds
  mouseThreshold: 45,
  minMovementForImage: 5,
  removalDelay: 20,

  // Rotation
  baseRotation: 28,
  maxRotationFactor: 2.5,

  // Speed
  speedSmoothingFactor: 0.25,

  // Mobile
  touchImageInterval: 50,
  mobileImageSize: 180,
  mobileMinSize: 120,
  mobileMaxSize: 240,
};

interface TrailImage {
  element: HTMLImageElement;
  rotation: number;
  removeTime: number;
}

export default function ImageTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<TrailImage[]>([]);
  const imageIndexRef = useRef(0);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const isMovingRef = useRef(false);
  const isTouchingRef = useRef(false);
  const lastMoveTimeRef = useRef(Date.now());
  const lastRemovalTimeRef = useRef(0);
  const lastTouchImageTimeRef = useRef(0);
  const smoothedSpeedRef = useRef(0);
  const maxSpeedRef = useRef(0);
  const isMobileRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if cursor is in container
  const isInContainer = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return false;
    const rect = container.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }, []);

  // Check if mouse has moved enough to spawn new image
  const hasMovedEnough = useCallback(() => {
    const dx = mouseRef.current.x - lastMouseRef.current.x;
    const dy = mouseRef.current.y - lastMouseRef.current.y;
    return Math.hypot(dx, dy) > CONFIG.mouseThreshold;
  }, []);

  // Check for micro-movement
  const hasMovedAtAll = useCallback(() => {
    const dx = mouseRef.current.x - prevMouseRef.current.x;
    const dy = mouseRef.current.y - prevMouseRef.current.y;
    return Math.hypot(dx, dy) > CONFIG.minMovementForImage;
  }, []);

  // Calculate speed for dynamic sizing
  const calculateSpeed = useCallback(() => {
    const now = Date.now();
    const dt = now - lastMoveTimeRef.current;
    if (dt <= 0) return 0;

    const dist = Math.hypot(
      mouseRef.current.x - prevMouseRef.current.x,
      mouseRef.current.y - prevMouseRef.current.y,
    );
    const raw = dist / dt;

    if (raw > maxSpeedRef.current) maxSpeedRef.current = raw;

    const norm = Math.min(raw / (maxSpeedRef.current || 0.5), 1);
    smoothedSpeedRef.current =
      smoothedSpeedRef.current * (1 - CONFIG.speedSmoothingFactor) +
      norm * CONFIG.speedSmoothingFactor;

    lastMoveTimeRef.current = now;
    return smoothedSpeedRef.current;
  }, []);

  // Create a trail image
  const createImage = useCallback((speed: number = 0.5) => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = isMobileRef.current;
    const minSize = isMobile ? CONFIG.mobileMinSize : CONFIG.minImageSize;
    const maxSize = isMobile ? CONFIG.mobileMaxSize : CONFIG.maxImageSize;

    const imageSrc = TRAIL_IMAGES[imageIndexRef.current];
    imageIndexRef.current = (imageIndexRef.current + 1) % TRAIL_IMAGES.length;

    const size = minSize + (maxSize - minSize) * speed;
    const rotFactor = 1 + speed * (CONFIG.maxRotationFactor - 1);
    const rotation = (Math.random() - 0.5) * CONFIG.baseRotation * rotFactor;

    const img = document.createElement("img");
    img.className = "trail-img";
    img.src = imageSrc;
    img.alt = "";
    img.draggable = false;

    // Position relative to container
    const rect = container.getBoundingClientRect();
    const x = mouseRef.current.x - rect.left;
    const y = mouseRef.current.y - rect.top;

    img.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      object-fit: cover;
      border-radius: 4px;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%) rotate(${rotation}deg) scale(0);
      transform-origin: center;
      pointer-events: none;
      will-change: transform;
      z-index: 10;
      transition: transform ${CONFIG.inDuration}ms ${CONFIG.inEasing};
    `;

    container.appendChild(img);

    // Trigger entry animation
    requestAnimationFrame(() => {
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
    });

    trailRef.current.push({
      element: img,
      rotation,
      removeTime: Date.now() + CONFIG.imageLifespan,
    });
  }, []);

  // Create trail image on movement
  const createTrailImage = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const inContainer = isInContainer(mouseRef.current.x, mouseRef.current.y);
    if (!inContainer) return;

    if (
      (isMovingRef.current || isTouchingRef.current) &&
      hasMovedEnough() &&
      hasMovedAtAll()
    ) {
      lastMouseRef.current = { ...mouseRef.current };
      const speed = calculateSpeed();
      createImage(speed);
      prevMouseRef.current = { ...mouseRef.current };
    }
  }, [
    isInContainer,
    hasMovedEnough,
    hasMovedAtAll,
    calculateSpeed,
    createImage,
  ]);

  // Touch-specific trail creation
  const createTouchTrailImage = useCallback(() => {
    const inContainer = isInContainer(mouseRef.current.x, mouseRef.current.y);
    if (!inContainer || !isTouchingRef.current || !hasMovedAtAll()) return;

    const now = Date.now();
    if (now - lastTouchImageTimeRef.current < CONFIG.touchImageInterval) return;

    lastTouchImageTimeRef.current = now;
    const speed = calculateSpeed();
    createImage(speed);
    prevMouseRef.current = { ...mouseRef.current };
  }, [isInContainer, hasMovedAtAll, calculateSpeed, createImage]);

  // Remove old images
  const removeOldImages = useCallback(() => {
    const now = Date.now();
    const trail = trailRef.current;

    if (
      now - lastRemovalTimeRef.current < CONFIG.removalDelay ||
      trail.length === 0
    )
      return;

    if (now >= trail[0].removeTime) {
      const imgObj = trail.shift()!;
      const { element, rotation } = imgObj;

      element.style.transition = `transform ${CONFIG.outDuration}ms ${CONFIG.outEasing}`;
      element.style.transform = `translate(-50%, -50%) rotate(${rotation + 360}deg) scale(0)`;

      setTimeout(() => {
        element.remove();
      }, CONFIG.outDuration);

      lastRemovalTimeRef.current = now;
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (isMovingRef.current || isTouchingRef.current) {
      createTrailImage();
    }
    removeOldImages();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [createTrailImage, removeOldImages]);

  useEffect(() => {
    // Check for mobile
    isMobileRef.current =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (
        isInContainer(mouseRef.current.x, mouseRef.current.y) &&
        hasMovedAtAll()
      ) {
        isMovingRef.current = true;
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = setTimeout(() => {
          isMovingRef.current = false;
        }, 100);
      }
    };

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: touch.clientX, y: touch.clientY };
      lastMouseRef.current = { ...mouseRef.current };
      isTouchingRef.current = true;
      lastMoveTimeRef.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: touch.clientX, y: touch.clientY };
      createTouchTrailImage();
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
    };

    // Set initial mouse position
    const handleInitialMouseOver = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      lastMouseRef.current = { ...mouseRef.current };
      prevMouseRef.current = { ...mouseRef.current };
      document.removeEventListener("mouseover", handleInitialMouseOver);
    };

    // Add event listeners
    document.addEventListener("mouseover", handleInitialMouseOver);
    document.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Preload images
    TRAIL_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);

      // Clean up remaining images
      trailRef.current.forEach((imgObj) => imgObj.element.remove());
      trailRef.current = [];
    };
  }, [animate, createTouchTrailImage, hasMovedAtAll, isInContainer]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  );
}

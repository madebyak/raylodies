"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";

// Fullscreen triangle vertex shader
const vertexShader = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment shader - progressive Gaussian blur
const fragmentShader = `
  precision highp float;
  
  uniform sampler2D tMap;
  uniform vec2 uResolution;
  uniform float uBlurStrength;
  uniform float uBlurStart;
  uniform float uBlurEnd;
  
  varying vec2 vUv;
  
  vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture2D(image, uv) * 0.1964825501511404;
    color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
    color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
    return color;
  }
  
  void main() {
    // Calculate blur amount based on vertical position
    float blurFactor = smoothstep(uBlurStart, uBlurEnd, 1.0 - vUv.y);
    float blurAmount = blurFactor * uBlurStrength * 8.0;
    
    if (blurAmount < 0.1) {
      gl_FragColor = texture2D(tMap, vUv);
    } else {
      // Two-pass blur approximation in single pass
      vec4 blurH = blur13(tMap, vUv, uResolution, vec2(blurAmount, 0.0));
      vec4 blurV = blur13(tMap, vUv, uResolution, vec2(0.0, blurAmount));
      vec4 blurred = (blurH + blurV) * 0.5;
      
      vec4 original = texture2D(tMap, vUv);
      gl_FragColor = mix(original, blurred, blurFactor);
    }
  }
`;

interface ProgressiveBlurImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Blur strength (0-1), default 0.8 */
  blurStrength?: number;
  /** Y position where blur starts (0=top, 1=bottom), default 0.3 */
  blurStart?: number;
  /** Y position where blur reaches max (0=top, 1=bottom), default 0.9 */
  blurEnd?: number;
}

export default function ProgressiveBlurImage({
  src,
  alt,
  className = "",
  blurStrength = 0.8,
  blurStart = 0.3,
  blurEnd = 0.9,
}: ProgressiveBlurImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meshRef = useRef<Mesh | null>(null);
  const programRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Initialize renderer
    const renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    rendererRef.current = renderer;

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // Create texture from image
    const texture = new Texture(gl, {
      generateMipmaps: false,
    });

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      texture.image = image;
      setImageDimensions({ width: image.width, height: image.height });
      setIsLoaded(true);
    };
    image.onerror = () => {
      console.error("Failed to load image:", src);
    };
    image.src = src;

    // Create fullscreen triangle geometry (more efficient than quad)
    const geometry = new Triangle(gl);

    // Create program with shaders
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        tMap: { value: texture },
        uResolution: { value: [canvas.width || 1, canvas.height || 1] },
        uBlurStrength: { value: blurStrength },
        uBlurStart: { value: blurStart },
        uBlurEnd: { value: blurEnd },
      },
    });
    programRef.current = program;

    // Create mesh
    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    // Resize handler
    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        renderer.setSize(rect.width, rect.height);
        if (program.uniforms.uResolution) {
          program.uniforms.uResolution.value = [rect.width * renderer.dpr, rect.height * renderer.dpr];
        }
      }
    };

    // Initial resize
    resize();

    // Observe container size changes
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Render loop
    let animationId: number;
    let isActive = true;
    
    const render = () => {
      if (!isActive) return;
      
      // Direct mesh render without scene graph
      mesh.program.use();
      mesh.geometry.draw({ mode: gl.TRIANGLES, program: mesh.program });
      
      animationId = requestAnimationFrame(render);
    };
    render();

    // Cleanup
    return () => {
      isActive = false;
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      
      // Clean up WebGL resources
      try {
        const loseContext = renderer.gl.getExtension("WEBGL_lose_context");
        if (loseContext) {
          loseContext.loseContext();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [src, blurStrength, blurStart, blurEnd]);

  // Update uniforms when props change
  useEffect(() => {
    if (programRef.current) {
      programRef.current.uniforms.uBlurStrength.value = blurStrength;
      programRef.current.uniforms.uBlurStart.value = blurStart;
      programRef.current.uniforms.uBlurEnd.value = blurEnd;
    }
  }, [blurStrength, blurStart, blurEnd]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: imageDimensions.width && imageDimensions.height 
          ? `${imageDimensions.width} / ${imageDimensions.height}` 
          : "3 / 4",
      }}
    >
      {/* Fallback image for SSR and while loading */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
      
      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        aria-label={alt}
      />
    </div>
  );
}

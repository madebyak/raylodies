"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Plane, Texture } from "ogl";

// Vertex shader - simple pass-through
const vertexShader = `
  attribute vec2 uv;
  attribute vec3 position;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader - progressive Gaussian blur
const fragmentShader = `
  precision highp float;
  
  uniform sampler2D tMap;
  uniform vec2 uResolution;
  uniform float uBlurStrength;
  uniform float uBlurStart;  // Y position where blur starts (0-1)
  uniform float uBlurEnd;    // Y position where blur is max (0-1)
  
  varying vec2 vUv;
  
  // Gaussian blur weights for 9 samples
  const float weights[9] = float[](
    0.0162162162, 0.0540540541, 0.1216216216, 0.1945945946,
    0.2270270270,
    0.1945945946, 0.1216216216, 0.0540540541, 0.0162162162
  );
  
  const float offsets[9] = float[](
    -4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0
  );
  
  vec4 blur(sampler2D tex, vec2 uv, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 texelSize = 1.0 / uResolution;
    
    for (int i = 0; i < 9; i++) {
      vec2 offset = direction * offsets[i] * texelSize;
      color += texture2D(tex, uv + offset) * weights[i];
    }
    
    return color;
  }
  
  void main() {
    // Calculate blur amount based on vertical position
    // Blur increases from uBlurStart to uBlurEnd
    float blurFactor = smoothstep(uBlurStart, uBlurEnd, 1.0 - vUv.y);
    float blurAmount = blurFactor * uBlurStrength;
    
    if (blurAmount < 0.01) {
      // No blur needed, just sample the texture
      gl_FragColor = texture2D(tMap, vUv);
    } else {
      // Apply progressive blur
      vec4 blurH = blur(tMap, vUv, vec2(blurAmount, 0.0));
      vec4 blurV = blur(tMap, vUv, vec2(0.0, blurAmount));
      vec4 blurred = (blurH + blurV) * 0.5;
      
      // Mix original with blurred based on blur factor
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
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<Program | null>(null);
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

    // Create texture from image
    const texture = new Texture(gl);

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      texture.image = image;
      setImageDimensions({ width: image.width, height: image.height });
      setIsLoaded(true);
    };
    image.src = src;

    // Create geometry
    const geometry = new Plane(gl);

    // Create program with shaders
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        tMap: { value: texture },
        uResolution: { value: [canvas.width, canvas.height] },
        uBlurStrength: { value: blurStrength },
        uBlurStart: { value: blurStart },
        uBlurEnd: { value: blurEnd },
      },
    });
    programRef.current = program;

    // Create mesh
    const mesh = new Mesh(gl, { geometry, program });

    // Resize handler
    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      
      if (program.uniforms.uResolution) {
        program.uniforms.uResolution.value = [rect.width, rect.height];
      }
    };

    // Initial resize
    resize();

    // Observe container size changes
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Render loop
    let animationId: number;
    const render = () => {
      renderer.render({ scene: mesh });
      animationId = requestAnimationFrame(render);
    };
    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
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
      {!isLoaded && (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(0px)" }}
        />
      )}
      
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


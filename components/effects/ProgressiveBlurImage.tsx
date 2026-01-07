"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Vertex shader - fullscreen triangle
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  varying vec2 v_texCoord;
  
  void main() {
    v_texCoord = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Fragment shader with progressive Gaussian blur
const fragmentShaderSource = `
  precision highp float;
  
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform float u_blurStrength;
  uniform float u_blurStart;
  uniform float u_blurEnd;
  
  varying vec2 v_texCoord;
  
  // Optimized 13-tap Gaussian blur
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
    // Progressive blur: increases from uBlurStart to uBlurEnd (top to bottom)
    float blurFactor = smoothstep(u_blurStart, u_blurEnd, 1.0 - v_texCoord.y);
    float blurAmount = blurFactor * u_blurStrength * 8.0;
    
    if (blurAmount < 0.1) {
      gl_FragColor = texture2D(u_image, v_texCoord);
    } else {
      // Two-pass blur approximation
      vec4 blurH = blur13(u_image, v_texCoord, u_resolution, vec2(blurAmount, 0.0));
      vec4 blurV = blur13(u_image, v_texCoord, u_resolution, vec2(0.0, blurAmount));
      vec4 blurred = (blurH + blurV) * 0.5;
      
      vec4 original = texture2D(u_image, v_texCoord);
      gl_FragColor = mix(original, blurred, blurFactor);
    }
  }
`;

interface ProgressiveBlurImageProps {
  src: string;
  alt: string;
  className?: string;
  blurStrength?: number;
  blurStart?: number;
  blurEnd?: number;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
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
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    resolution: WebGLUniformLocation | null;
    blurStrength: WebGLUniformLocation | null;
    blurStart: WebGLUniformLocation | null;
    blurEnd: WebGLUniformLocation | null;
  } | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const uniforms = uniformsRef.current;
    
    if (!gl || !program || !uniforms) return;
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Get WebGL context
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    
    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
      console.error("Failed to create shaders");
      return;
    }

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error("Failed to create program");
      return;
    }
    
    programRef.current = program;
    gl.useProgram(program);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    
    const uniforms = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      blurStrength: gl.getUniformLocation(program, "u_blurStrength"),
      blurStart: gl.getUniformLocation(program, "u_blurStart"),
      blurEnd: gl.getUniformLocation(program, "u_blurEnd"),
    };
    uniformsRef.current = uniforms;

    // Create position buffer (fullscreen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Create texture coordinate buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Load image
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      setImageDimensions({ width: image.width, height: image.height });
      setIsLoaded(true);
    };
    
    image.onerror = () => {
      console.error("Failed to load image:", src);
    };
    
    image.src = src;

    // Set initial uniforms
    gl.uniform1f(uniforms.blurStrength, blurStrength);
    gl.uniform1f(uniforms.blurStart, blurStart);
    gl.uniform1f(uniforms.blurEnd, blurEnd);

    // Resize handler
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
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
    
    const renderLoop = () => {
      if (!isActive) return;
      render();
      animationId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // Cleanup
    return () => {
      isActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      resizeObserver.disconnect();
      
      // Clean up WebGL resources
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteTexture(texture);
      
      const loseContext = gl.getExtension("WEBGL_lose_context");
      if (loseContext) {
        loseContext.loseContext();
      }
    };
  }, [src, blurStrength, blurStart, blurEnd, render]);

  // Update uniforms when props change
  useEffect(() => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    
    if (gl && uniforms) {
      gl.uniform1f(uniforms.blurStrength, blurStrength);
      gl.uniform1f(uniforms.blurStart, blurStart);
      gl.uniform1f(uniforms.blurEnd, blurEnd);
    }
  }, [blurStrength, blurStart, blurEnd]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio:
          imageDimensions.width && imageDimensions.height
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

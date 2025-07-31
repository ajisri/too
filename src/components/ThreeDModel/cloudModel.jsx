"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion for cloud-like patterns
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < 6; i++) {
      value += amplitude * snoise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // Smooth step function for anime-style shading
  float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  }

  void main() {
    vec2 st = vUv;
    float time = uTime * 0.1;
    
    // Create flowing cloud patterns
    vec2 cloudPos1 = st * 3.0 + vec2(time * 0.3, time * 0.1);
    vec2 cloudPos2 = st * 2.0 + vec2(-time * 0.2, time * 0.15);
    vec2 cloudPos3 = st * 4.0 + vec2(time * 0.1, -time * 0.05);
    
    // Generate multiple cloud layers
    float cloud1 = fbm(cloudPos1);
    float cloud2 = fbm(cloudPos2);
    float cloud3 = fbm(cloudPos3);
    
    // Combine clouds with different weights
    float clouds = cloud1 * 0.5 + cloud2 * 0.3 + cloud3 * 0.2;
    
    // Add some vertical gradient for depth
    float gradient = smoothstep(0.0, 1.0, 1.0 - st.y * 0.7);
    clouds += gradient * 0.3;
    
    // Create anime-style cloud shapes with smooth transitions
    float cloudMask = smootherstep(0.1, 0.6, clouds);
    
    // Anime-style golden color palette
    vec3 skyColor = vec3(0.95, 0.8, 0.4);      // Light golden yellow
    vec3 cloudColor = vec3(1.0, 0.9, 0.6);     // Warm cream
    vec3 cloudShadow = vec3(0.8, 0.6, 0.3);    // Deeper golden
    vec3 cloudHighlight = vec3(1.0, 0.95, 0.8); // Bright highlight
    
    // Create depth with multiple cloud layers
    float cloudDepth = smootherstep(0.3, 0.8, clouds);
    float cloudHighlights = smootherstep(0.6, 0.9, clouds);
    
    // Mix colors based on cloud density
    vec3 finalColor = mix(skyColor, cloudColor, cloudMask);
    finalColor = mix(finalColor, cloudShadow, cloudDepth * 0.4);
    finalColor = mix(finalColor, cloudHighlight, cloudHighlights * 0.6);
    
    // Add some subtle color variation
    float colorVariation = snoise(st * 8.0 + time) * 0.1;
    finalColor += colorVariation * vec3(0.1, 0.05, 0.0);
    
    // Anime-style soft shading
    finalColor = pow(finalColor, vec3(0.9)); // Slight gamma correction for softer look
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function Component() {
  return (
    <div className="w-full h-screen bg-amber-50">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <AnimeCloudPlane />
      </Canvas>
    </div>
  );
}

function AnimeCloudPlane() {
  const mesh = useRef();
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(size.width, size.height) },
    }),
    [size]
  );

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  // Fix: Use a larger scale so the cloud plane covers the viewport
  // Use a fixed large value or scale based on window size
  return (
    <mesh ref={mesh} scale={[size.width / 40, size.height / 40, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

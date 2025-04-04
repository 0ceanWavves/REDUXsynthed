/**
 * MorphingShaders.js
 * Contains all shader code for the morphing prism effect with wireframe
 */

// Vertex shader with support for morphing and barycentric coordinates
export const vertexShader = `
  // Attributes forwarded from THREE.js
  attribute vec3 a_barycentric; // Our custom attribute

  // Varyings sent to Fragment Shader
  varying vec3 vBarycentric;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  // Removed problematic varying
  // varying float vMorphEffect;

  // Uniforms
  uniform float uTime;

  // Include standard THREE.js chunks (Order Matters!)
  #include <common>
  #include <uv_pars_vertex>
  #include <displacementmap_pars_vertex>
  #include <morphtarget_pars_vertex> // For morph targets
  #include <skinning_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  #include <clipping_planes_pars_vertex>

  void main() {
      vBarycentric = a_barycentric; // Pass barycentric coords

      // --- Start Standard Calculations ---
      // Calculate the base normal (before morphing)
      #include <beginnormal_vertex>
      #include <morphnormal_vertex>
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      #include <defaultnormal_vertex>

      // Calculate the base position (before morphing/skinning)
      #include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <displacementmap_vertex>
      #include <project_vertex>

      // Handle depth buffer and clipping
      #include <logdepthbuf_vertex>
      #include <clipping_planes_vertex>

      // --- Pass required data to Fragment Shader ---
      // Use transformedNormal which is already calculated by THREE.js
      vNormal = normalize(transformedNormal);

      // Use transformed position after morphing for world position
      vec4 worldPosition_ = modelMatrix * vec4(transformed, 1.0);
      vWorldPosition = worldPosition_.xyz;

      // UV calculations if needed
      #include <uv_vertex>
  }
`;

// Fragment shader with wireframe effect based on barycentric coordinates
// REMOVE problematic extension directive at the beginning and handle it through the extensions object
export const fragmentShader = `
// Varyings received from Vertex Shader
varying vec3 vBarycentric;
varying vec3 vNormal;
varying vec3 vWorldPosition;

// Uniforms
uniform float uTime;
uniform vec3 uColor1; // Primary face color
uniform vec3 uColor2; // Secondary face color
uniform vec3 uWireframeColor;
uniform float uWireframeThickness;
uniform float uFaceOpacity;
uniform float uMorphInfluence;

// Simple noise function for MetaMask compatibility
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
}

// Edge factor calculation that doesn't rely on derivatives for better compatibility
float safeEdgeFactor(vec3 bary, float thickness) {
    // Manual calculation that's more compatible with restricted environments
    vec3 factors = step(vec3(thickness * 0.02), bary);
    float minFactor = min(min(factors.x, factors.y), factors.z);
    return 1.0 - minFactor;
}

void main() {
    // Calculate edge factor with fallback for environments without derivative support
    float edge = 0.0;
    
    // Always use the safe edge factor calculation - more reliable across platforms
    edge = safeEdgeFactor(vBarycentric, uWireframeThickness);

    // Calculate base colors - simplified for better compatibility
    float normalMix = smoothstep(-0.5, 0.8, vNormal.y);
    float timeMix = sin(uTime * 0.5) * 0.5 + 0.5;
    vec3 mixedColor = mix(uColor1, uColor2, normalMix * 0.6 + timeMix * 0.4);
    
    // Add a bit of noise
    float n = noise(vWorldPosition + uTime * 0.1);
    mixedColor = mix(mixedColor * 0.8, mixedColor * 1.2, n);
    
    // Mix with the wireframe
    vec3 finalColor = mix(mixedColor, uWireframeColor, edge);
    
    // Calculate opacity
    float finalOpacity = mix(uFaceOpacity, 1.0, edge);
    
    // Simple fresnel effect for depth
    float viewDot = abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
    finalOpacity *= mix(1.0, 0.5, pow(1.0 - viewDot, 2.0) * (1.0 - edge));
    
    // Final color with pre-multiplied alpha for better blending
    gl_FragColor = vec4(finalColor * finalOpacity, finalOpacity);
}`;

/**
 * Creates a shader material for the morphing effect
 * @param {Object} THREE - The Three.js library instance
 * @param {Object} options - Material options including colors
 * @returns {THREE.ShaderMaterial} The created shader material
 */
export function createMorphingShaderMaterial(THREE, options) {
  const { colors, isMobile, wireframeThickness, faceOpacity } = options;
  
  try {
    // Check if THREE.ShaderMaterial exists
    if (!THREE.ShaderMaterial) {
      console.error("THREE.ShaderMaterial is not available - using fallback material");
      return new THREE.MeshPhongMaterial({
        color: colors.shape1,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
        shininess: 100
      });
    }
    
    // Create minimal shader material for better compatibility
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uColor1: { value: new THREE.Color(colors.shape1 || 0x6633cc) },
        uColor2: { value: new THREE.Color(colors.shape2 || 0x3366cc) },
        uWireframeColor: { value: new THREE.Color(colors.wireframe || 0xffffff) },
        uWireframeThickness: { value: wireframeThickness || (isMobile ? 0.018 : 0.012) },
        uFaceOpacity: { value: faceOpacity || 0.65 },
        uMorphInfluence: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      // Put morphTargets in userData to avoid warnings
      userData: {
        morphTargets: true,
        morphNormals: true
      },
      extensions: {
        derivatives: true,
        fragDepth: false,
        drawBuffers: false,
        shaderTextureLOD: false
      }
    });
    
    // Apply global fixes if available (from our MetaMask fix script)
    if (window.__fixShaderExtensions) {
      material.fragmentShader = window.__fixShaderExtensions(material.fragmentShader);
    }
    
    return material;
  } catch (err) {
    console.error("Failed to create shader material:", err);
    
    // Return a basic fallback material
    return new THREE.MeshBasicMaterial({
      color: colors.shape1,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
  }
}

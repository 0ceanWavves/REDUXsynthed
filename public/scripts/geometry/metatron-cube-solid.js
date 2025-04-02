/**
 * Solid Metatron's Cube Geometry Module
 * 
 * This module provides a solid, squishy version of the Metatron's Cube
 * with full surfaces instead of wireframes.
 */

/**
 * Creates a solid, squishy Metatron's Cube geometry
 * @param {Object} THREE - The Three.js instance
 * @param {Object} options - Configuration options
 * @returns {Object} The solid Metatron's Cube object with animations
 */
export function createSolidMetatronCube(THREE, options = {}) {
  // Default options
  const config = {
    size: options.size || 2,
    cubeColor: options.cubeColor || 0x06b6d4, // Cyan color
    edgeColor: options.edgeColor || 0x00e5ff, // Bright cyan for edges
    edgeGlow: options.edgeGlow !== undefined ? options.edgeGlow : true,
    rotationSpeed: options.rotationSpeed || 0.002, // Slower rotation
    sphereColor: options.sphereColor || 0x4169e1, // Royal blue for spheres
    sphereSize: options.sphereSize || 0.15,
    morphSpeed: options.morphSpeed || 0.002, // Very slow morphing
    facetedSurface: options.facetedSurface !== undefined ? options.facetedSurface : true,
    shaderType: options.shaderType || 'solid'
  };

  // Create container for all elements
  const container = new THREE.Group();
  
  // Add main solid cube with glowing edges
  const { mesh: solidCube, animate: animateCube } = createSolidCube(THREE, config);
  container.add(solidCube);
  
  // Add spheres at vertices if needed
  if (config.sphereSize > 0) {
    const spheres = createVertexSpheres(THREE, config);
    spheres.forEach(sphere => container.add(sphere));
  }
  
  // Animation function
  const animate = () => {
    // Slow rotation of the entire structure
    container.rotation.x += config.rotationSpeed;
    container.rotation.y += config.rotationSpeed * 0.8;
    
    // Run cube animation (morphing, if any)
    animateCube();
  };
  
  return {
    object: container,
    animate: animate
  };
}

/**
 * Create a solid cube with glowing edges
 * @param {Object} THREE - The Three.js instance
 * @param {Object} config - Configuration options
 * @returns {Object} The solid cube mesh with animation function
 */
function createSolidCube(THREE, config) {
  // Create appropriate geometry based on configuration
  const geometry = config.facetedSurface ? 
    new THREE.DodecahedronGeometry(config.size * 0.7, 0) : 
    new THREE.BoxGeometry(config.size, config.size, config.size);
  
  // Create material based on shader type
  let material;
  
  switch (config.shaderType) {
    case 'glow':
      // Custom shader material with glowing edges
      material = createGlowingEdgeMaterial(THREE, config);
      break;
    
    case 'gradient':
      // Gradient material
      material = new THREE.MeshPhongMaterial({
        color: config.cubeColor,
        specular: 0x111111,
        shininess: 30,
        flatShading: true,
        transparent: true,
        opacity: 0.9
      });
      break;
      
    case 'solid':
    default:
      // Simple phong material with soft shading
      material = new THREE.MeshPhongMaterial({ 
        color: config.cubeColor,
        specular: 0xaaaaaa,
        shininess: 50,
        transparent: true,
        opacity: 0.9
      });
      break;
  }
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  
  // Add edge highlighting if requested
  if (config.edgeGlow) {
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: config.edgeColor,
      transparent: true,
      opacity: 0.8
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(wireframe);
  }
  
  // Setup morphing if needed
  let morphTarget = null;
  if (config.facetedSurface) {
    // Create a target geometry for subtle morphing
    morphTarget = new THREE.IcosahedronGeometry(config.size * 0.72, 0);
    geometry.morphAttributes = { position: [] };
    geometry.morphAttributes.position.push(morphTarget.attributes.position);
    mesh.morphTargetInfluences = [0];
  }
  
  // Animation state
  let morphValue = 0;
  let morphDirection = 1;
  
  // Animation function
  const animate = () => {
    // Skip if no morph target
    if (!morphTarget) return;
    
    // Very slow morphing for subtle "breathing" effect
    if (morphDirection > 0) {
      morphValue += config.morphSpeed;
      if (morphValue >= 1) {
        morphValue = 1;
        morphDirection = -1;
      }
    } else {
      morphValue -= config.morphSpeed;
      if (morphValue <= 0) {
        morphValue = 0;
        morphDirection = 1;
      }
    }
    
    // Apply morph value
    mesh.morphTargetInfluences[0] = morphValue;
  };
  
  return { mesh, animate };
}

/**
 * Create a custom material with glowing edges
 * @param {Object} THREE - The Three.js instance
 * @param {Object} config - Configuration options
 * @returns {Object} Custom shader material
 */
function createGlowingEdgeMaterial(THREE, config) {
  // Define custom shaders for glowing edges
  const vertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const fragmentShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    uniform vec3 cubeColor;
    uniform vec3 edgeColor;
    uniform float edgeWidth;
    
    void main() {
      // Calculate distance to nearest edge
      float edgeFactor = min(
        min(abs(vPosition.x), abs(vPosition.y)),
        abs(vPosition.z)
      );
      
      // Apply edge glow
      float glowFactor = smoothstep(0.0, edgeWidth, edgeFactor);
      vec3 finalColor = mix(edgeColor, cubeColor, glowFactor);
      
      // Add some lighting
      float lightFactor = max(0.3, dot(vNormal, vec3(1.0, 1.0, 1.0)));
      
      gl_FragColor = vec4(finalColor * lightFactor, 0.9);
    }
  `;
  
  return new THREE.ShaderMaterial({
    uniforms: {
      cubeColor: { value: new THREE.Color(config.cubeColor) },
      edgeColor: { value: new THREE.Color(config.edgeColor) },
      edgeWidth: { value: 0.1 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true
  });
}

/**
 * Create spheres at the vertices of the cube
 * @param {Object} THREE - The Three.js instance
 * @param {Object} config - Configuration options
 * @returns {Array} Array of sphere meshes
 */
function createVertexSpheres(THREE, config) {
  const halfSize = config.size / 2;
  
  // Define cube vertex positions
  const vertices = [
    { x: -halfSize, y: -halfSize, z: halfSize },  // Front bottom left
    { x: halfSize, y: -halfSize, z: halfSize },   // Front bottom right
    { x: halfSize, y: halfSize, z: halfSize },    // Front top right
    { x: -halfSize, y: halfSize, z: halfSize },   // Front top left
    { x: -halfSize, y: -halfSize, z: -halfSize }, // Back bottom left
    { x: halfSize, y: -halfSize, z: -halfSize },  // Back bottom right
    { x: halfSize, y: halfSize, z: -halfSize },   // Back top right
    { x: -halfSize, y: halfSize, z: -halfSize }   // Back top left
  ];
  
  // Create spheres
  return vertices.map(pos => {
    const geometry = new THREE.SphereGeometry(config.sphereSize, 16, 16);
    const material = new THREE.MeshPhongMaterial({ 
      color: config.sphereColor,
      specular: 0xffffff,
      shininess: 100
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(pos.x, pos.y, pos.z);
    return sphere;
  });
}

export default createSolidMetatronCube;

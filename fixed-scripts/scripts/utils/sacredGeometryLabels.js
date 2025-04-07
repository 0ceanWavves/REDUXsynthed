/**
 * Sacred Geometry Labels
 * Associates each shape with its corresponding element in sacred geometry tradition
 */

export const SHAPE_ELEMENT_MAPPINGS = {
  'Tetrahedron': 'Fire',
  'Cube': 'Earth',
  'Octahedron': 'Air',
  'Icosahedron': 'Water',
  'Dodecahedron': 'Spirit'
};

/**
 * Retrieves the element name associated with a given shape.
 * @param {string} shapeName - The name of the shape.
 * @returns {string} The element name or empty string if not found.
 */
export function getElementForShape(shapeName) {
  return SHAPE_ELEMENT_MAPPINGS[shapeName] || '';
}

/**
 * Retrieves the full sacred geometry title for a shape (e.g., "Tetrahedron / Fire").
 * @param {string} shapeName - The name of the shape.
 * @returns {string} The formatted title combining shape and element.
 */
export function getSacredGeometryTitle(shapeName) {
  const element = getElementForShape(shapeName);
  return element ? `${shapeName} / ${element}` : shapeName;
}

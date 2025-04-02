// This is a shim for the virtual:astro-icon module that causes build errors
// It provides placeholder functions that will be replaced with the real ones at runtime

export function createResolver() {
  return {
    resolve: (name) => name,
    spritesheet: () => ({ symbols: [] }),
    load: async () => null
  };
}

export const resolver = createResolver();

// Add config export that Icon.astro needs
export const config = {
  mode: 'inline',
  spriteSheetPath: '/assets/icons.svg',
  iconDir: 'src/icons',
  include: {
    'fa-brands': ['*'],
    'mdi': ['*']
  }
};

export default {
  createResolver,
  resolver,
  config
}; 
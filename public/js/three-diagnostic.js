/**
 * Three.js Diagnostics Tool
 * 
 * This script provides diagnostic information about Three.js instances
 * in the console. Load this script after your application is initialized
 * to see detailed information about Three.js usage.
 */
 
(function() {
  console.log("📊 THREE.js Diagnostics: Analyzing Three.js usage...");
  
  // Collect information about Three.js
  const info = {
    hasGlobalThree: typeof window.THREE !== 'undefined',
    instanceCount: 0,
    mainVersion: null,
    instances: [],
    importMapFound: false,
    importMapVersion: null,
    importMapUrl: null,
  };
  
  // Check for global THREE instance
  if (info.hasGlobalThree) {
    info.mainVersion = window.THREE.REVISION;
    info.instanceCount++;
    info.instances.push({
      reference: "window.THREE",
      version: window.THREE.REVISION,
      source: "global",
      properties: Object.getOwnPropertyNames(window.THREE).length
    });
  }
  
  // Check for version guard
  info.hasVersionGuard = typeof window.getThreeJS === 'function';
  if (info.hasVersionGuard) {
    const guardInstance = window.getThreeJS();
    if (guardInstance) {
      info.instances.push({
        reference: "window.getThreeJS()",
        version: guardInstance.REVISION,
        source: "version guard",
        properties: Object.getOwnPropertyNames(guardInstance).length
      });
      
      if (!info.mainVersion) {
        info.mainVersion = guardInstance.REVISION;
      }
      
      // Check if they're the same instance
      if (guardInstance !== window.THREE) {
        info.instanceCount++;
      }
    }
  }
  
  // Check for import map
  const importMapScript = document.querySelector('script[type="importmap"]');
  if (importMapScript) {
    info.importMapFound = true;
    try {
      const importMap = JSON.parse(importMapScript.textContent);
      if (importMap.imports && importMap.imports.three) {
        info.importMapUrl = importMap.imports.three;
        // Extract version from URL if possible
        const versionMatch = info.importMapUrl.match(/three@([\d.]+)/);
        if (versionMatch) {
          info.importMapVersion = versionMatch[1];
        }
      }
    } catch (e) {
      console.error("Error parsing import map:", e);
    }
  }
  
  // Helper function to make a nice console output
  function makeColoredBadge(text, bgColor) {
    return `%c ${text} %c`;
  }
  
  // Display the information in a nice format
  console.group("📊 THREE.js Diagnostic Report");
  
  if (info.hasGlobalThree) {
    console.log(`%c THREE.js Detected %c Main version: ${info.mainVersion}`, 
      "background:#4CAF50;color:white;padding:3px;border-radius:3px;", 
      "color:#333;font-weight:bold;");
  } else {
    console.log(`%c No THREE.js %c No global THREE instance detected`, 
      "background:#F44336;color:white;padding:3px;border-radius:3px;", 
      "color:#333;");
  }
  
  console.log(`Total detected instances: ${info.instanceCount}`);
  
  // Version guard status
  if (info.hasVersionGuard) {
    console.log(`%c Version Guard %c Active and working`, 
      "background:#2196F3;color:white;padding:3px;border-radius:3px;", 
      "color:#333;");
  } else {
    console.log(`%c No Version Guard %c Not detected or not working`, 
      "background:#FF9800;color:white;padding:3px;border-radius:3px;", 
      "color:#333;");
  }
  
  // Import map status
  if (info.importMapFound) {
    console.log(`%c Import Map %c Version: ${info.importMapVersion || 'unknown'} | URL: ${info.importMapUrl}`, 
      "background:#9C27B0;color:white;padding:3px;border-radius:3px;", 
      "color:#333;");
  } else {
    console.log(`%c No Import Map %c No importmap found for THREE.js`, 
      "background:#FF9800;color:white;padding:3px;border-radius:3px;", 
      "color:#333;");
  }
  
  // Instance details
  console.groupCollapsed("Instance Details");
  info.instances.forEach(instance => {
    console.log(`${instance.reference}: v${instance.version} (${instance.properties} properties) - Source: ${instance.source}`);
  });
  console.groupEnd();
  
  // Add a helper method to window for checking Three.js status
  window.checkThreeJS = function() {
    console.log(`%c THREE.js Status %c Version: ${window.THREE?.REVISION || 'not loaded'}`, 
      "background:#4CAF50;color:white;padding:3px;border-radius:3px;", 
      "color:#333;font-weight:bold;");
    return window.THREE;
  };
  
  console.groupEnd();
})();
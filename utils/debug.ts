/**
 * Utility function to log the structure of an object
 * This helps identify the correct property paths for data access
 */
export function logObjectStructure(obj: any, label: string = 'Object Structure'): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(label);
    
    if (!obj) {
      console.log('Object is null or undefined');
      console.groupEnd();
      return;
    }
    
    // Log the first level of properties
    const properties = Object.keys(obj);
    console.log('Properties:', properties);
    
    // Log the types of each property
    properties.forEach(prop => {
      const value = obj[prop];
      
      // Extract type determination to avoid nested ternary
      let type: string;
      if (value === null) {
        type = 'null';
      } else if (Array.isArray(value)) {
        type = `array[${value.length}]`;
      } else {
        type = typeof value;
      }
      
      console.log(`${prop}: ${type}`);
      
      // For nested objects, show a preview
      if (type === 'object' && value !== null) {
        console.group(`${prop} preview:`);
        console.log(Object.keys(value));
        console.groupEnd();
      }
      
      // For arrays, show the first item structure if available
      if (Array.isArray(value) && value.length > 0) {
        console.group(`${prop}[0] preview:`);
        console.log(typeof value[0] === 'object' && value[0] !== null 
          ? Object.keys(value[0]) 
          : typeof value[0]);
        console.groupEnd();
      }
    });
    
    console.groupEnd();
  }
}

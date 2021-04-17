// // TODO: Write unit tests for this function
// // TODO: This function would do well as its own npm module
// export function calculateSpecificity(selector: string): number {
//   // Calculates the specificity of a selector according to
//   // https://www.w3.org/TR/2018/REC-selectors-3-20181106/#specificity

//   selector = selector || '';

//   function numMatches(regex) {
//     return (selector.match(regex) || []).length;
//   }

//   const identifier = '[a-zA-Z][a-zA-Z0-9-_]+';
//   const numIds = numMatches(new RegExp(`#${identifier}`, 'g'));
//   const numClasses = numMatches(new RegExp(`\\.${identifier}`, 'g'));
//   const numAttributes = numMatches(new RegExp(`\\[.+=.+\\]`, 'g'));
//   const numPseudoClasses = numMatches(new RegExp(`:(?!not)${identifier}`, 'g'));
//   const numTypes = numMatches(new RegExp(`(?![^\\[]*\\])(^|[ +~>,]|:not\\()${identifier}`, 'g'));
//   const numPseudoElements = numMatches(new RegExp(`::${identifier}`, 'g'));

//   const a = numIds;
//   const b = numClasses + numAttributes + numPseudoClasses;
//   const c = numTypes + numPseudoElements;

//   return 100 * a + 10 * b + c;
// }

// export function deepExtend(target: any, ...args: any[]) {
//   return deepExtendWithConfig({ deleteUndefined: true, deleteNull: false }, target, ...args);
// }

// export function deepExtendWithConfig(
//   config: { deleteUndefined: boolean; deleteNull: boolean },
//   target: any,
//   ...args: any[]
// ) {
//   target = target || {};
//   for (let i = 0; i < args.length; i++) {
//     const obj = args[i];
//     if (!obj) continue;
//     for (const key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         if (
//           (config.deleteUndefined && obj[key] === undefined) ||
//           (config.deleteNull && obj[key] === null)
//         ) {
//           delete target[key];
//         } else if (obj[key] === undefined || obj[key] === null) {
//           target[key] = obj[key];
//         } else if (typeof obj[key] === 'object') {
//           if (obj[key] instanceof Array == true) {
//             target[key] = obj[key].slice(0);
//           } else {
//             target[key] = deepExtendWithConfig(config, target[key], obj[key]);
//           }
//         } else {
//           target[key] = obj[key];
//         }
//       }
//     }
//   }
//   return target;
// }

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Stringable {
  toString(): string;
}

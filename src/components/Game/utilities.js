/**
 * Make a copy of 2D array
 * @param {Array} originalArray - the 2D array to be copied
 * @returns a copy of the original array
 */
export const copyArray = (originalArray) => {
  return [...originalArray.map((row) => [...row])];
};
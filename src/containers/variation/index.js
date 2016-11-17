import React     from 'react';
import Variation from './variation';
export default Variation;
export const isVariationContainer = (child) => (React.isValidElement(child) && child.type == Variation);

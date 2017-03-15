import React     from 'react';
import Variation from './variation';
export default Variation;
export const isVariation = (child) => (React.isValidElement(child) && child.type == Variation);

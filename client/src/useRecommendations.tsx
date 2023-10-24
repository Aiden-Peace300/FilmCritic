import { useContext } from 'react';
import { RecContext } from './RecContext';

/**
 * Custom hook for accessing the recommendations context.
 * @returns {Object} The recommendations context object.
 */
export function useRecommendations() {
  return useContext(RecContext);
}

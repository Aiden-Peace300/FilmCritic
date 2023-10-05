import { useContext } from 'react';
import { RecContext } from './RecContext';

export function useRecommendations() {
  return useContext(RecContext);
}

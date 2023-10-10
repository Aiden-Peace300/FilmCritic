import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Type for the values provided by the Recommendations context.
 */
type RecValue = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showImages: string[];
  setShowImages: (term: string[]) => void;
  showId: string[];
  setShowId: (term: string[]) => void;
  showTitle: string[];
  setShowTitle: (term: string[]) => void;
};

/**
 * Create the Recommendations context with default values.
 */
export const RecContext = createContext<RecValue>({
  searchTerm: '',
  setSearchTerm: () => {},
  showImages: [],
  setShowImages: () => {},
  showId: [],
  setShowId: () => {},
  showTitle: [],
  setShowTitle: () => {},
});

/**
 * Provider component for the Recommendations context.
 */
export function RecProvider() {
  // State variables for managing recommendations-related data
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showImages, setShowImages] = useState<string[]>([]);
  const [showId, setShowId] = useState<string[]>([]);
  const [showTitle, setShowTitle] = useState<string[]>([]); // State to store show titles of the images in showImage

  // Create the value object to be provided by the context
  const value = {
    searchTerm,
    setSearchTerm,
    showImages,
    setShowImages,
    showId,
    setShowId,
    showTitle,
    setShowTitle,
  };

  // Render the context provider with its children
  return (
    <RecContext.Provider value={value}>
      <Outlet />
    </RecContext.Provider>
  );
}

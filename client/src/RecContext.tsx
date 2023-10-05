import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

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

export function RecProvider() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showImages, setShowImages] = useState<string[]>([]);
  const [showId, setShowId] = useState<string[]>([]);
  const [showTitle, setShowTitle] = useState<string[]>([]); // State to store show titles of the images in showImage

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

  return (
    <RecContext.Provider value={value}>
      <Outlet />
    </RecContext.Provider>
  );
}

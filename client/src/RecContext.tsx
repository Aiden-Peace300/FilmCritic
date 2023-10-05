import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

type RecValue = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showImages: string[];
  setShowImages: (term: string[]) => void;
};

export const RecContext = createContext<RecValue>({
  searchTerm: '',
  setSearchTerm: () => {},
  showImages: [],
  setShowImages: () => {},
});

export function RecProvider() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showImages, setShowImages] = useState<string[]>([]);

  const value = {
    searchTerm,
    setSearchTerm,
    showImages,
    setShowImages,
  };

  return (
    <RecContext.Provider value={value}>
      <Outlet />
    </RecContext.Provider>
  );
}

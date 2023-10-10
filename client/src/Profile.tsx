// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
export type PageTypeInsideApp = 'Logout';
import WatchListHistory from './WatchListHistory';
import './Profile.css';

interface InsideWebsiteNavBarProps {
  onNavigate: (pageNew: PageTypeInsideApp) => void;
}

export default function ProfileComponent({
  onNavigate,
}: InsideWebsiteNavBarProps) {
  return (
    <>
      {/* Render your component here */}
      <button
        type="button"
        onClick={() => onNavigate('Logout')}
        className="entries-link">
        Logout
      </button>
      <WatchListHistory />
    </>
  );
}

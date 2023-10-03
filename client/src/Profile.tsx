export type PageTypeInsideApp = 'Logout';

interface InsideWebsiteNavBarProps {
  onNavigate: (pageNew: PageTypeInsideApp) => void;
}

export default function RatingComponent({
  onNavigate,
}: InsideWebsiteNavBarProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate('Logout')}
      className="entries-link white-text">
      Logout
    </button>
  );
}

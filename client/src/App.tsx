import { Routes, Route, useNavigate } from 'react-router-dom';
import { NavBar, PageType } from './NavBar';
import { InsideWebsiteNavBar, PageTypeInsideApp } from './InsideWebsiteNavBar';
import { IconClicked } from './IconClicked';
import ShowDetailsOfSuggestedFilm from './ShowDetailsOfSuggestedFilm';
import RegistrationForm from './RegistrationForm';
import SignInForm from './SignInForm';
import FeedComponent from './FeedComponent';
import { RecommendationComponent } from './RecommendationComponent';
import RatingComponent from './RatingComponent';
import Profile from './Profile';

export default function App() {
  const navigate = useNavigate();
  const isAuthenticated = !!sessionStorage.getItem('token');

  function handleNavigate(page: PageType) {
    navigate(page);
    if (page === 'sign-out') {
      sessionStorage.removeItem('token');
      navigate('sign-in');
    }
  }

  function handleNavigateInsideApp(pageNew: PageTypeInsideApp) {
    navigate(pageNew);
    if (pageNew === 'Logout') {
      sessionStorage.removeItem('token');
      navigate('Logout');
    }
  }

  const response2 = {};

  return (
    <div>
      {isAuthenticated ? <InsideWebsiteNavBar /> : <NavBar />}

      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route
          path="/sign-in"
          element={<SignInForm onSignIn={() => handleNavigate('movieApp')} />}
        />

        <Route path="/movieApp">
          <Route index element={<FeedComponent />} />
          <Route path="recommendation" element={<RecommendationComponent />} />
          <Route
            path="recommendation/film-details"
            element={<ShowDetailsOfSuggestedFilm response2={response2} />}
          />
          <Route path="rating" element={<RatingComponent />} />
          <Route
            path="profile"
            element={<Profile onNavigate={handleNavigateInsideApp} />}
          />
          <Route path="icon-clicked" element={<IconClicked />} />
        </Route>

        {/* <Route path="*" element={<Navigate to="/sign-in" />} /> */}
      </Routes>
    </div>
  );
}

import { Routes, Route, useNavigate } from 'react-router-dom';
import { NavBar, PageType } from './NavBar';
import { InsideWebsiteNavBar } from './InsideWebsiteNavBar';
import { IconClicked } from './IconClicked';
import { RecProvider } from './RecContext';
import ShowDetailsOfSuggestedFilm from './ShowDetailsOfSuggestedFilm';
import RegistrationForm from './RegistrationForm';
import SignInForm from './SignInForm';
import FeedComponent from './FeedComponent';
import { RecommendationComponent } from './RecommendationComponent';
import RatingComponent from './RatingComponent';
import UsersRatingComponent from './UsersRatingComponent';
import Profile from './Profile';
import EditPostComponent from './EditPostComponent';
import NotFound from './NotFound';

export default function App() {
  const navigate = useNavigate();
  const isAuthenticated = !!sessionStorage.getItem('token');

  // Function to handle navigation and sign-out
  function handleNavigate(page: PageType) {
    navigate(page);
    if (page === 'sign-out') {
      sessionStorage.removeItem('token');
      navigate('sign-in');
    }
  }

  return (
    <div>
      {isAuthenticated ? <InsideWebsiteNavBar /> : <NavBar />}

      <Routes>
        <Route
          path="/"
          element={<SignInForm onSignIn={() => handleNavigate('movieApp')} />}
        />
        <Route path="/register" element={<RegistrationForm />} />
        <Route
          path="/sign-in"
          element={<SignInForm onSignIn={() => handleNavigate('movieApp')} />}
        />

        <Route path="/movieApp">
          <Route index element={<FeedComponent />} />

          <Route element={<RecProvider />}>
            <Route
              path="recommendation"
              element={<RecommendationComponent />}
            />
            <Route
              path="recommendation/:filmTitle"
              element={<ShowDetailsOfSuggestedFilm />}
            />
          </Route>

          <Route path="rating" element={<RatingComponent />} />
          <Route path="rating/:filmId" element={<UsersRatingComponent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:filmId" element={<EditPostComponent />} />
          <Route path="icon-clicked" element={<IconClicked />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

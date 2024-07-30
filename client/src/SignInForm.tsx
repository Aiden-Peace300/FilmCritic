import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdPerson } from 'react-icons/io';
import { FaLock } from 'react-icons/fa6';
import PosterBanner from './PosterBanner';

/**
 * Combined Form for Registering and Signing In a user.
 */
export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between Register and Sign In
  const navigate = useNavigate();

  const guestCredentials = {
    username: 'UnknownUser',
    password: 'UnknownUserPassword',
  };

  /**
   * Handles the form submission to register a user.
   * @param {FormEvent<HTMLFormElement>} event - The form submission event.
   */
  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData.entries());
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };
      const res = await fetch('/api/auth/sign-up', req);
      if (!res.ok) {
        throw new Error(`fetch Error ${res.status}`);
      }
      const user = await res.json();
      console.log('Registered', user);
      setIsRegistering(false); // Switch to Login view
      navigate('/sign-in');
    } catch (err) {
      alert(`Error registering user: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handles the form submission for regular user sign-in.
   * @param {FormEvent<HTMLFormElement>} event - The form submission event.
   */
  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData.entries());
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };
      const res = await fetch('/api/auth/sign-in', req);
      if (!res.ok) {
        throw new Error(`fetch Error ${res.status}`);
      }
      const { payload, token } = await res.json();
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userId', String(payload.userId));
      console.log('Signed In', payload, '; received token:', token);
      navigate('/movieApp');
    } catch (err) {
      alert(`Error signing in: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handles signing in as a guest user.
   */
  async function handleGuestSignIn() {
    setIsLoading(true);
    try {
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestCredentials),
      };
      const res = await fetch('/api/auth/sign-in', req);
      if (!res.ok) {
        throw new Error(`fetch Error ${res.status}`);
      }
      const { payload, token } = await res.json();
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userId', String(payload.userId));
      console.log('Signed In as Guest', payload, '; received token:', token);
      navigate('/movieApp');
    } catch (err) {
      alert(`Error signing in as guest: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="column-half2">
      <PosterBanner />
      <div className="wrapper">
        <div className="container">
          <div className="">
            <div className="d-flex red-backdrop justify-center boarder-radius-1">
              <button
                className={`size link-no-underline ${
                  isRegistering ? 'selected-login white' : ''
                }`}
                onClick={() => setIsRegistering(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                }}>
                <h1 className="no-margin">REGISTER</h1>
              </button>
              <button
                className={`size link-no-underline ${
                  !isRegistering ? 'selected-login white' : ''
                }`}
                onClick={() => setIsRegistering(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                }}>
                <h1 className="no-margin">LOGIN</h1>
              </button>
            </div>
          </div>
          <form onSubmit={isRegistering ? handleRegister : handleSignIn}>
            <div className="row margin-bottom-1">
              <div className="column-half red-backdrop boarder-radius-2">
                <label className="margin-bottom-1 d-block input-container">
                  <IoMdPerson className="username-icon" size={25} />
                  <input
                    required
                    name="username"
                    type="text"
                    className="input-b-color text-padding input-b-radius purple-outline input-height width-100 inputclass"
                    placeholder="USERNAME"
                  />
                </label>
                <label className="margin-bottom-1 d-block input-container">
                  <FaLock className="username-icon" size={20} />
                  <input
                    required
                    name="password"
                    type="password"
                    className="input-b-color text-padding input-b-radius purple-outline input-height width-100 inputclass"
                    placeholder="PASSWORD"
                  />
                </label>
              </div>
            </div>
            <div className="row">
              <div className="column-full d-flex justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="input-b-radius text-padding purple-background white-text-guest">
                  {isRegistering ? 'Register' : 'Login'}
                </button>
                {!isRegistering && (
                  <button
                    type="button"
                    disabled={isLoading}
                    className="input-b-radius text-padding purple-background white-text-guest"
                    onClick={handleGuestSignIn}>
                    Login As Guest
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

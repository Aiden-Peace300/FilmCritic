import { FormEvent, useState } from 'react';
import { IoMdPerson } from 'react-icons/io';
import { FaLock } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

/**
 * Form that signs in a user.
 */
type Props = {
  onSignIn: () => void;
};

/**
 * Form that signs in a user.
 * @param {Props} onSignIn - A function to be called when the user signs in.
 */
export default function SignInForm({ onSignIn }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const guestCredentials = {
    username: 'UnknownUser',
    password: 'UnknownUserPassword',
  };

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
      onSignIn();
    } catch (err) {
      alert(`Error signing in as guest: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handles the form submission for regular user sign-in.
   * @param {FormEvent<HTMLFormElement>} event - The form submission event.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      onSignIn();
    } catch (err) {
      alert(`Error signing in: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="">
        <div className="d-flex red-backdrop justify-center boarder-radius-1">
          <Link to="/sign-in" className="selected-login size link-no-underline">
            <h1 className="no-margin white">LOGIN</h1>
          </Link>
          <Link to="/register" className=" size link-no-underline">
            <h1 className="no-margin justify-end">REGISTER</h1>
          </Link>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row margin-bottom-1">
          <div className="column-half red-backdrop boarder-radius-2">
            <label className="margin-bottom-1 d-block input-container">
              <IoMdPerson className="username-icon" size={25} />
              <input
                required
                name="username"
                type="text"
                className="input-b-color text-padding input-b-radius purple-outline input-height width-100"
                placeholder="USERNAME"
              />
            </label>
            <label className="margin-bottom-1 d-block input-container">
              <FaLock className="username-icon" size={20} />
              <input
                required
                name="password"
                type="password"
                className="input-b-color text-padding input-b-radius purple-outline input-height width-100"
                placeholder="PASSWORD"
              />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="column-full d-flex justify-between">
            <button
              disabled={isLoading}
              className="input-b-radius text-padding purple-background white-text-guest">
              Sign In
            </button>
            <button
              disabled={isLoading}
              className="input-b-radius text-padding purple-background white-text-guest"
              onClick={handleGuestSignIn}>
              Login As Guest
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

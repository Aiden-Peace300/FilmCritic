import { FormEvent, useState } from 'react';

/**
 * Form that signs in a user.
 */
type Props = {
  onSignIn: () => void;
};
export default function SignInForm({ onSignIn }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const guestCredentials = {
    username: 'UnknownUser',
    password: 'UnknownUserPassword',
  };

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
      <div className="row">
        <div className="column-full d-flex justify-between">
          <h1>Sign In</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row margin-bottom-1">
          <div className="column-half">
            <label className="margin-bottom-1 d-block">
              Username
              <input
                required
                name="username"
                type="text"
                className="input-b-color text-padding input-b-radius purple-outline input-height margin-bottom-2 d-block width-100"
              />
            </label>
            <label className="margin-bottom-1 d-block">
              Password
              <input
                required
                name="password"
                type="password"
                className="input-b-color text-padding input-b-radius purple-outline input-height margin-bottom-2 d-block width-100"
              />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="column-full d-flex justify-between">
            <button
              disabled={isLoading}
              className="input-b-radius text-padding purple-background white-text">
              Sign In
            </button>
            <button
              disabled={isLoading}
              className="input-b-radius text-padding purple-background white-text"
              onClick={handleGuestSignIn}>
              Sign-in As Guest
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

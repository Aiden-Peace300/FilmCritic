import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdPerson } from 'react-icons/io';
import { FaLock } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import PosterBanner from './PosterBanner';
import './RegistrationForm.css';

/**
 * Form that registers a user.
 */
export default function RegistrationForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the form submission to register a user.
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
      const res = await fetch('/api/auth/sign-up', req);
      if (!res.ok) {
        throw new Error(`fetch Error ${res.status}`);
      }
      const user = await res.json();
      console.log('Registered', user);
      navigate('/sign-in');
    } catch (err) {
      alert(`Error registering user: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="column-half2">
      <PosterBanner />
      <div className="wrapper" style={{ transform: 'translateY(-100px)' }}>
        <div className="container">
          <div className="">
            <div className="d-flex red-backdrop justify-center boarder-radius-1">
              <Link to="/sign-in" className="size link-no-underline">
                <h1 className="no-margin">LOGIN</h1>
              </Link>
              <Link
                to="/register"
                className="selected-login size link-no-underline">
                <h1 className="no-margin">REGISTER</h1>
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
                  disabled={isLoading}
                  className="input-b-radius text-padding purple-background white-text-guest">
                  Register
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

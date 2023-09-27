import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import decode from 'jwt-decode';
import { login } from '../api/UserApi';
import { showSuccessToast } from '../utils/toast.js';
import { errorHandler } from '../utils/errors.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSignupPageChange = () => {
    navigate('/signup');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await login(userData);
      const token = response.data.token;
      const decodedToken = decode(token);

      Cookies.set('jwt', token, {
        secure: true,
        sameSite: 'strict',
        expires: new Date(decodedToken.exp * 1000),
      });

      navigate('/landing');
      showSuccessToast('User logged in successfully!');
    } catch (error) {
      errorHandler(error);
    }
  };

  return (
    <div className='Auth-form-container'>
      <form className='Auth-form'>
        <div className='Auth-form-content'>
          <h3 className='Auth-form-title'>Sign In</h3>
          <div className='text-center'>
            Not registered yet?{' '}
            <span className='link-primary' onClick={handleSignupPageChange}>
              Sign Up
            </span>
          </div>
          <div className='form-group mt-3'>
            <label>Email address</label>
            <input
              type='email'
              className='form-control mt-1'
              placeholder='Enter email'
              onChange={handleEmailChange}
            />
          </div>
          <div className='form-group mt-3'>
            <label>Password</label>
            <input
              type='password'
              className='form-control mt-1'
              placeholder='Enter password'
              onChange={handlePasswordChange}
            />
          </div>
          <div className='d-grid gap-2 mt-3'>
            <button
              type='submit'
              className='btn btn-primary'
              onClick={handleLoginSubmit}>
              Submit
            </button>
          </div>
          {/* To be used when we have forgot password feature */}
          {/* <p className='text-center mt-2'>
            Forgot <a href='#'>password?</a>
          </p> */}
        </div>
      </form>
    </div>
  );
};

export default Login;

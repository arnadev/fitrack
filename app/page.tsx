'use client';

import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import SocialLoginButtons from '../components/SocialLoginButtons';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  
  // Form state managed in parent to preserve data when switching
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Join us today and get started'
              }
            </p>
          </div>

          {/* Form Components */}
          {isLogin ? (
            <LoginForm
              email={formData.email}
              password={formData.password}
              onEmailChange={(email) => setFormData(prev => ({ ...prev, email }))}
              onPasswordChange={(password) => setFormData(prev => ({ ...prev, password }))}
            />
          ) : (
            <SignupForm
              name={formData.name}
              email={formData.email}
              password={formData.password}
              confirmPassword={formData.confirmPassword}
              onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
              onEmailChange={(email) => setFormData(prev => ({ ...prev, email }))}
              onPasswordChange={(password) => setFormData(prev => ({ ...prev, password }))}
              onConfirmPasswordChange={(confirmPassword) => setFormData(prev => ({ ...prev, confirmPassword }))}
            />
          )}

          {/* Social Login Buttons */}
          {/* <SocialLoginButtons /> */}

          {/* Toggle between Login and Signup */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium transition duration-200"
              >
                {isLogin ? "Sign up here" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
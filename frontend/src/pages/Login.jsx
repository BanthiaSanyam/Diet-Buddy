import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const {login, error, loading} = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (validateForm()) {
      try {
        console.log("Logging in with:", formData.email);
        const user = await login(formData.email, formData.password);
        console.log("Login successful, user:", user);
        
        // Navigate to dashboard after successful login
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error("Login failed:", err);
        setErrors({
          ...errors,
          form: err.message || 'Invalid credentials. Please try again.'
        });
      }
    } else {
      console.log("Form validation failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen pt-16 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-[var(--color-primary)] opacity-10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-[var(--color-secondary)] opacity-10 blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card w-full max-w-md relative z-10"
      >
        <h2 className="text-3xl font-bold text-[var(--color-light)] mb-8 text-center">
          Welcome <span className="text-[var(--color-primary)]">Back</span>
        </h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-[var(--color-light)] p-4 rounded-lg mb-6 text-sm border border-red-500 border-opacity-30">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[var(--color-light)] text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-dark-alt)] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-[var(--color-light)] text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-[var(--color-dark-alt)] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="********"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {errors.form && (
              <div className="bg-red-500 bg-opacity-20 text-red-500 p-3 rounded-lg text-sm border border-red-500 border-opacity-30">
                {errors.form}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white p-3 rounded-lg font-semibold transition-all hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 disabled:opacity-70 transform hover:-translate-y-1 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-[var(--color-light-alt)]">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] transition-colors">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 
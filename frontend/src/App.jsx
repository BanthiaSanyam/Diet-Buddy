import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home.jsx';
import Workouts from './pages/Workouts.jsx';
import Meals from './pages/Meals.jsx';
import Membership from './pages/Membership.jsx';
import Community from './pages/Community.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Journey from './pages/Journey.jsx';
import Rewards from './pages/Rewards.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MealCalorieDetector from './pages/MealCalorieDetector.jsx';
import Caloriepred from './pages/Caloriepred.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          {/* Texture overlay for premium feel */}
          <div className="texture-overlay"></div>
          
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/community" element={<Community />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/journey"
                element={
                  <PrivateRoute>
                    <Journey />
                  </PrivateRoute>
                }
              />
              <Route
                path="/rewards"
                element={
                  <PrivateRoute>
                    <Rewards />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
        
              
            <Route
                path="/calculate"
                element={
                  <PrivateRoute>
                    <Caloriepred/>
                  </PrivateRoute>
                }
              />
            </Routes>

          </main>
          
          {/* Chatbot component - available on all pages */}
          <Chatbot />
       </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 
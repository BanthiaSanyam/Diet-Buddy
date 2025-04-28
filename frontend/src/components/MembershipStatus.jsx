import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { motion } from 'framer-motion';

const MembershipStatus = ({ user }) => {
  const { getPaymentHistory, getSubscriptionStatus } = useApi();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both subscription status and payment history in parallel
        const [subscriptionResponse, historyResponse] = await Promise.all([
          getSubscriptionStatus(),
          getPaymentHistory()
        ]);
        
        setSubscriptionData(subscriptionResponse);
        setPaymentHistory(historyResponse?.payments || []);
      } catch (error) {
        console.error("Error fetching membership data:", error);
        setError("Failed to load membership information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (user?._id) {
      fetchData();
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-400';
      case 'expired':
        return 'text-red-400';
      case 'trial':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };
  
  const getPlanName = (planType) => {
    switch (planType) {
      case 'premium':
        return 'Premium Yearly';
      case 'monthly':
        return 'Premium Monthly';
      default:
        return 'Basic (Free)';
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg">
        <div className="animate-pulse flex flex-col">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-3"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6 mb-3"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6 mb-6"></div>
          <div className="h-10 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // For basic users or when subscription data isn't available
  if (!subscriptionData || !user?.isMember) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-primary)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Free Plan
        </h3>
        
        <p className="text-[var(--color-light-alt)] mb-4">
          You're currently on the basic plan with limited features. Upgrade now to get access to all premium content!
        </p>
        
        <Link 
          to="/membership" 
          className="block w-full py-3 rounded-lg font-semibold shadow-lg text-center bg-[var(--color-accent)] text-[var(--color-dark)] hover:bg-[var(--color-accent-dark)] transition-all transform hover:-translate-y-1"
        >
          Upgrade to Premium
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-dark-alt)] p-6 rounded-xl shadow-lg overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-accent)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          {getPlanName(user.membershipType)}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscriptionData?.status)}`}>
          {subscriptionData?.status || 'Active'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[var(--color-dark)] p-3 rounded-lg">
          <p className="text-sm text-[var(--color-light-alt)]">Valid Until</p>
          <p className="font-medium">{formatDate(user.membershipExpiry)}</p>
        </div>
        <div className="bg-[var(--color-dark)] p-3 rounded-lg">
          <p className="text-sm text-[var(--color-light-alt)]">Days Remaining</p>
          <p className="font-medium">{getRemainingDays(user.membershipExpiry)}</p>
        </div>
      </div>
      
      {/* Progress bar for subscription */}
      {subscriptionData?.percentComplete && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--color-light-alt)]">Subscription period</span>
            <span className="text-[var(--color-accent)]">{subscriptionData.percentComplete}%</span>
          </div>
          <div className="w-full bg-[var(--color-dark)] rounded-full h-2">
            <div 
              className="bg-[var(--color-accent)] h-2 rounded-full" 
              style={{ width: `${subscriptionData.percentComplete}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Payment history section */}
      {paymentHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[var(--color-light-alt)] mb-2">Recent Payments</h4>
          <div className="max-h-40 overflow-y-auto">
            {paymentHistory.slice(0, 3).map((payment, idx) => (
              <div key={idx} className="bg-[var(--color-dark)] p-3 rounded-lg mb-2 text-sm">
                <div className="flex justify-between">
                  <span>{formatDate(payment.paymentDate)}</span>
                  <span className="font-medium">₹{(payment.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--color-light-alt)] mt-1">
                  <span>{getPlanName(payment.planType)}</span>
                  <span className={getStatusColor(payment.status)}>{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <Link 
          to="/membership" 
          className="flex-1 py-2 rounded-lg font-medium text-center bg-[var(--color-primary)] text-[var(--color-dark)] hover:bg-[var(--color-primary-dark)] transition-all"
        >
          Manage Plan
        </Link>
        <Link 
          to="/membership" 
          className="flex-1 py-2 rounded-lg font-medium text-center bg-[var(--color-dark)] hover:bg-[var(--color-dark-light)] transition-all"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default MembershipStatus; 
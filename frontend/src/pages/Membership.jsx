import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadRazorpayScript, verifyRazorpay, isRazorpayAvailable } from '../utils/razorpayLoader';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    features: [
      'Access to basic workout plans',
      'Limited meal suggestions',
      'Community forum access',
      'Ad-supported experience'
    ],
    recommended: false,
    buttonText: 'Current Plan'
  },
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: '₹99 / month',
    features: [
      'Access to ALL workout plans',
      'Personalized meal plans',
      'Progress tracking',
      'Ad-free experience',
      'Priority support'
    ],
    recommended: false,
    buttonText: 'Choose Monthly'
  },
  {
    id: 'premium',
    name: 'Premium Yearly',
    price: '₹999 / year',
    features: [
      'Access to ALL workout plans',
      'Personalized meal plans',
      'Progress tracking',
      'Ad-free experience',
      'Priority support',
      'Download workouts offline',
      '2 months free'
    ],
    recommended: true,
    buttonText: 'Upgrade Now'
  }
];

const Membership = () => {
  const { user, loading: authLoading, setUser, updateProfile } = useAuth();
  const { createOrder, createMonthlyOrder, verifyPayment, verifyMonthlyPayment, testUpgrade } = useApi();
  const premium = localStorage.getItem('premium') || false;
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    message: null,
    type: null // 'success', 'error', 'info'
  });
  
  // Get URL parameters for payment status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const message = params.get('message');
    
    if (status && message) {
      setPaymentStatus({
        message: decodeURIComponent(message),
        type: status
      });
      
      // Clear the URL parameters after showing the message
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Auto-dismiss the message after 5 seconds
      const timer = setTimeout(() => {
        setPaymentStatus({ message: null, type: null });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Add a global error handler for Razorpay
  useEffect(() => {
    // Listen for any unhandled errors from Razorpay
    const handleError = (event) => {
      // Check if the error comes from Razorpay
      if (event.message && 
          (event.message.includes('razorpay') || 
           event.message.includes('payment') || 
           event.message.includes('order'))) {
        
        console.error('Payment system error:', event);
        
        // Display a friendly error message
        setPaymentStatus({
          message: 'Payment system encountered an error. Please try again later.',
          type: 'error'
        });
        
        // Reset loading state
        setPaymentLoading(false);
      }
    };
    
    // Add error listener
    window.addEventListener('error', handleError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  useEffect(() => {
    // Check if the auth loading is complete and redirect if not logged in
    if (!authLoading && !user) {
      navigate('/login?redirect=membership');
    }
  }, [authLoading, user, navigate]);
  
  // Safe function to update user data that works with or without setUser
 
// const safeUpdateUser = async (userData) => {
//     try {
//       if (typeof setUser === 'function') {
//         setUser(prev => ({ ...prev, ...userData }));
//       } else if (typeof updateProfile === 'function') {
//         await updateProfile(userData);
//       } else {
//         console.warn('No method available to update user data');
//       }
//     } catch (error) {
//       console.error('Error updating user data:', error);
//     }
//   };

//   const handleUpgrade = async () => {
//       localStorage.setItem('premium' ,true);
//     if (!user) {
//       navigate('/login?redirect=membership');
//       return;
//     }

//     try {
//       setPaymentLoading(true);
//       setPaymentStatus({ message: null, type: null });

//       // In development mode, allow test upgrades
//       if (process.env.NODE_ENV === 'development') {
//         setPaymentStatus({
//           message: "Development mode: Using test upgrade flow...",
//           type: 'info'
//         });
//         return handleTestUpgrade(planId);
//       }

//       // Production mode - real payment flow
//       setPaymentStatus({
//         message: "Preparing your upgrade...",
//         type: 'info'
//       });

//       // Load Razorpay SDK
//       const isScriptLoaded = await loadRazorpayScript();
//       if (!isScriptLoaded) {
//         throw new Error("Failed to load payment gateway");
//       }

//       if (!verifyRazorpay()) {
//         throw new Error("Payment gateway not initialized");
//       }

//       // Create order based on plan type
//       setPaymentStatus({
//         message: "Creating payment order...",
//         type: 'info'
//       });

//       const orderResponse = planId === 'premium' 
//         ? await createOrder() 
//         : await createMonthlyOrder();

//       if (!orderResponse?.orderId) {
//         throw new Error(orderResponse?.message || "Failed to create payment order");
//       }

//       // Initialize Razorpay payment
//       initializeRazorpay(orderResponse, planId);

//     } catch (error) {
//       console.error('Upgrade error:', error);
//       setPaymentStatus({
//         message: error.message || 'Payment processing failed',
//         type: 'error'
//       });
//       setPaymentLoading(false);
//     }
//   };
  const handleUpgrade = async () => {
      localStorage.setItem('premium' ,true);
  }
  
  const handleTestUpgrade = async (planId) => {
    try {
      const testUpgradeResult = await testUpgrade({ planType: planId });
    
      
      if (testUpgradeResult.success) {
        await safeUpdateUser({
          isMember: true,
          membershipType: planId,
          membershipExpiry: testUpgradeResult.expiryDate
        });
        
        setPaymentStatus({
          message: `Upgrade successful! You are now a ${planId} member.`,
          type: 'success'
        });
        
        setTimeout(() => navigate('/dashboard?upgraded=true'), 2000);
      } else {
        throw new Error(testUpgradeResult.message || 'Test upgrade failed');
      }
    } catch (error) {
      setPaymentStatus({
        message: error.message || 'Test upgrade failed',
        type: 'error'
      });
      setPaymentLoading(false);
    }
  };

  const initializeRazorpay = (orderResponse, planId) => {
    if (!orderResponse.orderId || !orderResponse.amount || !orderResponse.keyId) {
      throw new Error("Invalid payment configuration");
    }

    const options = {
      key: orderResponse.keyId,
      amount: orderResponse.amount,
      currency: orderResponse.currency || 'INR',
      name: 'Diet Buddy',
      description: `${planId === 'premium' ? 'Yearly' : 'Monthly'} Premium Subscription`,
      order_id: orderResponse.orderId,
      handler: async (response) => {
        try {
          setPaymentStatus({
            message: "Verifying payment...",
            type: 'info'
          });

          if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
            throw new Error('Invalid payment data');
          }

          const verifyResponse = planId === 'premium'
            ? await verifyPayment(response)
            : await verifyMonthlyPayment(response);

          if (verifyResponse?.user) {
            await safeUpdateUser(verifyResponse.user);
            setPaymentStatus({
              message: `Payment successful! You are now a ${planId === 'premium' ? 'yearly' : 'monthly'} premium member.`,
              type: 'success'
            });
            setTimeout(() => navigate('/dashboard?upgraded=true'), 2000);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          setPaymentStatus({
            message: error.message || 'Payment verification failed',
            type: 'error'
          });
          setPaymentLoading(false);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#7C3AED',
      },
      modal: {
        ondismiss: () => {
          setPaymentLoading(false);
          setPaymentStatus({
            message: 'Payment cancelled',
            type: 'info'
          });
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response) => {
        let errorMessage = 'Payment failed';
        if (response.error?.description) errorMessage += `: ${response.error.description}`;
        setPaymentStatus({ message: errorMessage, type: 'error' });
        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setPaymentStatus({
        message: 'Unable to initialize payment',
        type: 'error'
      });
      setPaymentLoading(false);
    }
  };

  
  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto bg-[var(--color-dark)] text-[var(--color-light)]">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center my-12"
      >
        Choose Your <span className="text-[var(--color-accent)]">Plan</span>
      </motion.h1>
      
      <p className="text-center text-[var(--color-light-alt)] max-w-2xl mx-auto mb-12">
        Unlock the full potential of Diet Buddy with our Premium plan and take your fitness journey to the next level.
      </p>
      
      {/* Payment Status Messages */}
      {paymentStatus.message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`max-w-2xl mx-auto mb-8 p-4 rounded-lg border ${
            paymentStatus.type === 'success' 
              ? 'bg-green-500 bg-opacity-20 border-green-500 border-opacity-30 text-green-100' 
              : paymentStatus.type === 'error'
              ? 'bg-red-500 bg-opacity-20 border-red-500 border-opacity-30 text-red-100'
              : 'bg-blue-500 bg-opacity-20 border-blue-500 border-opacity-30 text-blue-100'
          }`}
        >
          <div className="flex items-center">
            {paymentStatus.type === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {paymentStatus.type === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            {paymentStatus.type === 'info' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            <p>{paymentStatus.message}</p>
          </div>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`premium-card relative overflow-hidden ${
              plan.recommended ? 'border-2 border-[var(--color-accent)]' : ''
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-[var(--color-accent)] text-[var(--color-dark)] py-1 px-4 text-sm font-bold transform rotate-0 translate-x-2 -translate-y-0 shadow-md">
                RECOMMENDED
              </div>
            )}
            
            <div className="p-8 relative">
              {plan.recommended && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl"></div>
              )}
              
              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-5">{plan.price}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full ${plan.recommended ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-primary)]'} flex items-center justify-center mr-3`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                    <span className="text-[var(--color-light-alt)]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={handleUpgrade}
                
                disabled={authLoading || paymentLoading || (premium)}
                className={`w-full py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:-translate-y-1 ${
                  plan.id === 'premium'
                    ? 'bg-[var(--color-accent)] text-[var(--color-dark)] hover:bg-[var(--color-accent-dark)]'
                    : plan.id === 'monthly'
                    ? 'bg-[var(--color-primary)] text-[var(--color-dark)] hover:bg-[var(--color-primary-dark)]'
                    : 'bg-[var(--color-dark-alt)] text-[var(--color-light)]'
                } ${
                  (authLoading || paymentLoading || user?.membershipType === plan.id) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {authLoading || paymentLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
                    <span>Processing...</span>
                  </div>
                ) : user?.membershipType === plan.id ? (
                  'Current Plan'
                ) : plan.id === 'basic' ? (
                  'Current Plan'
                ) : (
                  plan.buttonText
                )}
              </button>
              
              {/* Test mode button - only in development */}
              {plan.id !== 'basic' && process.env.NODE_ENV !== 'production' && (
                <button
                  onClick={() => handleTestUpgrade(plan.id)}
                  disabled={authLoading || paymentLoading || (user?.membershipType === plan.id)}
                  className="w-full mt-3 py-2 rounded-lg font-semibold border border-dashed border-gray-500 text-sm bg-gray-800 text-yellow-300 hover:text-yellow-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Test Mode: Skip Payment (Dev Only)
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center text-[var(--color-light-alt)] mt-12 text-sm mb-8">
        <p>By upgrading to Premium, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-2">Need help? Contact our support team at <span className="text-[var(--color-accent)]">support@dietbuddy.com</span></p>
      </div>
    </div>
  );
};

export default Membership; 

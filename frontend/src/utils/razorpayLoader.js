// Function to load the Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If Razorpay is already loaded, resolve immediately
    if (window.Razorpay) {
      console.log('Razorpay script already loaded');
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      console.log('Razorpay script is already being loaded, waiting...');
      // Wait for it to load
      existingScript.addEventListener('load', () => {
        console.log('Existing Razorpay script loaded successfully');
        resolve(true);
      });
      existingScript.addEventListener('error', () => {
        console.error('Existing Razorpay script failed to load');
        resolve(false);
      });
      return;
    }

    console.log('Loading new Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Create timeout for script loading
    const timeoutId = setTimeout(() => {
      console.error('Razorpay script load timed out after 10 seconds');
      resolve(false);
    }, 10000);
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      clearTimeout(timeoutId);
      
      // Verify that Razorpay is actually defined
      if (typeof window.Razorpay === 'function') {
        resolve(true);
      } else {
        console.error('Razorpay script loaded but Razorpay is not defined');
        resolve(false);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

// Function to check if Razorpay is already available
export const isRazorpayAvailable = () => {
  return typeof window !== 'undefined' && typeof window.Razorpay === 'function';
};

// Verify Razorpay loaded correctly
export const verifyRazorpay = () => {
  if (!isRazorpayAvailable()) {
    return false;
  }
  
  try {
    // Try to instantiate Razorpay with empty options (this will throw an error but that's expected)
    // We're just checking if the constructor exists and is callable
    new window.Razorpay({});
    return true;
  } catch (error) {
    if (error.message.includes('key')) {
      // If the error is about missing key, that means Razorpay was loaded correctly
      // This is the expected error when initializing without options
      return true;
    }
    // Any other error means Razorpay didn't load correctly
    console.error('Razorpay verification failed:', error);
    return false;
  }
}; 
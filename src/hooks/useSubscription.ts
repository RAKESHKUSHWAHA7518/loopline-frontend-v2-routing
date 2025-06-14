
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getSubscriptionStatus } from '../lib/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch the subscription status
        const subscriptionData = await getSubscriptionStatus(user.uid);
        setSubscription(subscriptionData);

        // If user has an active subscription, fetch the plan details
        if (subscriptionData.hasActiveSubscription) {
          const priceId = subscriptionData.subscription.items.data[0].price.id;
          
          // Fetch the plan details from Firestore
          const plansQuery = doc(db, 'pricing', 'standard'); // Assuming 'standard' is the plan ID
          const planDoc = await getDoc(plansQuery);
          
          if (planDoc.exists()) {
            setPlanDetails(planDoc.data());
          }
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  return {
    subscription,
    planDetails,
    hasActiveSubscription: subscription?.hasActiveSubscription || false,
    loading,
    error,
  };
}

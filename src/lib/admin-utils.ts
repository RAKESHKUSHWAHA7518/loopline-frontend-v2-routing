
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// This utility can be run by admins to set up or update pricing
export const updatePricingPlan = async (
  planId: string,
  data: {
    name: string;
    description: string;
    amount: string;
    stripeId: string;
    features: string[];
  }
) => {
  try {
    const planRef = doc(db, 'pricing', planId);
    await setDoc(planRef, {
      ...data,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    return false;
  }
};

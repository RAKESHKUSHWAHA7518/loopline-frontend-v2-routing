
// This is a one-time script to set up your Stripe products and prices
const stripe = require('./stripe-config');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

// Initialize Firebase if not already done
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function createStripePlan() {
  try {
    // Create a product
    const product = await stripe.products.create({
      name: 'Standard Plan',
      description: 'Monthly subscription for agent services',
    });

    console.log('Created product:', product.id);

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 29999, // $299.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      lookup_key: 'standard_monthly',
    });

    console.log('Created price:', price.id);

    // Store the product and price info in Firestore
    await db.collection('pricing').doc('standard').set({
      name: 'Standard Plan',
      description: 'Monthly subscription for agent services',
      amount: '$299.99',
      stripeId: price.id,
      productId: product.id,
      features: [
        'Unlimited agent usage',
        'Premium voice options',
        '24/7 priority support',
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Pricing information saved to Firestore');
    
    return { product, price };
  } catch (error) {
    console.error('Error creating Stripe plan:', error);
    throw error;
  }
}

// Run the function
createStripePlan()
  .then(() => {
    console.log('Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });

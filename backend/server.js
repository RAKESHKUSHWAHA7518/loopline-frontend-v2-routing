const express = require("express");
const cors = require("cors");
const {Retell} = require("retell-sdk");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-config.json");
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");
const stripe = require("./stripe-config");

const app = express();

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "wannes-whitelabelled.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Initialize Retell client
const client = new Retell({
  apiKey: "key_b519607900dcb828b833ac62086a",
});

// Middleware
app.use(cors());
app.use(express.json());

// List voices endpoint
app.get("/api/list-voices", async (req, res) => {
  try {
    const voiceResponses = await client.voice.list();

    res.json({
      success: true,
      voices: voiceResponses,
    });
  } catch (error) {
    console.error("Error listing voices:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list voices",
    });
  }
});

// List knowledge bases endpoint
app.get("/api/list-knowledge-bases", async (req, res) => {
  try {
    const knowledgeBases = await client.knowledgeBase.list();
    res.json(knowledgeBases);
  } catch (error) {
    console.error("Error listing knowledge bases:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list knowledge bases",
    });
  }
});

// List agents endpoint
app.get("/api/list-agents", async (req, res) => {
  try {
    const { user_id, workspace_id } = req.query;

    if (!user_id || !workspace_id) {
      return res.status(400).json({
        success: false,
        error: "User ID and workspace ID are required",
      });
    }

    // Get agents from Firestore
    const agentsRef = db
      .collection("users")
      .doc(user_id)
      .collection("workspaces")
      .doc(workspace_id)
      .collection("agents");

    const agentsSnapshot = await agentsRef.get();

    const agents = [];
    agentsSnapshot.forEach((doc) => {
      agents.push({
        agent_id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error("Error listing agents:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list agents",
    });
  }
});

// Create knowledge base endpoint
app.post("/api/create-knowledge-base", async (req, res) => {
  try {
    const {
      user_id,
      workspace_id,
      knowledge_base_name,
      document_urls,
      type,
      text_content,
    } = req.body;

    if (!user_id || !workspace_id || !knowledge_base_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    let knowledgeBaseParams = {
      knowledge_base_name,
    };

    // Create temp directory for file downloads
    const tempDir = path.join(os.tmpdir(), "kb-files");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Handle different types of content
    switch (type) {
      case "webpages":
        if (!document_urls?.length) {
          return res.status(400).json({
            success: false,
            error: "No URLs provided for webpage type",
          });
        }
        knowledgeBaseParams.knowledge_base_urls = document_urls;
        break;

      case "files":
        if (!document_urls?.length) {
          return res.status(400).json({
            success: false,
            error: "No file URLs provided",
          });
        }

        try {
          // Download files from Firebase Storage URLs and create read streams
          const fileStreams = await Promise.all(
            document_urls.map(async (url) => {
              const tempFilePath = path.join(tempDir, `file-${Date.now()}`);

              // Download file from Firebase Storage URL
              await new Promise((resolve, reject) => {
                https
                  .get(url, (response) => {
                    const fileStream = fs.createWriteStream(tempFilePath);
                    response.pipe(fileStream);
                    fileStream.on("finish", () => {
                      fileStream.close();
                      resolve();
                    });
                  })
                  .on("error", reject);
              });

              // Create read stream from downloaded file
              return fs.createReadStream(tempFilePath);
            }),
          );

          knowledgeBaseParams.knowledge_base_files = fileStreams;
        } catch (error) {
          console.error("Error processing files:", error);
          throw new Error("Failed to process files");
        }
        break;

      case "text":
        if (!text_content) {
          return res.status(400).json({
            success: false,
            error: "No text content provided",
          });
        }

        knowledgeBaseParams.knowledge_base_texts = [
          {
            text: text_content,
            title: `Manual Entry ${new Date().toISOString()}`,
          },
        ];
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid content type",
        });
    }

    // Create knowledge base in Retell
    const knowledgeBase =
      await client.knowledgeBase.create(knowledgeBaseParams);

    // Clean up temp files
    if (type === "files") {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Save to Firestore
    const kbRef = db
      .collection("users")
      .doc(user_id)
      .collection("workspaces")
      .doc(workspace_id)
      .collection("knowledge_bases")
      .doc(knowledgeBase.knowledge_base_id);

    await kbRef.set({
      ...knowledgeBase,
      type,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      created_by: user_id,
    });

    res.json({
      success: true,
      knowledge_base: knowledgeBase,
    });
  } catch (error) {
    console.error("Error creating knowledge base:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create knowledge base",
    });
  }
});

// Resync knowledge base endpoint
app.post("/api/resync-knowledge-base/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await client.knowledgeBase.refresh(id);

    res.json({
      success: true,
      message: "Knowledge base refresh initiated",
    });
  } catch (error) {
    console.error("Error resyncing knowledge base:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resync knowledge base",
    });
  }
});

// Delete knowledge base endpoint
app.delete("/api/delete-knowledge-base/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await client.knowledgeBase.delete(id);

    res.json({
      success: true,
      message: "Knowledge base deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting knowledge base:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete knowledge base",
    });
  }
});

// Create agent endpoint
app.post("/api/create-agent", async (req, res) => {
  try {
    const { user_id, workspace_id, llm_data, agent_data } = req.body;

    if (!user_id || !workspace_id || !llm_data || !agent_data) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Create LLM
    const llmResponse = await client.llm.create();
    const llm_id = llmResponse.llm_id;

    // Create Agent with LLM
    const agentResponse = await client.agent.create({
      response_engine: { llm_id, type: "retell-llm" },
      voice_id: "11labs-Adrian", // Using the specified voice
    });
    const agent_id = agentResponse.agent_id;

    // Save to Firestore
    const agentRef = db
      .collection("users")
      .doc(user_id)
      .collection("workspaces")
      .doc(workspace_id)
      .collection("agents")
      .doc(agent_id);

    await agentRef.set({
      llm_id,
      agent_id,
      ...agent_data,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      agent_id,
      llm_id,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create agent",
    });
  }
});

// Get agent endpoint
app.get("/api/get-agent", async (req, res) => {
  try {
    const { agent_id } = req.query;

    if (!agent_id) {
      return res.status(400).json({
        success: false,
        error: "Agent ID is required",
      });
    }

    // Get agent details from Retell
    const agentResponse = await client.agent.retrieve(agent_id);
    const llm_id = agentResponse.response_engine.llm_id;

    // Get LLM details from Retell
    const llmResponse = await client.llm.retrieve(llm_id);

    // Combine the data
    const agentData = {
      ...agentResponse,
      llm_data: llmResponse,
    };

    res.json({
      success: true,
      agent: agentData,
    });
  } catch (error) {
    console.error("Error retrieving agent:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve agent",
    });
  }
});

// Start web call endpoint
app.post("/api/start-web-call", async (req, res) => {
  try {
    const { agent_id } = req.body;

    if (!agent_id) {
      return res.status(400).json({
        success: false,
        error: "Agent ID is required",
      });
    }

    // Create web call using Retell client
    const webCallResponse = await client.call.createWebCall({ agent_id });

    res.json({
      success: true,
      accessToken: webCallResponse.access_token,
    });
  } catch (error) {
    console.error("Error starting web call:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start web call",
    });
  }
});

// Update LLM endpoint
app.post("/api/update-llm", async (req, res) => {
  try {
    const { user_id, workspace_id, llm_data } = req.body;

    console.log(llm_data);

    if (!user_id || !workspace_id || !llm_data || !llm_data.llm_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Update LLM in Retell
    const response = await client.llm.update(llm_data.llm_id, {
      general_prompt: llm_data.general_prompt,
      general_tools: llm_data.general_tools,
      begin_message: llm_data.begin_message, // Added begin_message here
      knowledge_base_ids: llm_data.knowledge_base_ids,
    });

    console.log(response);

    // Update in Firestore
    const llmRef = db
      .collection("users")
      .doc(user_id)
      .collection("workspaces")
      .doc(workspace_id)
      .collection("llms")
      .doc(llm_data.llm_id);

    await llmRef.set(
      {
        ...llm_data,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    res.json({
      success: true,
      message: "LLM updated successfully",
    });
  } catch (error) {
    console.error("Error updating LLM:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update LLM",
    });
  }
});

// Update agent endpoint
app.post("/api/update-agent", async (req, res) => {
  try {
    const { user_id, workspace_id, agent_data } = req.body;

    if (!user_id || !workspace_id || !agent_data || !agent_data.agent_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Update agent in Retell
    const updateData = {
      voice_id: agent_data.voice_id,
      language: agent_data.language,
      // Removed begin_message from here since it's now handled in LLM update
      enable_voicemail_detection: agent_data.enable_voicemail_detection,
      end_call_after_silence_ms: agent_data.end_call_after_silence_ms,
      max_call_duration_ms: agent_data.max_call_duration_ms,
      begin_message_delay_ms: agent_data.begin_message_delay_ms,
      ambient_sound: agent_data.ambient_sound,
      responsiveness: agent_data.responsiveness,
      interruption_sensitivity: agent_data.interruption_sensitivity,
      enable_backchannel: agent_data.enable_backchannel,
      backchannel_words: agent_data.backchannel_words,
      pronunciation_dictionary: agent_data.pronunciation_dictionary,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    await client.agent.update(agent_data.agent_id, updateData);

    // Update in Firestore
    const agentRef = db
      .collection("users")
      .doc(user_id)
      .collection("workspaces")
      .doc(workspace_id)
      .collection("agents")
      .doc(agent_data.agent_id);

    await agentRef.set(
      {
        ...agent_data,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    res.json({
      success: true,
      message: "Agent updated successfully",
    });
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update agent",
    });
  }
});

// List phone numbers endpoint
app.get("/api/list-phone-numbers", async (req, res) => {
  try {
    const phoneNumbers = await client.phoneNumber.list();
    res.json(phoneNumbers);
  } catch (error) {
    console.error("Error listing phone numbers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list phone numbers",
    });
  }
});



 



// Create phone number endpoint
// app.post("/api/create-phone-number", async (req, res) => {
//   try {
//     const {
//       phone_number,
//       area_code,
//       nickname,
//       inbound_agent_id,
//       outbound_agent_id,
//     } = req.body;

//     if (!phone_number || !area_code) {
//       return res.status(400).json({
//         success: false,
//         error: "Phone number and area code are required",
//       });
//     }

//     const phoneNumberResponse = await client.phoneNumber.create({
//       phone_number,
//       area_code,
//       nickname,
//       inbound_agent_id,
//       outbound_agent_id,
//     });

//     res.json({
//       success: true,
//       phone_number: phoneNumberResponse,
//     });
//   } catch (error) {
//     console.error("Error creating phone number:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to create phone number",
//     });
//   }
// });

// Update phone number endpoint
app.post("/api/update-phone-number", async (req, res) => {
  console.log("update phone number");
  console.log(req.body);
  try {
    const {
      user_id,
      workspace_id,
      phone_number,
      nickname,
      inbound_agent_id,
      outbound_agent_id,
    } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    const updateData = {
      nickname,
      inbound_agent_id,
      outbound_agent_id,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const phoneNumberResponse = await client.phoneNumber.update(
      phone_number,
      updateData,
    );

    const phoneNumberRef = db
      .collection("users")
      .doc(user_id)
      .collection("workspaces")
      .doc(workspace_id)
      .collection("phone_numbers")
      .doc(phoneNumberResponse.phone_number);

    await phoneNumberRef.set({
      ...phoneNumberResponse,
    });

    res.json({
      success: true,
      message: "Phone number updated successfully",
    });
  } catch (error) {
    console.error("Error updating phone number:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update phone number",
    });
  }
});

// Delete phone number endpoint
app.delete("/api/delete-phone-number/:phone_number", async (req, res) => {
  try {
    const { phone_number } = req.params;

    await client.phoneNumber.delete(phone_number);

    res.json({
      success: true,
      message: "Phone number deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting phone number:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete phone number",
    });
  }
});

// Make outbound call endpoint
app.post("/api/make-outbound-call", async (req, res) => {
  try {
    const { from_phone_number, to_phone_number } = req.body;

    if (!from_phone_number || !to_phone_number) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    const callResponse = await client.call.createPhoneCall({
      from_number: from_phone_number,
      to_number: to_phone_number,
    });

    res.json({
      success: true,
      call: callResponse,
    });
  } catch (error) {
    console.error("Error making outbound call:", error);
    res.status(500).json({
      success: false,
      error: "Failed to make outbound call",
    });
  }
});

app.post("/api/create-phone-number", async (req, res) => {
  try {
    const { user_id, workspace_id, area_code } = req.body;

    if (!user_id || !workspace_id || !area_code) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Create phone number in Retell
    const phoneNumberResponse = await client.phoneNumber.create({
      area_code,
    });

    console.log(phoneNumberResponse);

    // Save to Firestore
    const phoneNumberRef = db
      .collection("users")
      .doc(user_id)
      .collection("workspaces")
      .doc(workspace_id)
      .collection("phone_numbers")
      .doc(phoneNumberResponse.phone_number);

    await phoneNumberRef.set({
      ...phoneNumberResponse,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      phone_number: phoneNumberResponse,
    });
  } catch (error) {
    console.error("Error creating phone number:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create phone number",
    });
  }
});

const PORT = process.env.PORT || 3001;
// Stripe subscription endpoints
app.post("/api/create-subscription", async (req, res) => {
  try {
    const { user_id, price_id, customer_email, return_url } = req.body;

    if (!user_id || !price_id || !customer_email || !return_url) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Check if user already has subscription data in Firestore
    const userRef = db.collection("users").doc(user_id);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    let customer;
    
    // If user already has a Stripe customer ID, use it; otherwise, create a new customer
    if (userData?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(userData.stripeCustomerId);
    } else {
      // Create a new customer in Stripe
      customer = await stripe.customers.create({
        email: customer_email,
        metadata: {
          firebaseUserId: user_id,
        },
      });
      
      // Save Stripe customer ID to Firestore
      await userRef.set({
        stripeCustomerId: customer.id,
      }, { merge: true });
    }

    // Create a subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      metadata: {
        user_id,
      },
      success_url: `${return_url}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url}?canceled=true`,
    });

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create subscription",
    });
  }
});

// Get subscription information
app.get("/api/subscription/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Get user data from Firestore to find Stripe customer ID
    const userRef = db.collection("users").doc(user_id);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    if (!userData?.stripeCustomerId) {
      return res.json({
        success: true,
        hasActiveSubscription: false,
      });
    }
    
    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripeCustomerId,
      status: "active",
      expand: ["data.default_payment_method"],
    });
    
    if (subscriptions.data.length === 0) {
      return res.json({
        success: true,
        hasActiveSubscription: false,
      });
    }
    
    // Return the active subscription data
    res.json({
      success: true,
      hasActiveSubscription: true,
      subscription: subscriptions.data[0],
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch subscription",
    });
  }
});

// Stripe webhook for handling subscription events
app.post("/api/webhook", express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      'whsec_your_webhook_signing_secret'
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Handle successful payment
      if (invoice.billing_reason === 'subscription_create') {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        await handleSuccessfulSubscription(subscription);
      }
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionChange(subscription);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

// Helper function to handle successful subscription
async function handleSuccessfulSubscription(subscription) {
  const customerId = subscription.customer;
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata.firebaseUserId;
  
  if (userId) {
    // Update user's subscription status in Firestore
    const userRef = db.collection("users").doc(userId);
    await userRef.set({
      subscriptionStatus: 'active',
      subscriptionId: subscription.id,
      subscriptionPriceId: subscription.items.data[0].price.id,
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }, { merge: true });
  }
}

// Helper function to handle subscription changes
async function handleSubscriptionChange(subscription) {
  const customerId = subscription.customer;
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata.firebaseUserId;
  
  if (userId) {
    const userRef = db.collection("users").doc(userId);
    
    if (subscription.status === 'active') {
      await userRef.set({
        subscriptionStatus: 'active',
        subscriptionId: subscription.id,
        subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      }, { merge: true });
    } else if (subscription.status === 'canceled') {
      await userRef.set({
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: new Date(subscription.canceled_at * 1000),
      }, { merge: true });
    }
  }
}

// Get customer's invoices
app.get('/api/invoices/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;

    const invoices = await stripe.invoices.list({
      customer: customer_id,
      limit: 10,
    });

    res.json({
      success: true,
      invoices: invoices.data,
    });
  } catch (error) {
    console.error('Invoice listing error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

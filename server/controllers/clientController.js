const Client = require('../models/Client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper function for the weighted opportunity score
const getSentimentWeight = (sentiment) => {
  const weights = {
    'Ready': 1.0,
    'Interested': 0.8,
    'Hesitant': 0.5,
    'At Risk': 0.2,
    'Critical': 0.0
  };
  return weights[sentiment] || 0.0;
};

// 1. Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Create a new client
exports.createClient = async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    
    if (req.app.get('io')) {
      req.app.get('io').emit('pipelineUpdated', newClient);
    }
    
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Update Pipeline Stage
exports.updatePipelineStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { pipelineStage } = req.body;
    
    // Sequelize requires a slightly different update format
    await Client.update({ pipelineStage }, { where: { id } });
    const updatedClient = await Client.findByPk(id); // Fetch the updated row
    
    res.json(updatedClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Add a Note to a Client
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ message: "Note added successfully" }); // Placeholder for now
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Generate AI Follow-up
exports.generateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { meetingNotes } = req.body;
    
    // Using Sequelize to find the client in Postgres
    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ error: "Client not found" });

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Build the AI Prompt
    const prompt = `
      You are an expert enterprise sales executive. Write a professional, persuasive follow-up email to a client.
      
      Client Details:
      - First Name: ${client.firstName}
      - Company: ${client.company}
      - Pipeline Stage: ${client.pipelineStage}
      - Current Sentiment: ${client.sentimentStatus}
      
      Raw Meeting Notes to incorporate:
      "${meetingNotes}"
      
      Instructions:
      - Do not include subject lines, just the email body.
      - Keep the tone professional but conversational.
      - Address their specific sentiment (e.g., if they are 'Hesitant', reassure them; if 'Ready', push for the close).
      - Sign off as "Alex Rivera, Sales Manager".
    `;

    // Generate the content
    const result = await model.generateContent(prompt);
    const draftEmail = result.response.text();

    res.json({ draft: draftEmail });
  } catch (err) {
    console.error("AI Generation Error:", err);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
};

// 6. Xeno Special: Generate Mass Campaign for a Segment
exports.generateBulkCampaign = async (req, res) => {
  try {
    const { pipelineStage, sentimentStatus } = req.body;

    // Find all clients that match the dropdown filters
    const clients = await Client.findAll({
      where: { pipelineStage, sentimentStatus }
    });

    if (clients.length === 0) {
      return res.status(404).json({ error: "No clients found matching these exact filters." });
    }

    // Format the list of names so Gemini can read them
    const clientList = clients.map(c => `- ${c.firstName} ${c.lastName} (${c.company})`).join('\n');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // The "Xeno-Tier" Prompt
    const prompt = `
      You are an elite retail marketing expert at Xeno. We need to run a mass-marketing campaign to win over a specific segment of our database.

      Target Audience Segment: Clients in the "${pipelineStage}" stage with a sentiment of "${sentimentStatus}".
      
      Here are the specific companies and contacts in this segment:
      ${clientList}

      Task: Write a high-converting, 3-part multi-channel drip campaign designed specifically for this audience to push them to the next stage of the funnel.
      Include:
      1. Day 1: A short, punchy SMS text message.
      2. Day 3: A personalized, value-driven Email #1.
      3. Day 5: A follow-up Email #2 with a clear Call to Action.

      Format it cleanly. Do not include placeholders, make it sound professional and ready to send.
    `;

    const result = await model.generateContent(prompt);
    const campaignDraft = result.response.text();

    res.json({ draft: campaignDraft, targetCount: clients.length });
  } catch (err) {
    console.error("Bulk AI Error:", err);
    res.status(500).json({ error: "Failed to generate campaign." });
  }
};

// 7. Update an existing client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found in the database." });
    }

    // Update the database record with the new form data
    await client.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      company: req.body.company,
      email: req.body.email,
      phone: req.body.phone,
      pipelineStage: req.body.pipelineStage,
      sentimentStatus: req.body.sentimentStatus,
      dealValue: req.body.dealValue
    });

    // Send the updated client back to React
    res.json(client);
    
  } catch (err) {
    console.error("[Backend] Error updating client:", err);
    res.status(500).json({ error: "Failed to update client." });
  }
};

// 8. Dashboard Analytics & Weighted Top Opportunities
exports.getDashboardStats = async (req, res) => {
  try {
    const totalClients = await Client.count();
    const totalRevenue = await Client.sum('dealValue') || 0; 
    const closedDeals = await Client.count({ 
      where: { pipelineStage: 'Closed/Won' } 
    });

    // Calculate Sentiment Distribution
    const clients = await Client.findAll();
    const sentimentCounts = {};
    
    clients.forEach(c => {
      // Default to 'Unknown' if a client somehow doesn't have a status
      const status = c.sentimentStatus || 'Unknown';
      sentimentCounts[status] = (sentimentCounts[status] || 0) + 1;
    });

    // Format for Recharts Pie Chart
    const sentimentData = Object.keys(sentimentCounts).map(key => ({
      name: key,
      value: sentimentCounts[key]
    }));

    // Calculate Weighted Top Opportunities (Active Pipeline Only)
    const rankedOpportunities = clients
      .filter(client => client.pipelineStage !== 'Closed/Won') 
      .map(client => ({
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
        company: client.company,
        sentiment: client.sentimentStatus,
        dealValue: client.dealValue,
        score: (client.dealValue || 0) * getSentimentWeight(client.sentimentStatus)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json({
      totalClients,
      totalRevenue,
      pipelineData: [{ stage: 'Closed/Won', count: closedDeals }],
      sentimentData,
      topOpportunities: rankedOpportunities
    });

  } catch (error) {
    console.error("[Backend] Failed to fetch analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
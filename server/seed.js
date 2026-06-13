require('dotenv').config();
const sequelize = require('./config/database');
const Client = require('./models/Client');

const mockClients = [
  { firstName: "Sarah", lastName: "Connor", company: "Cyberdyne Systems", email: "s.connor@cyberdyne.com", phone: "555-0101", pipelineStage: "Lead", sentimentStatus: "Hesitant" },
  { firstName: "Bruce", lastName: "Wayne", company: "Wayne Enterprises", email: "bwayne@wayne.com", phone: "555-0102", pipelineStage: "Closed/Won", sentimentStatus: "Ready" },
  { firstName: "Tony", lastName: "Stark", company: "Stark Industries", email: "tony@stark.com", phone: "555-0103", pipelineStage: "In Negotiations", sentimentStatus: "Interested" },
  { firstName: "Diana", lastName: "Prince", company: "Themyscira LLC", email: "diana@themyscira.com", phone: "555-0104", pipelineStage: "Contacted", sentimentStatus: "Interested" },
  { firstName: "Clark", lastName: "Kent", company: "Daily Planet", email: "ckent@dailyplanet.com", phone: "555-0105", pipelineStage: "Lead", sentimentStatus: "At Risk" },
  { firstName: "Natasha", lastName: "Romanoff", company: "SHIELD", email: "nat@shield.gov", phone: "555-0106", pipelineStage: "Closed/Won", sentimentStatus: "Ready" },
  { firstName: "Arthur", lastName: "Curry", company: "Atlantis Co.", email: "arthur@atlantis.com", phone: "555-0107", pipelineStage: "In Negotiations", sentimentStatus: "Hesitant" },
  { firstName: "Barry", lastName: "Allen", company: "CCPD Labs", email: "barry@ccpd.com", phone: "555-0108", pipelineStage: "Lead", sentimentStatus: "Interested" },
  { firstName: "Victor", lastName: "Stone", company: "STAR Labs", email: "victor@starlabs.com", phone: "555-0109", pipelineStage: "Contacted", sentimentStatus: "Critical" },
  { firstName: "Hal", lastName: "Jordan", company: "Ferris Air", email: "hal@ferrisair.com", phone: "555-0110", pipelineStage: "Closed/Won", sentimentStatus: "Ready" },
  { firstName: "Stephen", lastName: "Strange", company: "Sanctum", email: "steve@sanctum.org", phone: "555-0111", pipelineStage: "In Negotiations", sentimentStatus: "At Risk" },
  { firstName: "Peter", lastName: "Parker", company: "Daily Bugle", email: "peter@bugle.com", phone: "555-0112", pipelineStage: "Lead", sentimentStatus: "Interested" }
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to Database...");
    await sequelize.authenticate();
    
    console.log("Generating Realistic Pipeline Revenue...");
    const clientsWithRevenue = mockClients.map(client => ({
      ...client,
      dealValue: Math.floor(Math.random() * 50000) + 10000
    }));
    
    console.log("Injecting Mock Data...");
    await Client.bulkCreate(clientsWithRevenue);
    
    console.log("Database seeded successfully! You now have revenue data to analyze.");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
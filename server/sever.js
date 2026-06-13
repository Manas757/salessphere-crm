require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import your controller (Make sure you have this file created!)
const clientController = require('./controllers/clientController');

const app = express();
const server = http.createServer(app);
// Setup Socket.io for real-time Drag-and-Drop updates
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Make socket.io accessible inside your routes
app.set('io', io);

// Database connection and Table Sync
sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL Connected Successfully');
    // The { alter: true } safely injects the dealValue column without deleting your mock data!
    return sequelize.sync({ alter: true }); 
  })
  .catch(err => console.log('PostgreSQL Connection Error:', err));

// --- API Routes ---
// Get all clients for the Pipeline and Directory
app.get('/api/clients', clientController.getAllClients);

// Create a new client from the Modal
app.post('/api/clients', clientController.createClient);

// Update a client's stage when dragged and dropped
app.put('/api/clients/:id/stage', clientController.updatePipelineStage);

// Add a note to a client
app.post('/api/clients/:id/notes', clientController.addNote);

// Generate the AI email draft
app.post('/api/clients/:id/generate-follow-up', clientController.generateFollowUp);

// Generate bulk AI marketing campaigns (The Xeno Feature)
app.post('/api/campaigns/generate', clientController.generateBulkCampaign);

// Dashboard Analytics
app.get('/api/analytics', clientController.getDashboardStats);

// Update a specific client
app.put('/api/clients/:id', clientController.updateClient);

// Real-time connection listener
io.on('connection', (socket) => {
  console.log('Frontend User connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
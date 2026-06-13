# SalesSphere AI CRM 🚀

A modern, AI-powered Customer Relationship Management (CRM) dashboard designed to track leads, analyze client sentiment, and automate outreach using Google's Gemini AI. Built with a robust PERN stack (PostgreSQL, Express, React, Node.js).

## ✨ Core Features
* **Intelligent Dashboard:** Real-time metrics and dynamic visualizations showing pipeline health and client sentiment.
* **Weighted Opportunity Scoring:** Algorithmically ranks top sales opportunities by combining expected deal revenue with lead sentiment weight.
* **AI Follow-Up Generation:** Integrates with Gemini 2.5 Flash to automatically draft personalized, context-aware email follow-ups based on raw meeting notes.
* **Bulk AI Campaigns:** Generates multi-channel marketing drip campaigns for highly specific lead segments.
* **Pipeline Management:** Full CRUD operations to track leads from initial contact to closed deals.

## 🛠️ Tech Stack
* **Frontend:** React.js (Vite), Recharts, Lucide React
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL with Sequelize ORM
* **AI Integration:** Google Generative AI (Gemini 2.5 Flash API)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16+)
* [PostgreSQL](https://www.postgresql.org/)
* A Google Gemini API Key

### 2. Installation
Clone the repository and install dependencies for both the client and server.

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
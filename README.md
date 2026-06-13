# SalesSphere CRM

A full-stack Customer Relationship Management (CRM) dashboard built to track sales leads, visualize pipeline data, and automate follow-ups using the Google Gemini API. 

I built this to handle standard lead tracking while experimenting with how LLMs can speed up data entry and communication for sales teams.

## Features

* **Analytics Dashboard:** Uses Recharts to visualize pipeline health, total revenue, and overall client sentiment.
* **Opportunity Scoring:** A custom weighting system that ranks sales opportunities by combining potential deal value with lead sentiment.
* **AI Email Drafts:** Integrates the Gemini 2.5 Flash API to automatically read raw meeting notes and generate personalized follow-up emails.
* **AI Campaigns:** Generates targeted outreach messaging for specific lead segments.
* **Pipeline Management:** A Kanban-style interface to move leads through different stages (Lead, Contacted, Proposal, Won, Lost).

## Tech Stack

* **Frontend:** React (Vite), Recharts for data visualization, Lucide React for UI icons.
* **Backend:** Node.js, Express.js REST API.
* **Database:** PostgreSQL with the Sequelize ORM.
* **AI Integration:** Google Generative AI SDK (Gemini).

---

## Local Setup

### Prerequisites
Make sure you have Node.js and PostgreSQL installed on your machine. You will also need a free Google Gemini API key.

### 1. Install Dependencies
Clone the repo, then install the packages for both the backend and frontend:

```bash
# Backend setup
cd server
npm install

# Frontend setup
cd ../client
npm install
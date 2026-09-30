# ⚽ Scorely

**Scorely** is a full-stack football scores and statistics mobile application built with React Native, Expo and TypeScript.

The application provides football match data, league standings, detailed match statistics, lineups, team and player profiles, transfers, search functionality and persistent favorites through a custom Node.js REST API.

---

## 📱 About the Project

Scorely was developed as a modern mobile football application inspired by platforms such as Flashscore and Sofascore.

The project focuses on building a complete mobile experience around football data while maintaining a clean and simple user interface.

The mobile application communicates with a custom REST API built with Node.js and Express. The backend retrieves football data from the Sportmonks Football API and exposes only the information required by the mobile client.

This architecture keeps external API credentials securely on the server instead of exposing them inside the mobile application.

---

## ✨ Features

### ⚽ Matches

- Browse football matches by date
- Switch between supported leagues
- View match status and scores
- Open detailed match information
- View recent team form

### 📊 Match Details

- Match overview
- Match events
- Goals and important incidents
- Starting lineups
- Match statistics
- Ball possession
- Corners
- Goals
- Cards and other available statistics

### 🏆 Standings

- League table
- Position
- Matches played
- Wins
- Draws
- Losses
- Goal difference
- Points
- Direct navigation to team profiles

### 🏟️ Team Profiles

- Club information
- Stadium information
- Upcoming matches
- Previous results
- Recent form
- Squad
- Player navigation
- Incoming transfers
- Outgoing transfers
- Transfer history

### 👤 Player Profiles

- Player information
- Position
- Nationality
- Date of birth
- Height and weight
- Current club
- Career history
- Transfer history
- Seasonal statistics
- Appearances
- Starts
- Minutes played
- Goals
- Assists
- Cards

### 🔎 Search

Search directly for:

- Teams
- Players

Search results provide direct navigation to the corresponding team or player profile.

### ⭐ Favorites

- Add teams to favorites
- Remove teams from favorites
- Favorites stored locally using AsyncStorage
- View upcoming matches for favorite teams

### 🌍 Multiple Leagues

Scorely currently supports football data from:

- Scottish Premiership
- Danish Superliga

The architecture allows additional leagues to be added in the future depending on API availability.

---

## 🛠️ Tech Stack

### Mobile Application

- React Native
- Expo
- Expo Router
- TypeScript
- AsyncStorage

### Backend

- Node.js
- Express
- Axios
- REST API

### Football Data

- Sportmonks Football API

### Deployment

- Expo EAS Build
- Render
- GitHub

---

## 🏗️ Architecture

```text
┌──────────────────────────┐
│      Scorely Mobile      │
│                          │
│ React Native + Expo      │
│ TypeScript               │
└────────────┬─────────────┘
             │
             │ HTTPS / REST
             ▼
┌──────────────────────────┐
│       Scorely API        │
│                          │
│ Node.js + Express        │
│ Hosted on Render         │
└────────────┬─────────────┘
             │
             │ HTTPS
             ▼
┌──────────────────────────┐
│   Sportmonks Football    │
│           API            │
└──────────────────────────┘
```

The Sportmonks API token is stored securely as an environment variable on the backend and is never exposed inside the mobile application.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── standings.tsx
│   │   ├── search.tsx
│   │   ├── favorites.tsx
│   │   └── profile.tsx
│   │
│   ├── match/
│   │   └── [id].tsx
│   │
│   ├── team/
│   │   └── [id].tsx
│   │
│   ├── player/
│   │   └── [id].tsx
│   │
│   └── _layout.tsx
│
├── config/
│   └── api.ts
│
├── context/
│   ├── LeagueContext.tsx
│   └── ThemeContext.tsx
│
├── theme/
│
└── utils/
    ├── favorites.ts
    └── theme.ts
```

---

## 🌐 Backend

Scorely uses a separate Node.js and Express backend.

The backend acts as an intermediary between the mobile application and the Sportmonks Football API.

This provides several advantages:

- External API credentials are not exposed in the mobile application
- API responses can be transformed before reaching the client
- Mobile and backend development remain separated
- Backend logic can be updated independently
- The architecture can support additional data sources in the future

---

## 🔐 Security

Sensitive credentials such as the Sportmonks API token are never committed to GitHub.

The token is stored using environment variables on the backend:

```text
SPORTMONKS_API_TOKEN
```

The mobile application communicates only with the deployed Scorely API.

---

## 📱 Android Build

Scorely has been successfully built as a standalone Android application using **Expo EAS Build**.

The application can run independently without:

- Expo Go
- A local Node.js server
- A development computer
- A local network connection to the backend

The production-style mobile application communicates with the cloud-hosted Scorely REST API.

---

## 🖼️ Screenshots

Screenshots of the application will be added here.

Planned showcase:

- Matches
- Match Details
- Match Statistics
- League Standings
- Team Profile
- Player Profile
- Search
- Favorites

---

## 🧪 Testing & QA

Automated testing is planned as part of the continued development of Scorely.

The testing strategy will include:

- REST API testing
- Integration testing
- End-to-end testing
- Critical user flow validation
- Regression testing
- CI/CD integration

Example critical flows:

```text
Search
→ Find Team
→ Open Team Profile
→ View Squad
→ Open Player
→ View Player Details
```

```text
Matches
→ Select League
→ Open Match
→ View Overview
→ View Lineups
→ View Statistics
```

The goal is to integrate automated tests into a CI/CD pipeline using GitHub Actions.

---

## 🚀 Future Improvements

Planned improvements include:

- Head-to-head match history
- Additional football leagues
- Improved dark mode
- Push notifications
- Match notifications
- Enhanced loading and error states
- Additional match statistics
- Automated testing
- CI/CD pipeline
- UI/UX improvements

---

## ⚙️ Running the Project Locally

### Requirements

Make sure you have installed:

- Node.js
- npm
- Expo

Clone the repository:

```bash
git clone https://github.com/lucianbutuc16/scorely.git
```

Enter the project:

```bash
cd scorely
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

The application can then be opened using a supported development environment or device.

---

## 📌 Project Status

**Version:** 1.0.0

Scorely is currently under active development.

The core mobile application, cloud backend and standalone Android build are functional.

---

## 🎯 Project Goals

Scorely was built to explore and demonstrate practical concepts in:

- Mobile application development
- Full-stack software architecture
- REST API integration
- TypeScript development
- State management
- Persistent local storage
- Cloud deployment
- API security
- Software testing
- CI/CD

---

## 👨‍💻 Author

**Lucian Butuc**

Master's student in Information Technologies with an interest in Software Engineering and QA/Test Automation.

Areas of interest:

- Software Engineering
- QA & Test Automation
- Web and Mobile Testing
- REST API Testing
- TypeScript / JavaScript
- CI/CD

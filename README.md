# RevisionAI - Smart Study Companion

RevisionAI is an AI-powered study and revision tool that helps you organize your learning, generate personalized flashcards, and track your progress. Built with Next.js, MongoDB, and modern UI libraries, it offers a seamless, dark-mode-enabled experience for students and lifelong learners.

---

## 🚀 Features

- **AI Flashcard Generation**: Automatically generate flashcards from your notes using advanced AI (Gemini API).
- **Smart Organization**: Organize your learning into subjects and topics, upload notes (PDF or TXT), and manage your study materials.
- **Interactive Dashboard**: Visualize your learning stats, streaks, and recent activity.
- **Daily Prompts**: Stay motivated with daily learning prompts and streak tracking.
- **Curiosity Hub**: Discover fascinating facts about learning, memory, and the science of knowledge.
- **Chat with Your Notes**: Ask questions about your uploaded notes and get instant AI-powered answers.
- **Spaced Repetition**: Optimize retention with scientifically-backed revision scheduling.
- **Dark Mode**: Beautiful, accessible dark mode across the entire app.
- **Responsive Design**: Works great on desktop and mobile.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 13+ (App Router)](https://nextjs.org/), [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend/API**: Next.js API routes, [Mongoose](https://mongoosejs.com/) (MongoDB ODM)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) or local MongoDB
- **Authentication**: JWT-based authentication
- **AI Integration**: Gemini API (for flashcard and Q&A generation)
- **File Uploads**: PDF and TXT support
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) for dark mode

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/revisionai.git
   cd revisionai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your values:
     ```env
     MONGODB_URI=your-mongodb-connection-string
     JWT_SECRET=your-jwt-secret
     GEMINI_API_KEY=your-gemini-api-key
     ```
   - For local development, you can use MongoDB Compass or Atlas.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 📝 Usage

- **Sign up / Log in** to create your account.
- **Create Subjects** and upload notes (PDF or TXT).
- **Generate AI Flashcards** for your topics.
- **Review flashcards** using spaced repetition.
- **Chat with your notes** for instant Q&A.
- **Track your progress** on the dashboard.
- **Switch between light and dark mode** using the toggle in the header.

---

## 🌐 API Endpoints (Summary)

- `POST /api/auth/signup` — User registration
- `POST /api/auth/signin` — User login
- `GET /api/dashboard` — Fetch dashboard stats and subjects
- `GET/POST /api/subjects` — List or create subjects
- `GET/POST /api/subjects/:id` — Get subject details or add topic
- `POST /api/subjects/:id/upload` — Upload notes to a subject
- `POST /api/subjects/:id/chat` — Ask questions about a subject
- `GET/DELETE /api/flashcards` — List or delete flashcards
- `POST /api/flashcards/generate` — Generate AI flashcards
- `POST /api/daily-prompt` — Add a daily learning entry
- `POST /api/chat` — General AI chat

---

## 🧑‍💻 Contributing

Contributions are welcome! To contribute:
1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [MongoDB](https://www.mongodb.com/)
- [Gemini API](https://ai.google.dev/gemini-api)

---

> Made with ❤️ for learners everywhere. 
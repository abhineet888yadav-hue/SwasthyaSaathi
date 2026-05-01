# SwasthyaSaathi - Neural Student Mentor 🧠✨

SwasthyaSaathi is a brilliant, empathetic, and high-energy AI mentor designed for students from Class 5 through Higher Education. It helps manage academic stress, provides personalized study plans, and offers doubt-solving using the latest Google Gemini AI.

## 🚀 Vision
To combat student burnout and revolutionize the learning experience through proactive health monitoring and personalized AI mentorship.

## ✨ Core Features
- **Neural Chatbot**: Expert help in Hinglish for a relatable and trust-filled mentorship experience.
- **Smart Study Plans**: Instant, professional schedules generated based on your energy levels and goals.
- **Health Dashboard**: Real-time tracking of sleep, mood, and study hours with "Burnout Risk" detection.
- **Image Generation**: Visual aid and creative inspiration using Gemini's image generation capabilities.
- **Academic Recovery**: Specific modules for class chapters and recovery from academic setbacks.

## 🛠️ Tech Stack
- **Frontend**: React 18 + Vite (High Performance)
- **Styling**: Tailwind CSS (Glassmorphism & Neon-Green Aesthetic)
- **Backend/DB**: Firebase Auth & Google Cloud Firestore (Enterprise Edition)
- **AI Engine**: Google Gemini AI (@google/genai)
- **Animations**: Framer Motion (motion/react)

## 📦 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd swasthyasaathi
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🌐 Deployment
This project is ready for deployment to any static hosting provider like **Netlify** or **Vercel**.

### Configuration
- Ensure `VITE_GEMINI_API_KEY` is set in your hosting provider's dashboard under **Environment Variables**.
- Follow standard Vite deployment guides for your chosen platform.

## 🛡️ Security & Performance
- **Lazy AI Loading**: Prevents application crashes if API keys are missing.
- **Standardized Error Handling**: Detailed Firestore error logging for secure debugging.
- **Hinglish Persona**: Optimized prompting for compassionate student engagement.

---
Built with ❤️ by SwasthyaSaathi AI Team.

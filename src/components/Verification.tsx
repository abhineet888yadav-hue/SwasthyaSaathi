import { motion } from "motion/react";
import { Mail, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Verification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-[32px] border border-green-50 shadow-2xl bg-white/80 backdrop-blur-xl text-center"
      >
        <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-2xl mb-6">
          <Mail className="w-8 h-8 text-neon-green" />
        </div>
        <h2 className="text-2xl font-bold text-green-950 mb-4">Verify your email</h2>
        <p className="text-green-800/60 mb-8">
          We have sent you a verification email to {email}. Please verify it and log in.
        </p>
        <button
          onClick={() => navigate("/signin")}
          className="w-full bg-neon-green text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          Login <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MessageCircle, ArrowRight } from 'lucide-react';

const HubHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 grid place-items-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Welkom bij de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Didactische Hub</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Jouw centrale dashboard voor het aanscherpen van professionele didactische vaardigheden met behulp van AI. Kies hieronder de applicatie om mee te starten.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all cursor-pointer overflow-hidden shadow-2xl"
            onClick={() => navigate('/coaching')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/30" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="text-indigo-300 w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">Didactisch Coachen</h2>
              <p className="text-slate-300 mb-8 flex-grow">
                Oefen met het formuleren van de juiste didactische vragen op basis van diverse casussen en ontvang direct AI-feedback.
              </p>
              
              <div className="flex items-center text-indigo-300 font-semibold mt-auto">
                Open Applicatie
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all cursor-pointer overflow-hidden shadow-2xl"
            onClick={() => navigate('/feedback')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/30" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="text-blue-300 w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">Feedback Trainer</h2>
              <p className="text-slate-300 mb-8 flex-grow">
                Professionaliseer je feedbackvaardigheden met behulp van een geavanceerd AI-dashboard dat je antwoorden langs 8 dimensies meet.
              </p>
              
              <div className="flex items-center text-blue-300 font-semibold mt-auto">
                Open Applicatie
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HubHome;

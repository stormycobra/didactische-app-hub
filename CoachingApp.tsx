/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronRight, 
  RotateCcw, 
  Send, 
  Settings, 
  Sparkles, 
  Target, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Home
} from 'lucide-react';
import { AppState, Case, Feedback, Category, Mode, Difficulty } from './types';
import { generateCase, evaluateResponse } from './services/geminiService';

export default function App() {
  const navigate = useNavigate();
  const [state, setState] = useState<AppState>({
    view: 'setup',
    subject: 'Biologie',
    level: 'Middenbouw',
    mode: 'categorie-specifiek',
    difficulty: 'beginner',
    currentCase: null,
    teacherResponse: '',
    feedback: null,
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>(2);

  const handleStart = async () => {
    setState(prev => ({ ...prev, view: 'loading' }));
    try {
      const newCase = await generateCase(
        state.subject,
        state.level,
        state.mode,
        state.difficulty,
        state.mode === 'categorie-specifiek' ? selectedCategory : undefined
      );
      setState(prev => ({ ...prev, view: 'practice', currentCase: newCase }));
    } catch (error) {
      console.error('Error generating case:', error);
      setState(prev => ({ ...prev, view: 'setup' }));
    }
  };

  const handleSubmit = async () => {
    if (!state.currentCase || !state.teacherResponse.trim()) return;
    
    setState(prev => ({ ...prev, view: 'loading' }));
    try {
      const feedback = await evaluateResponse(state.currentCase, state.teacherResponse);
      setState(prev => ({ ...prev, view: 'feedback', feedback }));
    } catch (error) {
      console.error('Error evaluating response:', error);
      setState(prev => ({ ...prev, view: 'practice' }));
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      view: 'setup',
      currentCase: null,
      teacherResponse: '',
      feedback: null,
    }));
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      view: 'practice',
      teacherResponse: '',
      feedback: null,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 font-medium text-sm"
              title="Terug naar App Hub"
            >
              <Home className="w-5 h-5" />
              Hub
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Didactisch Coachen</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Oefenomgeving</p>
              </div>
            </div>
          </div>
          {state.view !== 'setup' && (
            <button 
              onClick={handleReset}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              title="Instellingen"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {state.view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Klaar om te trainen?</h2>
                <p className="text-slate-600">
                  Verbeter je vaardigheden in het stellen van krachtige vragen. Kies je context en start een nieuwe casus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">Context</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vak</label>
                      <input 
                        type="text"
                        list="subjects"
                        value={state.subject}
                        onChange={(e) => setState(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Bijv. Biologie, Engels, Wiskunde..."
                      />
                      <datalist id="subjects">
                        <option value="Biologie" />
                        <option value="Engels" />
                        <option value="Nederlands" />
                        <option value="Wiskunde" />
                        <option value="Geschiedenis" />
                        <option value="Aardrijkskunde" />
                        <option value="Natuurkunde" />
                        <option value="Scheikunde" />
                        <option value="Mentoraat" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Niveau</label>
                      <select 
                        value={state.level}
                        onChange={(e) => setState(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option>Onderbouw</option>
                        <option>Middenbouw</option>
                        <option>Bovenbouw</option>
                        <option>MBO</option>
                        <option>HBO</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">Oefenmodus</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Modus</label>
                      <select 
                        value={state.mode}
                        onChange={(e) => setState(prev => ({ ...prev, mode: e.target.value as Mode }))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option value="categorie-specifiek">Categorie-specifiek</option>
                        <option value="mix">Mix (Willekeurig)</option>
                        <option value="diagnose">Diagnosemodus</option>
                        <option value="escalatie">Escalatiemodus (1→2→3)</option>
                      </select>
                    </div>
                    
                    {state.mode === 'categorie-specifiek' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Categorie</label>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat as Category)}
                              className={`flex-1 py-2 rounded-lg border transition-all font-medium ${
                                selectedCategory === cat 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                              }`}
                            >
                              Cat {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Moeilijkheid</label>
                      <div className="flex gap-2">
                        {(['beginner', 'gevorderd', 'expert'] as Difficulty[]).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setState(prev => ({ ...prev, difficulty: diff }))}
                            className={`flex-1 py-1 px-2 text-xs rounded-full border transition-all capitalize font-medium ${
                              state.difficulty === diff 
                                ? 'bg-slate-800 border-slate-800 text-white' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {[
                  { title: 'Cat 1: Waarnemen', desc: 'Benoemen, reproduceren, concretiseren.' },
                  { title: 'Cat 2: Denken', desc: 'Inhoud, redenering, verbanden, strategie.' },
                  { title: 'Cat 3: Zelfregulatie', desc: 'Reflectie, planning, monitoring.' }
                ].map((info, i) => (
                  <div key={i} className="bg-white/50 p-4 rounded-xl border border-slate-200/50 text-center">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{info.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{info.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleStart}
                  className="group flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
                >
                  Start Oefening
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {state.view === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">Even geduld...</h3>
                <p className="text-slate-500">
                  {state.feedback ? 'Feedback wordt geanalyseerd' : 'Een nieuwe casus wordt voorbereid'}
                </p>
              </div>
            </motion.div>
          )}

          {state.view === 'practice' && state.currentCase && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-2">
                <button 
                  onClick={handleReset}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                      Cat {state.currentCase.category}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs font-medium">{state.subject} - {state.level}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900">Casus</h4>
                        <p className="text-slate-700 leading-relaxed text-lg italic">
                          "{state.currentCase.caseText}"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600">
                          <Target className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Oefendoel</span>
                        </div>
                        <p className="text-sm text-slate-600">{state.currentCase.goal}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Opdracht</span>
                        </div>
                        <p className="text-sm text-slate-600">{state.currentCase.assignment}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider">Jouw reactie</label>
                    <textarea
                      value={state.teacherResponse}
                      onChange={(e) => setState(prev => ({ ...prev, teacherResponse: e.target.value }))}
                      className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400"
                      placeholder="Typ hier de vraag of reactie die je aan de leerling zou geven..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSubmit}
                      disabled={!state.teacherResponse.trim()}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all"
                    >
                      Verstuur
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state.view === 'feedback' && state.feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    state.feedback.judgment === 'zeer sterk' ? 'bg-green-100 text-green-600' :
                    state.feedback.judgment === 'sterk' ? 'bg-emerald-100 text-emerald-600' :
                    state.feedback.judgment === 'redelijk sterk' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Feedback</h2>
                    <p className="text-sm text-slate-500 font-medium">Beoordeling: <span className="capitalize text-indigo-600">{state.feedback.judgment}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Opnieuw
                  </button>
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Volgende Casus
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-sm">1</span>
                      </div>
                      <h3 className="font-bold text-slate-900">Analyse van je vraag</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Categorie</span>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">{state.feedback.category}</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{state.feedback.explanation}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                          <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Wat werkt goed?</h4>
                          <p className="text-sm text-green-800 leading-relaxed">{state.feedback.whatWorks}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Wat beperkt de kracht?</h4>
                          <p className="text-sm text-amber-800 leading-relaxed">{state.feedback.whatLimits}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900">Vakgerichte Verdieping</h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed bg-indigo-50/30 p-4 rounded-2xl italic border border-indigo-50">
                      {state.feedback.subjectAnalysis}
                    </p>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Dimensies</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Inhoud', key: 'content' },
                        { label: 'Strategie', key: 'strategy' },
                        { label: 'Modus', key: 'modus' },
                        { label: 'Kwaliteit', key: 'quality' }
                      ].map((dim) => (
                        <div key={dim.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                          <span className="text-sm font-medium text-slate-600">{dim.label}</span>
                          {state.feedback?.dimensions[dim.key as keyof typeof state.feedback.dimensions] ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 italic leading-relaxed">
                      {state.feedback.dimensions.explanation}
                    </p>
                  </section>

                  <section className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider opacity-80">Suggesties</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Herformulering</h4>
                        <p className="text-sm font-medium leading-relaxed">"{state.feedback.reformulation}"</p>
                      </div>
                      <div className="pt-2 border-t border-white/20">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Vervolgvraag</h4>
                        <p className="text-sm font-medium leading-relaxed">"{state.feedback.followUpQuestion}"</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          Didactisch Coachen Oefen-App • Gebouwd voor docenten
        </p>
      </footer>
    </div>
  );
}

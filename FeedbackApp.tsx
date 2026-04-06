import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from "react-router-dom";
import { 
  MessageSquare, 
  Settings, 
  Send, 
  RotateCcw, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  BrainCircuit, 
  PenTool, 
  AlertCircle,
  CheckCircle2,
  User,
  Bot,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

// --- Types ---

type Mode = "ROLLSPEL" | "FEEDBACKANALYSE" | "FOUTEN_HERKENNEN" | "HERSCHRIJVEN";
type Difficulty = "beginner" | "gemiddeld" | "gevorderd";

interface SessionConfig {
  subject: string;
  level: string;
  category: string;
  context: string;
  difficulty: Difficulty;
  mode: Mode;
}

interface Message {
  role: "user" | "model";
  text: string;
  dimensions?: string[];
}

// --- Constants ---

const MODES: { id: Mode; label: string; description: string; icon: any }[] = [
  { 
    id: "ROLLSPEL", 
    label: "Rollenspel", 
    description: "Oefen met een realistische leerling in de klas.",
    icon: User
  },
  { 
    id: "FEEDBACKANALYSE", 
    label: "Feedbackanalyse", 
    description: "Laat je eigen feedback analyseren op de 4 dimensies.",
    icon: BrainCircuit
  },
  { 
    id: "FOUTEN_HERKENNEN", 
    label: "Fouten Herkennen", 
    description: "Herken welke feedbackdimensie ontbreekt of zwak is.",
    icon: AlertCircle
  },
  { 
    id: "HERSCHRIJVEN", 
    label: "Herschrijven", 
    description: "Maak zwakke feedback krachtiger en effectiever.",
    icon: PenTool
  },
];

const SUBJECTS = [
  "Alle vakken",
  "aardrijkskunde",
  "biologie",
  "economie",
  "engels",
  "geschiedenis",
  "mentoraat",
  "natuurkunde",
  "nederlands",
  "scheikunde",
  "wiskunde"
];

const LEVELS = ["Alle niveaus", "Onderbouw", "Bovenbouw", "VMBO", "HAVO", "VWO", "Basisonderwijs"];
const CATEGORIES = ["Alle categorieën", "Feedback geven", "Feedback analyseren", "Fouten herkennen", "Herschrijven"];
const CONTEXTS = ["Alle contexten", "Klassikaal", "1-op-1 gesprek", "Werkhouding", "Inhoudelijk"];
const DIFFICULTIES: Difficulty[] = ["beginner", "gemiddeld", "gevorderd"];

// --- App Component ---

export default function App() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY }); // FIX: Fixed standard vite env var

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startSession = async (newConfig: SessionConfig) => {
    setConfig(newConfig);
    setIsLoading(true);
    
    const systemInstruction = `
      Je bent een gespecialiseerde didactische feedbacktrainer gebaseerd op Didactisch Coachen.
      Je helpt docenten oefenen met het geven, analyseren en verbeteren van feedback.

      Je werkt met vier feedbackdimensies:
      1. Inhoud (Wat doet de leerling? Focus op de taak/het resultaat)
      2. Strategie (Hoe pakt de leerling het aan? Focus op het proces)
      3. Modus (Hoe is de werkhouding/aanpak? Focus op zelfregulatie)
      4. Kwaliteit (Persoonlijke kwaliteiten zoals doorzettingsvermogen, nauwkeurigheid)

      Huidige configuratie:
      - Vakgebied: ${newConfig.subject}
      - Niveau: ${newConfig.level}
      - Categorie: ${newConfig.category}
      - Context: ${newConfig.context}
      - Moeilijkheidsgraad: ${newConfig.difficulty}
      - Trainingsmodus: ${newConfig.mode}

      Richtlijnen voor moeilijkheid:
      - Beginner: eenvoudige casussen, open leerlingreacties, duidelijke feedbackkansen.
      - Gemiddeld: gemengde signalen, meer nuance, meerdere dimensies tegelijk.
      - Gevorderd: weerstand, emotie, vermijding, overschatting, relationele spanning.

      Didactische uitgangspunten:
      - Geef niet meteen het perfecte antwoord.
      - Laat de gebruiker eerst zelf denken en formuleren.
      - Werk stap voor stap.
      - Maak analyse concreet en praktisch.
      - Stimuleer meta-cognitie.
      - Sluit aan op de realiteit van de klas.
      - Gebruik korte, realistische casussen.

      Specifieke instructies voor MODUS ${newConfig.mode}:
      ${newConfig.mode === "ROLLSPEL" ? `
        - Speel een realistische leerling in een klassensituatie.
        - Reageer geloofwaardig, passend bij leeftijd, niveau en context.
        - Laat gedrag, onzekerheid, weerstand of motivatie realistisch zien.
        - Wacht op feedback van de gebruiker.
        - Stap daarna uit de rol als analyse nodig is.
      ` : ""}
      ${newConfig.mode === "FEEDBACKANALYSE" ? `
        - Vraag de gebruiker om een voorbeeld van feedback die hij/zij heeft gegeven of wil geven.
        - Analyseer de feedback op inhoud, strategie, modus en kwaliteit.
        - Benoem concreet wat sterk is en wat ontbreekt.
        - Geef 1 of 2 scherpe verbeterpunten.
        - Laat de gebruiker de feedback herschrijven.
      ` : ""}
      ${newConfig.mode === "FOUTEN_HERKENNEN" ? `
        - Geef een voorbeeld van feedback.
        - Vraag de gebruiker welke feedbackdimensie ontbreekt of zwak is.
        - Geef daarna een korte, precieze terugkoppeling.
      ` : ""}
      ${newConfig.mode === "HERSCHRIJVEN" ? `
        - Geef een zwakke of algemene feedbackzin.
        - Vraag de gebruiker om die krachtiger te herschrijven.
        - Beoordeel daarna de herschreven versie op basis van de 4 dimensies.
      ` : ""}

      Begin de sessie door de situatie te schetsen of de eerste vraag te stellen passend bij de modus.
      Houd je antwoorden bondig en didactisch sterk.
      Gebruik Markdown voor structuur (vetgedrukte koppen, lijstjes).
      
      EINDIG ELK BERICHT ALTIJD MET EEN TAG IN DIT FORMAAT (indien van toepassing):
      [DIMENSIONS: Inhoud, Strategie, Modus, Kwaliteit]
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Start de sessie.",
        config: {
          systemInstruction,
        },
      });

      const fullText = response.text || "Laten we beginnen.";
      const { text, dimensions } = parseDimensions(fullText);
      setMessages([{ role: "model", text, dimensions }]);
    } catch (error) {
      console.error("Error starting session:", error);
      setMessages([{ role: "model", text: "Er is een fout opgetreden bij het starten van de sessie." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseDimensions = (text: string) => {
    const regex = /\[DIMENSIONS:\s*(.*?)\]/i;
    const match = text.match(regex);
    if (match) {
      const dims = match[1].split(',').map(d => d.trim());
      const cleanText = text.replace(regex, '').trim();
      return { text: cleanText, dimensions: dims };
    }
    return { text, dimensions: [] };
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text + (m.dimensions && m.dimensions.length > 0 ? ` [DIMENSIONS: ${m.dimensions.join(', ')}]` : '') }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `
            Je bent een gespecialiseerde didactische feedbacktrainer gebaseerd op Didactisch Coachen.
            Modus: ${config?.mode}
            Vak: ${config?.subject}
            Niveau: ${config?.level}
            Categorie: ${config?.category}
            Context: ${config?.context}
            Moeilijkheid: ${config?.difficulty}

            Na elke oefening:
            - geef een korte analyse
            - benoem de gebruikte feedbackdimensie(s) (Inhoud, Strategie, Modus, Kwaliteit)
            - benoem wat nog sterker kan
            - laat de gebruiker opnieuw proberen als dat zinvol is
            Gebruik Markdown voor structuur.

            EINDIG ELK BERICHT ALTIJD MET EEN TAG IN DIT FORMAAT:
            [DIMENSIONS: Inhoud, Strategie, Modus, Kwaliteit]
          `
        }
      });

      const fullText = response.text || "Geen reactie ontvangen.";
      const { text, dimensions } = parseDimensions(fullText);
      setMessages(prev => [...prev, { role: "model", text, dimensions }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: "model", text: "Er is een fout opgetreden bij het verwerken van je bericht." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setConfig(null);
    setMessages([]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 font-medium text-sm"
              title="Terug naar App Hub"
            >
              <Home className="w-5 h-5" />
              Hub
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={resetSession}>
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-all duration-300">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                Feedback Trainer
              </span>
            </div>
            
            {config && (
              <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-500 border-l border-slate-200 pl-8">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="capitalize">{config.subject}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span className="capitalize">{config.difficulty}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {config && (
              <button 
                onClick={() => setShowDimensions(!showDimensions)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border transition-all",
                  showDimensions 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                )}
              >
                <BrainCircuit className="w-4 h-4" />
                <span className="hidden sm:inline">Dimensies</span>
              </button>
            )}
            {config && (
              <button 
                onClick={resetSession}
                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Nieuwe sessie"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!config ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="mb-12">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                      Klaar voor de volgende stap?
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl">
                      Verbeter je didactische feedbackvaardigheden door te oefenen in realistische scenario's.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                      <SetupForm onStart={startSession} />
                    </div>
                    
                    <div className="space-y-8">
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5 text-indigo-600" />
                          Hoe het werkt
                        </h3>
                        <ul className="space-y-4">
                          {[
                            { title: "Kies je context", desc: "Selecteer vak en niveau." },
                            { title: "Selecteer modus", desc: "Rollenspel of analyse." },
                            { title: "Oefen & Leer", desc: "Krijg direct AI-feedback." }
                          ].map((step, i) => (
                            <li key={i} className="flex gap-4">
                              <span className="flex-shrink-0 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm">
                                {i + 1}
                              </span>
                              <div>
                                <p className="font-bold text-sm text-slate-800">{step.title}</p>
                                <p className="text-xs text-slate-500">{step.desc}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
                        <h3 className="font-black mb-2">Didactisch Coachen</h3>
                        <p className="text-xs text-indigo-100 leading-relaxed">
                          Deze trainer is gebaseerd op de 4 dimensies van feedback: Inhoud, Strategie, Modus en Kwaliteit.
                        </p>
                        <button 
                          onClick={() => setShowDimensions(true)}
                          className="mt-4 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
                        >
                          Bekijk Dimensies
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex gap-8 h-[calc(100vh-12rem)]">
              {/* Chat Container */}
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col bg-transparent"
              >
                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-2 space-y-10 scroll-smooth pb-8"
                >
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-6",
                        msg.role === "user" ? "flex-row-reverse" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105",
                        msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-400"
                      )}>
                        {msg.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                      </div>
                      
                      <div className={cn(
                        "max-w-[85%] p-8 rounded-[2rem] text-[16px] leading-relaxed shadow-sm transition-all relative",
                        msg.role === "user" 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100" 
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none hover:border-slate-300"
                      )}>
                        {/* Dimension Indicators */}
                        {msg.role === "model" && msg.dimensions && msg.dimensions.length > 0 && (
                          <div className="absolute -top-3 left-8 flex gap-1.5">
                            {msg.dimensions.map((dim, i) => {
                              const colors: Record<string, string> = {
                                "Inhoud": "bg-blue-500",
                                "Strategie": "bg-emerald-500",
                                "Modus": "bg-amber-500",
                                "Kwaliteit": "bg-purple-500"
                              };
                              const color = colors[dim] || "bg-slate-400";
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-tighter shadow-sm", color)}
                                >
                                  {dim}
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        <div className="prose prose-slate max-w-none prose-p:mb-4 prose-headings:mb-4 prose-headings:text-slate-900 prose-headings:font-black prose-strong:text-inherit prose-strong:font-bold">
                          {msg.text.split('\n').map((line, i) => (
                            <p key={i} className={cn(line.trim() === "" ? "h-4" : "mb-2")}>
                              {line.startsWith('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-6 h-6 text-slate-300 animate-pulse" />
                      </div>
                      <div className="bg-white border border-slate-200 p-8 rounded-[2rem] rounded-tl-none shadow-sm flex gap-2 items-center">
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="pt-6">
                  <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-15 transition duration-700"></div>
                    <div className="relative bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-3 flex items-end gap-3">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Typ je reactie of feedback..."
                        className="flex-1 bg-transparent border-none rounded-3xl px-6 py-4 text-[16px] focus:ring-0 transition-all resize-none min-h-[64px] max-h-48"
                        rows={1}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="mb-1 mr-1 p-5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-200 active:scale-90"
                      >
                        <Send className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                       <p className="text-[12px] text-slate-400 font-semibold uppercase tracking-widest">
                        <span className="text-slate-600">Enter</span> verzenden • <span className="text-slate-600">Shift+Enter</span> nieuwe regel
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sidebar Dimensions Guide */}
              <AnimatePresence>
                {showDimensions && (
                  <motion.aside 
                    initial={{ opacity: 0, x: 20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 320 }}
                    exit={{ opacity: 0, x: 20, width: 0 }}
                    className="hidden xl:flex flex-col gap-6 overflow-hidden"
                  >
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-full overflow-y-auto">
                      <div className="flex items-center gap-2 mb-6">
                        <BrainCircuit className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-black text-lg">De 4 Dimensies</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { title: "Inhoud", desc: "Wat doet de leerling? Focus op de taak of het resultaat.", color: "bg-blue-50 text-blue-700 border-blue-100" },
                          { title: "Strategie", desc: "Hoe pakt de leerling het aan? Focus op het proces.", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                          { title: "Modus", desc: "Hoe is de werkhouding? Focus op zelfregulatie.", color: "bg-amber-50 text-amber-700 border-amber-100" },
                          { title: "Kwaliteit", desc: "Persoonlijke kwaliteiten zoals doorzettingsvermogen.", color: "bg-purple-50 text-purple-700 border-purple-100" }
                        ].map((d, i) => (
                          <div key={i} className={cn("p-4 rounded-2xl border", d.color)}>
                            <h4 className="font-bold mb-1">{d.title}</h4>
                            <p className="text-xs leading-relaxed opacity-80">{d.desc}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                          "Goede feedback prikkelt de leerling om zelf na te denken over de volgende stap."
                        </p>
                      </div>
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Subcomponents ---

function SetupForm({ onStart }: { onStart: (config: SessionConfig) => void }) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [context, setContext] = useState(CONTEXTS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");

  const handleStart = () => {
    let mode: Mode = "ROLLSPEL";
    if (category === "Feedback analyseren") mode = "FEEDBACKANALYSE";
    if (category === "Fouten herkennen") mode = "FOUTEN_HERKENNEN";
    if (category === "Herschrijven") mode = "HERSCHRIJVEN";

    onStart({ subject, level, category, context, difficulty, mode });
  };

  return (
    <div className="space-y-12">
      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Onderwijs Context
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Vakgebied</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer transition-all hover:bg-white"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Onderwijsniveau</label>
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer transition-all hover:bg-white"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Trainings Instellingen
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Moeilijkheidsgraad</label>
              <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                      difficulty === d 
                        ? "bg-white text-indigo-600 shadow-sm scale-[1.02]" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    )}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Kies je Trainingsmodus
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = (m.id === "ROLLSPEL" && category === "Feedback geven") ||
                               (m.id === "FEEDBACKANALYSE" && category === "Feedback analyseren") ||
                               (m.id === "FOUTEN_HERKENNEN" && category === "Fouten herkennen") ||
                               (m.id === "HERSCHRIJVEN" && category === "Herschrijven");
            
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (m.id === "ROLLSPEL") setCategory("Feedback geven");
                  if (m.id === "FEEDBACKANALYSE") setCategory("Feedback analyseren");
                  if (m.id === "FOUTEN_HERKENNEN") setCategory("Fouten herkennen");
                  if (m.id === "HERSCHRIJVEN") setCategory("Herschrijven");
                }}
                className={cn(
                  "p-6 rounded-3xl border-2 text-left transition-all duration-300 group relative overflow-hidden",
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50" 
                    : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className={cn("font-black text-base mb-1", isSelected ? "text-indigo-900" : "text-slate-900")}>
                  {m.label}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {m.description}
                </p>
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-8">
        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-6 rounded-[2rem] font-black text-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4 group active:scale-[0.98]"
        >
          <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
          Start Trainingssessie
        </button>
        <p className="text-center text-slate-400 text-xs mt-6 font-bold uppercase tracking-widest">
          Geen account nodig • Direct oefenen • AI-gestuurd
        </p>
      </div>
    </div>
  );
}

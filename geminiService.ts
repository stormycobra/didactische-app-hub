import { GoogleGenAI, Type } from "@google/genai";
import { Case, Category, Difficulty, Feedback, Mode } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

const CASE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    level: { type: Type.STRING },
    context: { type: Type.STRING },
    category: { type: Type.INTEGER },
    caseText: { type: Type.STRING },
    goal: { type: Type.STRING },
    assignment: { type: Type.STRING },
  },
  required: ["subject", "level", "context", "category", "caseText", "goal", "assignment"],
};

const FEEDBACK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    explanation: { type: Type.STRING },
    whatWorks: { type: Type.STRING },
    whatLimits: { type: Type.STRING },
    dimensions: {
      type: Type.OBJECT,
      properties: {
        content: { type: Type.BOOLEAN },
        strategy: { type: Type.BOOLEAN },
        modus: { type: Type.BOOLEAN },
        quality: { type: Type.BOOLEAN },
        explanation: { type: Type.STRING },
      },
      required: ["content", "strategy", "modus", "quality", "explanation"],
    },
    subjectAnalysis: { type: Type.STRING },
    reformulation: { type: Type.STRING },
    followUpQuestion: { type: Type.STRING },
    judgment: { 
      type: Type.STRING,
      enum: ["basis", "redelijk sterk", "sterk", "zeer sterk"]
    },
  },
  required: ["category", "explanation", "whatWorks", "whatLimits", "dimensions", "subjectAnalysis", "reformulation", "followUpQuestion", "judgment"],
};

export async function generateCase(
  subject: string,
  level: string,
  mode: Mode,
  difficulty: Difficulty,
  category?: Category
): Promise<Case> {
  const prompt = `
    Genereer een realistische, fictieve leerlingcasus voor de training 'Didactisch Coachen'.
    Context:
    - Vak: ${subject}
    - Niveau: ${level}
    - Moeilijkheid: ${difficulty}
    - Mode: ${mode}
    ${category ? `- Categorie: ${category}` : ""}

    De casus moet een duidelijk didactisch probleem bevatten waarvoor een docent een vraag of reactie moet formuleren.
    Houd rekening met vakspecifieke denkhandelingen, strategieën en misconcepties.
    De casus moet kort en herkenbaar zijn.

    BELANGRIJK: Als het vak 'Engels' is, moet de 'caseText' (het citaat van de leerling) en de 'assignment' (de opdracht aan de docent) in het Engels zijn, omdat de docent in de doeltaal coacht. De rest van de velden (goal, context) blijven in het Nederlands.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: CASE_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}") as Case;
}

export async function evaluateResponse(
  currentCase: Case,
  teacherResponse: string
): Promise<Feedback> {
  const prompt = `
    Evalueer de volgende reactie van een docent op een leerlingcasus binnen het raamwerk van 'Didactisch Coachen'.
    
    Casus: ${currentCase.caseText}
    Oefendoel: ${currentCase.goal}
    Opdracht: ${currentCase.assignment}
    Beoogde categorie: ${currentCase.category}
    Vak: ${currentCase.subject}
    
    Reactie van de docent: "${teacherResponse}"
    
    Geef feedback volgens de vaste structuur:
    - Waarschijnlijke categorie (met uitleg waarom het 1, 2 of 3 is)
    - Wat werkt didactisch goed?
    - Wat beperkt de kracht? (Signaleer docentvalkuilen)
    - Koppeling aan inhoud/strategie/modus/kwaliteit
    - Vakgerichte analyse (sluit aan bij vakspecifieke redenering/misconcepties)
    - Sterkere herformulering (als het vak Engels is, geef de herformulering in het Engels)
    - Goede vervolgvraag (als het vak Engels is, geef de vervolgvraag in het Engels)
    - Didactisch oordeel (basis / redelijk sterk / sterk / zeer sterk)
    
    Toon: professioneel, analytisch, concreet, respectvol, zonder lege complimenten.
    De feedback zelf moet in het Nederlands zijn, maar de voorbeelden (herformulering/vervolgvraag) moeten passen bij de taal van het vak.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: FEEDBACK_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}") as Feedback;
}

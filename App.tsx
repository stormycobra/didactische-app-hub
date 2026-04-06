import { Routes, Route } from 'react-router-dom';
import HubHome from './pages/HubHome';
import CoachingApp from './pages/CoachingApp';
import FeedbackApp from './pages/FeedbackApp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HubHome />} />
      <Route path="/coaching" element={<CoachingApp />} />
      <Route path="/feedback" element={<FeedbackApp />} />
    </Routes>
  );
}

export default App;

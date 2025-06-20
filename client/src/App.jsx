import MeetingRoom from "./components/MeetingRoom";
import HomePage from "./pages/HomePage";
import { Routes, Route } from 'react-router-dom'
import Participants from "./components/Participants";

const App = () => {

  return (
      <div>
          <Routes>
             <Route path="/" element={<HomePage/>} />
             <Route path="/meeting/:id" element={<MeetingRoom/>} />
             <Route path="/participants" element={<Participants/>} />
          </Routes>
      </div>
  );
};

export default App;

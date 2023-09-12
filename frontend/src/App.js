import "./App.css";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";
import Videochat from "./pages/videoChat";
import Setavatar from "./pages/setAvatar";
import Voicechat from "./pages/voiceChat";
import EmailVerify from "./pages/emailVerify";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        {/* <Route path="/verify" element={<EmailVerify />}></Route> */}
        <Route path="/chats" element={<Chatpage />}></Route>
        <Route path="/room/:roomId" element={<Videochat />}></Route>
        <Route path="/voice/:voiceId" element={<Voicechat />}></Route>
        <Route path="/setAvatar" element={<Setavatar />}></Route>
      </Routes>
    </div>
  );
}

export default App;

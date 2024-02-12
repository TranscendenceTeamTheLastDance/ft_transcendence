import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import Signwith42 from "./components/LoginSignup/Signwith42";
import Home from "./components/Home/Home";
import User from "./pages/UserPage";
import { UserProvider } from "./context/UserContext";
import { AuthAxiosProvider } from "./context/AuthAxiosContext";
import Chat from "./pages/ChatPage";

function App() {
  return (
    <UserProvider>
      <AuthAxiosProvider>
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/signwith42" element={<Signwith42 />} />
          <Route path="/home" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </AuthAxiosProvider>
    </UserProvider>
  );
}

export default App;

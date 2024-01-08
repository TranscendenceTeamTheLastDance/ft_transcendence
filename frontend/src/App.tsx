import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginSignup from './components/LoginSignup/LoginSignup';
import Home from './components/Home/Home';
import { ConversationChannelPage } from './pages/ConversationChannelPage';
import { ConversationPage } from './pages/ConversationPage';
import User from './components/User/User';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginSignup />} />
      <Route path="/home" element={<Home />} />
	  <Route path="/user" element={<User />} />
      <Route path="conversations" element={<ConversationPage />}>
        <Route path=":id" element={<ConversationChannelPage />} />
      </Route>
    </Routes>
  );
}

export default App;

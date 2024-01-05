// import logo from './logo.svg';
import './App.css';
import React from 'react';
import LoginSignup from './components/LoginSignup/LoginSignup';
import { Route, Routes } from 'react-router-dom';
import { ConversationChannelPage } from './pages/ConversationChannelPage';
import { ConversationPage } from './pages/ConversationPage';

function App() {
  return (
    <>
      <div>
        <LoginSignup/>
      </div>
      <Routes>
        <Route path="conversations" element={<ConversationPage />}>
          <Route path=":id" element={<ConversationChannelPage />} />
        </Route>
      </Routes>
    </>
    
    
  );
}

export default App;
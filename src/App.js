import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WordsList from './components/WordsList';
import UserStats from './components/UserStats';  // <-- 追加
import SearchComponent from './components/SearchComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';

function App() {
    return (
        <Router>
            <div>
                <h1>タイ語の単語リスト</h1>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/words" element={<WordsList />} />
                    <Route path="/:username/learning-progress" element={<UserStats />} />  
                    <Route path="/search" element={<SearchComponent />} />
                    <Route path="/login" element={<LoginComponent />} />
                    <Route path="/register" element={<RegisterComponent />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

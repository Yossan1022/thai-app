import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterComponent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // エラーをクリア

        if (password !== confirmPassword) {
            setError('パスワードと確認用パスワードが一致しません。');
            return;
        }

        try {
            console.log(username, password);  // これをfetchの前に追加
            const response = await fetch('http://localhost:5001/api/auth/register', {
                
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                navigate('/words'); // /wordsへリダイレクト
            } else {
                const data = await response.json();
                setError(data.message || '登録に失敗しました。');
            }
        } catch (error) {
            setError('サーバーエラーが発生しました。');
        }
    };

    return (
        <div>
            <h2>登録</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ユーザー名:</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </div>
                <div>
                    <label>パスワード:</label>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                <div>
                    <label>確認用パスワード:</label>
                    <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                </div>
                <div>
                    <button type="submit">登録</button>
                </div>
            </form>
        </div>
    );
}

export default RegisterComponent;

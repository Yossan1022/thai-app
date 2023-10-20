import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginComponent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // エラーをクリア
    
        try {
            const response = await fetch('http://localhost:5001/api/auth/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token); // JWTをlocalStorageに保存
                navigate('/words'); // /wordsへリダイレクト
            } else {
                const data = await response.json();
                setError(data.message || 'ログインに失敗しました。');
            }
        } catch (error) {
            setError('サーバーエラーが発生しました。');
        }
    };
    

    return (
        <div>
            <h2>ログイン</h2>
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
                    <button type="submit">ログイン</button>
                </div>
            </form>
            <p>アカウントをお持ちでない場合は、<Link to="/register">こちら</Link> から登録してください。</p>
        </div>
    );
}

export default LoginComponent;

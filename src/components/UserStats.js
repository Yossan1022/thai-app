import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // <-- 追加

function UserStats() {
    const { username } = useParams();  // <-- 追加

    const [stats, setStats] = useState({
        totalLearned: 0,
        quizResults: [],
        averageScore: 0,
        highestScore: 0,
        learnedWordsProgress: []
    });

    useEffect(() => {
        async function fetchStats() {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`http://localhost:5001/api/users/${username}/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    console.error(`Error fetching user stats: ${response.statusText}`);
                }
            } catch (err) {
                console.error("Error fetching user stats:", err);
            }
        }
        fetchStats();
    }, [username]);
    

    return (
        <div>
            <h2>{username}さんの学習状況</h2>
            <p>学習した単語数: {stats.totalLearned}</p>
            <p>クイズの平均スコア: {stats.averageScore}</p>
            <p>クイズの最高スコア: {stats.highestScore}</p>
            {/* ここにさらなる統計やデータを表示するコードを追加できます */}
        </div>
    );
}

export default UserStats;

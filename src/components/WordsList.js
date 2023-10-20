import React, { useState, useEffect } from 'react';

function WordsList() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [userName, setUserName] = useState(""); // 1. userName stateを追加
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0); 

  // 2. ユーザーデータをフェッチするためのuseEffect
  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if (token && username) {
        try {
          const response = await fetch(`http://localhost:5001/api/users/${username}/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (response.ok) {
            const data = await response.json();
            setUserName(data.username);
          } else {
            console.error(`Error fetching user data: ${response.statusText}`);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    }
    fetchUserData();
  }, []);
  
// 単語リストを取得する関数
useEffect(() => {
  async function fetchWords() {
      try {
          const response = await fetch("http://localhost:5001/api/words");
          if (response.ok) {
              const data = await response.json();
              setWords(data);
          } else {
              console.error(`Error fetching words: ${response.statusText}`);
          }
      } catch (err) {
          console.error("Error fetching words:", err);
      }
  }
  fetchWords();
}, []);


function checkAnswer() {
  if (selectedAnswer === words[currentIndex].answer) {
    setIsCorrect(true);
    setCorrectAnswersCount(prevCount => prevCount + 1); // カウンターを更新
  } else {
    setIsCorrect(false);
  }
  setTimeout(nextQuestion, 1000);
}

function nextQuestion() {
  if (currentIndex < words.length - 1) {
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
  } else {
    alert('クイズ終了！');
    saveQuizResults(correctAnswersCount, words.length);
  }
}

async function saveQuizResults(correctCount, totalCount) {
  // ここで結果をサーバーに送信するロジックを実装する
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`http://localhost:5001/api/users/${userName}/quizresult`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correctCount, totalCount })
    });

    if (!response.ok) {
      const text = await response.text();
  console.error("Server response:", text);
      const data = await response.json();
      console.error(`Error saving quiz results: ${data.error}`);
    }
  } catch (err) {
    console.error("Error saving quiz results:", err);
  }
  console.log(`正解数: ${correctCount}, 総問題数: ${totalCount}`);
}


  return (
    <div>
      {userName && <h2>{userName}さん、タイ語のクイズを始めます!</h2>}
      {words.length > 0 && (
        <div>
          <p>タイ語: {words[currentIndex].thai}</p>
          {words[currentIndex].choices.map((choice, index) => (
            <div key={index}>
              <label>
                <input 
                  type="radio" 
                  name="choices" 
                  value={choice}
                  onChange={() => setSelectedAnswer(choice)}
                />
                {choice}
              </label>
            </div>
          ))}
          <button onClick={checkAnswer}>答える</button>
          {isCorrect === true && <p>正解!</p>}
          {isCorrect === false && <p>不正解。</p>}
        </div>
      )}
    </div>
  );
}


export default WordsList;

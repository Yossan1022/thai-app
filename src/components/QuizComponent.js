import React, { useState, useEffect } from 'react';

function QuizComponent({ username, questions }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  }

  const handleNextQuestion = async () => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
      try {
        const response = await fetch(`http://localhost:5001/api/users/${username}/quiz-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            score: score,
            total: questions.length
          })
        });
        if (!response.ok) {
          throw new Error('Failed to submit quiz result');
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  if (quizFinished) {
    return (
      <div>
        <h2>Quiz Finished!</h2>
        <p>Your score is: {score} / {questions.length}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{questions[currentQuestionIndex].question}</p>
      {questions[currentQuestionIndex].answers.map((answer, index) => (
        <div key={index}>
          <input 
            type="radio"
            name="answer"
            checked={selectedAnswer === index}
            onChange={() => handleAnswerSelect(index)}
          />
          {answer}
        </div>
      ))}
      <button onClick={handleNextQuestion}>
        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
      </button>
    </div>
  );}  
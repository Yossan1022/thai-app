const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // 追加
const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  learnedWords: [{
    wordId: { type: Schema.Types.ObjectId, ref: 'Word' },
    dateLearned: { type: Date, default: Date.now }
  }],
  quizResults: [{
    date: { type: Date, default: Date.now },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    date: Date,
    score: Number,
    total: Number
  }],
  averageScore: Number,
    highestScore: Number,
    learnedWordsProgress: [String]  
});


// パスワードをハッシュ化するためのミドルウェアを追加
userSchema.pre('save', async function(next) {
 
});

const User = model('User', userSchema);

module.exports = User;

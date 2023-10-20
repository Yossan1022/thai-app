const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const express = require('express');
const router = express.Router();

const wordSchema = new Schema({
  thai: String,
  english: String,
  pronunciation: String,
  exampleSentence: String,
});

const Word = model('Word', wordSchema);

// 全ての単語を取得
router.get('/', async (req, res) => {
  try {
    const words = await Word.find();
    res.json(words);
  } catch (error) {
    console.error(error);  // エラーの詳細をログに記録
    res.status(500).send(`Server Error: ${error.message}`);  // エラーメッセージをクライアントに返す
  }
});

// 新しい単語を追加
router.post('/', async (req, res) => {
  const { thai, english, pronunciation, exampleSentence } = req.body;

  try {
    const newWord = new Word({ thai, english, pronunciation, exampleSentence });
    const savedWord = await newWord.save();
    res.json(savedWord);
  } catch (error) {
    res.status(500).send(`Server Error: ${error.message}`);

  }
});

module.exports = router;



router.get('/search', async (req, res) => {
  const searchTerm = req.query.q;
  try {
    const words = await Word.find({
      $or: [{ thai: new RegExp(searchTerm, 'i') }, { english: new RegExp(searchTerm, 'i') }]
    });
    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

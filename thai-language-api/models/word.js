const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const wordSchema = new Schema({
  thai: String,
  english: String,
  pronunciation: String,
  exampleSentence: String,
  choices: [String],   // add this
  answer: String       // add this
});


const Word = model('Word', wordSchema);

module.exports = Word;




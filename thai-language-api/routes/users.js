const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const cors = require('cors');

router.use('/login', (req, res, next) => {
  console.log('Login endpoint accessed:', req.method, req.headers, req.body);
  next();
});
const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // フロントエンドのURL
  allowedHeaders: ['Content-Type', 'Authorization'], // Authorizationヘッダーの許可
  methods: ['GET', 'POST', 'PUT', 'DELETE'] // 許可するHTTPメソッド
}));
const saltRounds = 10;
router.post('/register', [
  check('username').not().isEmpty(),
  check('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  const user = new User({
    username: req.body.username,
    password: hashedPassword, // 既にミドルウェアでハッシュ化されるので、ここでは生のパスワードを使用
    learnedWords: [],
    quizResults: []
  });

  try {
    await user.save();
    res.status(201).send();
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error (username already exists)
      res.status(400).send('Username already exists');
    } else {
      res.status(500).send('Server error');
    }
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).send('Incorrect username or password');
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);  // エラーログの出力
    res.status(500).send('Server error');
  }
});

// ユーザーの学習結果を保存
router.post('/:username/learned', async (req, res) => {
  const { username } = req.params;
  const { wordId } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");
    if (!user.learnedWords.includes(wordId)) {
      user.learnedWords.push(wordId);
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

// クイズの結果を保存
router.post('/:username/quiz-result', async (req, res) => {
  const { username } = req.params;
  const { score, total } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");
    user.quizResults.push({ date: new Date(), score, total });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

// ユーザーの統計データを取得
router.get('/:username/stats', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");
    // 必要な統計データを計算して返す
    const totalLearned = user.learnedWords.length;
    const lastQuizResult = user.quizResults[user.quizResults.length - 1];
    res.json({ totalLearned, lastQuizResult });
  } catch (error) {
    res.status(500).send(`Server Error: ${error.message}`);
  }
});
// ユーザーがクイズを終了したときに呼び出されるエンドポイント
router.post('/finish-quiz', async (req, res) => {
  const { username, learnedWords, score, total } = req.body;

  try {
    const user = await User.findOne({ username });

    // ユーザーが存在しない場合のエラーハンドリング
    if (!user) return res.status(404).send("User not found");

    // 学習した単語を追加
    user.learnedWords.push(...learnedWords);

    // クイズの結果を追加
    user.quizResults.push({ date: new Date(), score, total });

    await user.save();

    res.status(200).send('Quiz results and learned words saved successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

router.post('/api/users/:username/quiz', async (req, res) => {
  const { username } = req.params;
  const { score, learnedWords } = req.body;

  try {
      let stats = await UserStats.findOne({ username });

      if (!stats) {
          stats = new UserStats({ username });
      }

      // クイズの結果を追加
      stats.quizResults.push({ score, date: new Date() });

      // その他の統計を更新
      stats.totalLearned += learnedWords.length;
      stats.learnedWordsProgress = [...new Set([...stats.learnedWordsProgress, ...learnedWords])];

      const totalScores = stats.quizResults.reduce((acc, curr) => acc + curr.score, 0);
      stats.averageScore = totalScores / stats.quizResults.length;
      stats.highestScore = Math.max(...stats.quizResults.map(result => result.score));

      await stats.save();

      res.status(200).send({ message: 'Quiz results saved successfully!' });

  } catch (error) {
      res.status(500).send({ message: 'Error saving quiz results' });
  }
});

router.get('/api/users/:username/stats', async (req, res) => {
  const { username } = req.params;

  try {
      const stats = await UserStats.findOne({ username });

      if (!stats) {
          return res.status(404).send({ message: 'User not found' });
      }

      res.status(200).send(stats);

  } catch (error) {
      res.status(500).send({ message: 'Error fetching user stats' });
  }
});


module.exports = router;

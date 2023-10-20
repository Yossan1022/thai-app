const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const wordRoutes = require('./routes/words');
const authRoutes = require('./routes/users');  // 新しく追加
const User = require('./models/user'); 

require('dotenv').config();
const app = express();
const PORT = 5001;

// MongoDBへの接続
mongoose.connect('mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});

// CORSの設定の追加
app.use(cors({
    origin: 'http://localhost:3000',  // Reactのデフォルトのポートは3000です。必要に応じて変更してください。
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // PUT, DELETE, OPTIONSも追加
    allowedHeaders: ["Content-Type", "Authorization"]  // "Authorization"を追加
}));

app.use(express.json());

// エンドポイントの整合性をとるために、/api/wordsに変更
app.use('/api/words', wordRoutes);

// 認証関連のエンドポイントを追加
app.use('/api/auth', authRoutes);  // 新しく追加

app.get('/', (req, res) => {
    res.send('Hello from Thai Language API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
app.get('/api/users/:username/stats', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found");

        const totalLearned = user.learnedWords.length;
        const quizResults = user.quizResults || [];
        const averageScore = quizResults.length ? quizResults.reduce((acc, quiz) => acc + (quiz.score || 0), 0) / quizResults.length : 0;
        const highestScore = quizResults.length ? Math.max(...quizResults.map(quiz => quiz.score || 0)) : 0;
        

        // 学習の進行データの取得
        const learnedWordsProgress = computeLearningProgressData(user);

        const stats = {
            totalLearned: totalLearned,
            quizResults: quizResults,
            averageScore: averageScore,
            highestScore: highestScore,
            learnedWordsProgress: learnedWordsProgress  // この行を追加
        };

        res.json(stats);
    } catch (error) {
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

function computeLearningProgressData(user) {
    // Convert learnedWords into an array of dates
    const dates = user.learnedWords.map(word => word.dateLearned.toISOString().split('T')[0]);

    // Count the occurrences of each date
    const dateCounts = dates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Convert the dateCounts object into an array
    const learningProgressData = Object.keys(dateCounts).map(date => ({
        date,
        count: dateCounts[date]
    }));

    return learningProgressData;
}

app.post('/api/users/:username/learn', async (req, res) => {
    const { username } = req.params;
    const { wordId } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found");

        user.learnedWords.push({
            wordId: wordId
        });

        await user.save();
        res.status(200).send("Word learned successfully");
    } catch (error) {
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Route for words
app.use('/api/words', wordRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Hello from Thai Language API!');
});
// server.js

app.post('/api/users/:username/quiz', async (req, res) => {
    const { username } = req.params;
    const { score, date } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found");

        user.quizResults.push({
            score: score,
            date: date || new Date()
        });

        await user.save();
        res.status(200).send("Quiz result saved successfully");
    } catch (error) {
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

app.post('/quiz/results', async (req, res) => {
    const { username, correctAnswers, incorrectAnswers } = req.body;

    const user = await User.findOne({ username: username });
    if (user) {
        user.quizResults.push({
            date: new Date(),
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers
        });
        await user.save();
        res.status(200).send({ message: 'Results saved successfully.' });
    } else {
        res.status(404).send({ message: 'User not found.' });
    }
});

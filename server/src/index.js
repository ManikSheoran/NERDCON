const express = require('express');

const moongose = require('mongoose');
const route = require('../routes');

const app = express();
const PORT = process.env.PORT || 3000;

moongose.connect('mongodb://localhost:27017/nerdcon', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});
 
app.get('/', (req, res) => {
    res.send('Hello, World!');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
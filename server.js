const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const app = express();

// MongoDB Config
const db = config.get('mongoURI');

// Connect to MongoDB
mongoose
  .connect(db, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }) // Adding new mongo url parser
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

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

// Bind default connection to error event (to get notification of connection errors)
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

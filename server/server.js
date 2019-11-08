const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const testRouter = require('./routes/testRouter');

const app = express();

// Body parsing middleware
app.use(express.json());

// MongoDB Config
const db = config.get('mongoURI');

// Connect to MongoDB
mongoose.connect(db, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const connection = mongoose.connection;

// Bind default connection to error event (to get notification of connection errors)
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

connection.once('open', function() {
  console.log("MongoDB connected...");
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

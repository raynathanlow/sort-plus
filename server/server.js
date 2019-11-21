const express = require('express');
const session = require('express-session');

const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');
const config = require('config');

const authorizationRouter = require('./routes/authorizationRouter');
const libraryRouter = require('./routes/library');

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

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

app.use(session({
  name: 'GozegeSession',
  secret: 'uzPGdq3LedYXJg2pWp23YbTGCFXRgXuc',
  resave: false, // Forces session to be saved back to the session store
  saveUninitialized: false // Forces "uninitialized" session to be saved to the store
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/login', authorizationRouter);
app.use('/library', libraryRouter);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

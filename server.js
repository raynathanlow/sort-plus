const express = require("express");
const session = require("express-session");
const path = require("path");

const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const config = require("config");

const authorization = require("./routes/api/authorization");
const libraryRouter = require("./routes/api/library");

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB Config
const db = config.get("mongoURI");

// Connect to MongoDB
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const { connection } = mongoose;

// Bind default connection to error event (to get notification of connection errors)
connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);

connection.once("open", () => {
  console.log("MongoDB connected...");
});

app.use(
  session({
    name: "GozegeSession",
    secret: "uzPGdq3LedYXJg2pWp23YbTGCFXRgXuc",
    resave: false, // Forces session to be saved back to the session store
    saveUninitialized: false // Forces 'uninitialized' session to be saved to the store
  })
);

app.use("/api/login", authorization);
app.use("/api/library", libraryRouter);

app.use(express.static(path.join(__dirname, "client/build")));

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

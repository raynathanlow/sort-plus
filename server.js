const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session); // Session store backed by MongoDB
const path = require("path"); // NodeJS 'path' module
const mongoose = require("mongoose"); // MongoDB object modeling tool

require("dotenv").config(); // Dotenv config

const authorization = require("./routes/api/authorization");
const libraryRouter = require("./routes/api/library");

const app = express();

// Body parsing middleware
app.use(express.json());

// MongoDB Config
const db = process.env.MONGO_URI;

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

const store = new MongoStore({ mongooseConnection: connection });

const sess = {
  name: "id",
  secret: process.env.SESSION_SECRET,
  rolling: true, // Force session identifier cookie to be set on every response. Also resets expiration
  resave: false, // Forces session to be saved back to the session store
  saveUninitialized: false, // Forces 'uninitialized' session to be saved to the store
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7776000000 // 90 days in milliseconds
  },
  store
};

// Only use secure cookies in production
if (app.get("env") === "production") {
  sess.cookie.secure = true; // serve secure cookies
}

app.set("trust proxy", 1); // trust first proxy
app.use(session(sess));

app.set("store", store);

// Router objects
app.use("/api/authorization", authorization);
app.use("/api/library", libraryRouter);

// Serve React files
app.use(express.static(path.join(__dirname, "client/build")));

// Serve React with client-side routing - note the /* instead of /
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

const port = process.env.PORT || 3001;

// Binds and listens for connections on specified host and port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

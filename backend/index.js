const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  removeUser,
  createTeam,
  getTeam,
} = require("./controllers/apiFunctions");
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.send("The server is running , this is just a test route");
});

app.get("/api/users/:id", (req, res) => getUserById(req, res));
app.get("/api/users", (req, res) => getUsers(req, res));
app.get("/api/team/:id", (req, res) => getTeam(req, res));
app.post("/api/users", (req, res) => addUser(req, res));
app.post("/api/team", (req, res) => createTeam(req, res));
app.put("/api/users/:id", (req, res) => updateUser(req, res));
app.delete("/api/users/:id", (req, res) => removeUser(req, res));

mongoose
  .connect(process.env.DB_URL, {})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

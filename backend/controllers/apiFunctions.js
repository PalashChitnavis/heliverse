const Team = require("../models/Team");
const User = require("../models/User");
async function getUsers(req, res) {
  try {
    const { domain, gender, availability, search, page } = req.query;
    let query = {};

    if (domain) {
      query.domain = domain;
    }
    if (availability) {
      query.available = availability === "Available" ? true : false;
    }
    if (gender) {
      query.gender = gender;
    }

    const perPage = 20;
    const skip = (parseInt(page) || 0) * perPage;

    const users = await User.find(query).skip(skip).limit(perPage);
    if (search) {
      const searchUsers = await User.find({
        $text: { $search: search, $caseSensitive: false },
      });
      if (JSON.stringify(query) === JSON.stringify({})) {
        res.send(searchUsers);
        return;
      }
      const common = searchUsers.filter((element1) =>
        users.some((element2) => element1.id === element2.id)
      );
      res.send(common);
      return;
    }
    res.send(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getUserById(req, res) {
  const { id } = req.params;
  const lastUser = await User.findOne().sort({ id: -1 }).select("id");
  if (id <= 0 || id > lastUser) {
    res.json({ message: "No such user" });
    return;
  }
  const user = await User.findOne({ id: id });
  res.json(user);
}
async function addUser(req, res) {
  const { first_name, last_name, email, gender, domain, available } = req.body;
  if (!(first_name && last_name && email && gender && domain && available)) {
    res.send({
      message:
        "All field (first_name, last_name, email, gender, domain, available) are required",
    });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  const lastUser = await User.findOne().sort({ id: -1 });
  let newId = 1;
  if (lastUser) {
    newId = lastUser.id + 1;
  }

  const newUser = new User({
    id: newId,
    first_name,
    last_name,
    email,
    gender,
    domain,
    available,
  });

  const savedUser = await newUser.save();
  res.send({ message: "New User Created", details: savedUser });
}
async function updateUser(req, res) {
  const { id } = req.params;
  const lastUser = await User.findOne().sort({ id: -1 }).select("id");
  if (id <= 0 || id > lastUser) {
    res.json({ message: "No such user" });
    return;
  }
  const { first_name, last_name, email, gender, domain, available } = req.body;
  if (!(first_name && last_name && email && gender && domain && available)) {
    res.send({
      message:
        "All field (first_name, last_name, email, gender, domain, available) are required",
    });
    return;
  }
  const updatedUser = await User.findOneAndUpdate({ id: id }, req.body, {
    new: true,
  });
  res.send({ message: "User Has Been Updated", details: updatedUser });
}
async function removeUser(req, res) {
  const { id } = req.params;
  const lastUser = await User.findOne().sort({ id: -1 }).select("id");
  if (id <= 0 || id > lastUser) {
    res.json({ message: "No such user" });
    return;
  }
  const deletedUser = await User.findOneAndDelete({ id });

  if (!deletedUser) {
    return res.status(404).json({ message: "No such user" });
  }

  res.send({ message: "User Has Been Deleted", details: deletedUser });
}
async function createTeam(req, res) {
  const team = req.body;
  const lastTeam = await Team.findOne().sort({ id: -1 });
  let newId = 1;
  if (lastTeam) {
    newId = lastTeam.id + 1;
  }
  const newTeam = new Team({
    id: newId,
    members: team,
  });

  const savedTeam = await newTeam.save();
  res.send({ message: "New Team Created", details: savedTeam });
}
async function getTeam(req, res) {
  const { id } = req.params;
  const lastTeam = await Team.findOne().sort({ id: -1 }).select("id");
  if (id <= 0 || id > lastTeam) {
    res.json({ message: "No such Team" });
    return;
  }
  const team = await Team.findOne({ id: id });
  if (!team) {
    res.json({ message: "No such Team" });
    return;
  }
  res.json(team);
}
module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  removeUser,
  createTeam,
  getTeam,
};

const dotenv = require("dotenv");
const express = require("express");
const app = express();
const port = 3000;
const jwt = require("jsonwebtoken");


dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


let students = [
  {
    id: 1,
    username: "Sahil",
    content: "I Love coding",
    password: 123,
  },
  {
    id: 5,
    username: "Sushan",
    content: "I love gaming",
    password: 345,
  },
];


app.listen(port, (req, res) => {
  console.log(`App is listening on ${port}`);
});

app.post("/student", (req, res) => {
    const { username, password } = req.body;
    let user;
    for (let student of students) {
      if (username === student.username) {
        user = student;
        // console.log(user);
      }
    }
    if (!user) {
      return res.send("user unavailable");
    }
    if (user.password != password) {
      return res.send("invalid credentials");
    }
    const payload = {
      username: username,
    };
    const secret_key = process.env.Secret_Key;
    const token = jwt.sign(payload, secret_key);
  
    return res.json({ msg: "user logged in", token: token });
  });

const middleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.send("Token not found");
  }
  const token = authorization.split(" ");
  const decoded_token = token[1];
  if (!decoded_token) {//If there is no jwt in the token
    return res.send("Bearer token not present");
  }
  const secret_key = process.env.Secret_Key;
  let data;
  try {
    data = jwt.verify(decoded_token, secret_key);
  } catch (error) {
    console.log(error.message);
    return res.send("Invalid token");
  }
  if (!data) {
    return res.send("Forbidden request");
  }
  req.user = data.username;
  next();
};

app.get("/student", middleware, (req, res) => {
  res.send(students);
});


app.post("/student/add", middleware, (req, res) => {
  students.push({
    id: 2,
    username: "Nishan",
    content: "I am good at NodeJS",
    password: 789,
  });
  res.send(students);
});

app.patch("/student/:id", middleware, (req, res) => {
  let id = Number(req.params.id);
  console.log(id);
  console.log(typeof id);
  let student = students.find((s) => id === s.id);
  console.log(student);

  if (!student) {
    return res.status(404).send({ error: "Student not found" });
  }
  student.content = "I Love Innovating";
  console.log(student);
  res.send(student);
});

app.delete("/student/:id", middleware, (req, res) => {
  let id = Number(req.params.id);
  let student = students.find((s) => id === s.id);

  if (!student) {
    return res.status(404).send({ error: "Student not found" });
  } else {
    students = students.filter((s) => id != s.id);
  }
  res.send(students);
});

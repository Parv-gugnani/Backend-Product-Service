const express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

const User = require("./model/User");
const flash = require("connect-flash");

let app = express();

mongoose.connect("mongodb://localhost:27017/prod");

app.use(flash());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "Rusty is a Dog",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROUTING

//home page
app.get("/", function (req, res) {
  res.render("secret");
});

app.get("/secret", function (req, res) {
  res.render("secret");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const user = await User.register(
      new User({ username: req.body.username }),
      req.body.password
    );
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// app.post("/login", async function (req, res) {
//   try {
//     const user = await User.findOne({ username: req.body.username });

//     if (user) {
//       const result = req.body.password === user.password;
//       if (result) {
//         res.render("secret");
//       } else {
//         res.status(400).json({ error: "Password does't Match 🙊" });
//       }
//     } else {
//       res.status(400).json({ error: "User does't exist 🙉" });
//     }
//   } catch (error) {
//     res.status(400).json({ error });
//   }
// });

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/"); //redirecting to home page
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
let port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`The server is running on http://localhost:3000/`);
});

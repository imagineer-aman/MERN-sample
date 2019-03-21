const express = require("express");
const router = express.Router();
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../../models/User");
const SECRET = require("../../config/keys").secretOrKey;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Passport Config
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET
}, (payload, done) => {
    User.findOne({
            email: payload.email
        })
        .then(user => done(null, user));
}));

//Protect viewUsers route with JWT
router.get(
    "/viewUsers",
    passport.authenticate("jwt", {
        "session": false
    }),
    (req, res) => {
        // Return users list
        User.find((err, users) => {
            if (err) {
                return res.status(400).json(err);
            }
            return res.status(200).json(users);
        })
    }
);

// Route Register - unprotected
router.post("/register", (req, res) => {
    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            return res.status(400).json({
                email: "Email already exists"
            });
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            // Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

// Route Login - unprotected
router.post("/login", (req, res) => {
    User.findOne({
        email: req.body.email
    }).then(user => {
        // Check email
        if (!user) {
            return res.status(400).json({
                error: "Email doesn't exist!"
            });
        }

        // Check password
        bcrypt.compare(req.body.password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched
                // Create JWT Payload
                const payload = {
                    email: user.email,
                    name: user.name
                };

                // Sign token
                jwt.sign(
                    payload,
                    SECRET, {
                        expiresIn: 31556926 // 1 year in seconds
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                );
            } else {
                return res
                    .status(400)
                    .json({
                        passwordincorrect: "Password incorrect!"
                    });
            }
        });
    });
});

module.exports = router;
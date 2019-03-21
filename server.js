const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/api/users");
const bodyParser = require("body-parser")

const app = express();
// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// MongoDB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
    .connect(
        db, {
            useNewUrlParser: true
        }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

// Routes
app.use("/api/users", usersRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
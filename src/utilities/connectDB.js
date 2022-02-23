const mongoose = require("mongoose");
const { MONGODB_URI } = require("./config");

const mongoUri = MONGODB_URI;
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
};

const connectDB = () => {
  mongoose
    .connect(mongoUri, mongoOptions)
    .then(() => {
      console.log("DB connected");
    })
    .catch((error) => {
      console.log("Error connecting DB:", error.message);
      process.exit(0);
    });
};

module.exports = {
  connectDB,
};

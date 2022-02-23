const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const hashPassword = (plainTextPassword) => {
  const hash = bcrypt.hashSync(plainTextPassword, SALT_ROUNDS);
  return hash.toString();
};

const comparePassword = (inputPassword, hash) => {
  return bcrypt.compareSync(inputPassword, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};

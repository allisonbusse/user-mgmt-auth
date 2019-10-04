require('dotenv').config();
const connect = require('../connect');
require('../models/register-plugins');
const User = require('../models/user');
const mongoose = require('mongoose');

connect(process.env.MONGODB_URI);

// node filename.js <user-id>
const userId = process.argv[2];

// or maybe you have a User.addRole ...?
User.updateById(
  userId,
  { 
    $addToSet: { 
      roles: 'admin'
    }
  }
)
  .then(console.log)
  .catch(console.log)
  .finally(() => mongoose.connection.close());
const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  uploadAvatar
} = require('../controllers/userController');

const User = require('../models/User');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(advancedResults(User), getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser);

router.route('/:id/avatar').put(uploadAvatar);

module.exports = router;

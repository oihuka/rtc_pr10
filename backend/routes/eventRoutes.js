const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  attendEvent,
  cancelAttendance
} = require('../controllers/eventController');

const Event = require('../models/Event');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Event, [
      { path: 'creator', select: 'name avatar' },
      { path: 'attendees', select: 'name avatar' }
    ]),
    getEvents
  )
  .post(protect, createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.route('/:id/image').put(protect, uploadEventImage);
router.route('/:id/attend').put(protect, attendEvent);
router.route('/:id/cancel').put(protect, cancelAttendance);

module.exports = router;

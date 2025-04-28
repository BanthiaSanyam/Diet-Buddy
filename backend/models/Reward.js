const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coins: {
    type: Number,
    default: 0
  },
  activities: [{
    type: {
      type: String,
      enum: ['workout', 'steps', 'post', 'comment', 'milestone']
    },
    coins: Number,
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }]
});

module.exports = mongoose.model('Reward', RewardSchema); 
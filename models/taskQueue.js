const mongoose = require('mongoose');

const taskQueueSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true
    },
    package: {
        type: String,
        required: true
    },
    link: [String],
    range: {
        type: String,
    },
    max_quantity: {
        type: Number,
        required: true
    },
    min_quantity: {
        type: Number,
        required: true
    },
    isRun: {
        type: Boolean
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date, // The date when the cron job should stop
        required: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'Account', 
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const TaskQueue = mongoose.model('TaskQueue', taskQueueSchema);

module.exports = TaskQueue;

const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'problem'
    }],
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest;

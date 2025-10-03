const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    stepId: { type: mongoose.Schema.Types.ObjectId, ref: 'Step', required: true },
    formIndex: { type: Number},
    name: { type: String, required: true },
    type: { type: String, enum: ['text', 'radio', 'checkbox', 'number'], required: true },
    options: { type: Array },
    required: { type: Boolean, default: false },
});

module.exports = mongoose.model('Form', FormSchema);
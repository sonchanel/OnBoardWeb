const express = require('express');
const router = express.Router();
const Step = require('../models/step');
const Form = require('../models/form');

var user = null;
async function check(req){
const id = req.cookies['id']
const password = req.cookies['password']
user = await User.findOne({_id:id});
}

router.post('/steps/create', async (req, res) => {
    try {
        const newStep = new Step({
            quyTrinhId: req.body.quyTrinhId,
            name: req.body.name,
            type: req.body.type,
            required: req.body.required || false,
            completed: false
        });

        await newStep.save();
        res.status(201).json({ message: "Bước mới đã được tạo!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo bước!", error });
    }
});

// GET step chi tiết theo ID, bao gồm câu hỏi nếu type là 'form'
router.get('/:id', async (req, res) => {
    try {
        const step = await Step.findById(req.params.id);
        if (!step) return res.status(404).json({ message: 'Step không tồn tại' });

        let data = { step };

        // Nếu là bước dạng form, thì truy vấn toàn bộ câu hỏi
        if (step.type === 'form') {
            const forms = await Form.find({ stepId: step._id }).sort({ formIndex: 1 });
            data.forms = forms;
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Step = require('../models/step');
const Form = require('../models/form');
const FormAnswer = require('../models/formanswer');
const User = require('../models/user');
const User_Quytrinh = require('../models/user_quytrinh');

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

router.get('/step-answers/:stepId/:userId', async (req, res) => {
    const { stepId, userId } = req.params;
    try {
      const forms = await Form.find({ stepId });
  
      const formIds = forms.map(f => f._id);
      const answers = await FormAnswer.find({ formId: { $in: formIds }, userId }).populate('formId');
  
      res.json(answers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi khi lấy câu trả lời' });
    }
  });

router.get('/:id', async function(req, res, next) {
    try {
        await check(req);
        const nhanvienId = req.params.id;
    
        // Lấy tất cả câu trả lời theo userId
        const answers = await FormAnswer.find({ userId: nhanvienId }).populate('formId');
        // console.log(answers)
        const formIds = answers.map(a => a.formId);
        // console.log(formIds)
        // 2. Tìm tất cả form chứa trong formIds
        const forms = await Form.find({ _id: { $in: formIds } }).select('stepId');

        const stepIds = forms.map(f => f.stepId);

        // 3. Tìm các bước tương ứng và lọc theo type
        const steps = await Step.find({ _id: { $in: stepIds }, type: 'form' });
        const nhanvien = await User.findById(nhanvienId);

        const quytrinh = await User_Quytrinh.findOne({ userId: nhanvienId }).populate('quyTrinhId');

    
        res.render('Form', {nhanvien, answers, user, steps, quytrinh });
      } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi tải câu trả lời.');
      }
});

module.exports = router;

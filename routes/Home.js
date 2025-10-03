var express = require('express');
var router = express.Router();
var User = require('../models/user')
var User_QuyTrinh = require('../models/user_quytrinh')
var Step = require('../models/step');
var Form = require('../models/form');
var File = require('../models/file');
const FormAnswer = require('../models/formanswer'); // Đường dẫn đến model FormAnswer
const { SchemaTypes } = require('mongoose');
const Quytrinh = require('../models/quytrinh');

var user = null;
async function check(req){
const id = req.cookies['id']
const password = req.cookies['password']
user = await User.findOne({_id:id});
}

router.post('/submit-answer', async (req, res) => {
  try {
    const { userId, stepId, answers } = req.body;

    if (!userId || !stepId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Thiếu dữ liệu bắt buộc.' });
    }

    let updatedCount = 0;
    let createdCount = 0;

    for (const ans of answers) {
      const formIdMatch = ans.name?.match(/^form_(.+)$/);
      if (!formIdMatch) continue;

      const formId = formIdMatch[1];
      const answerValue = ans.value;

      const existing = await FormAnswer.findOne({ formId, userId });

      if (existing) {
        // Update nếu đã tồn tại
        existing.answer = answerValue;
        existing.submittedAt = new Date();
        await existing.save();
        updatedCount++;
      } else {
        // Tạo mới nếu chưa có
        await FormAnswer.create({
          formId,
          userId,
          answer: answerValue,
          submittedAt: new Date()
        });
        createdCount++;
      }
    }

    if (updatedCount + createdCount === 0) {
      return res.status(400).json({ error: 'Không có câu trả lời hợp lệ.' });
    }

    res.status(200).json({
      message: 'Đã lưu câu trả lời thành công.',
      updated: updatedCount,
      created: createdCount
    });
  } catch (err) {
    console.error('Lỗi khi lưu form answer:', err);
    res.status(500).json({ error: 'Lỗi server khi lưu câu trả lời.' });
  }
});

// Route to update current step
router.post('/update-step', async (req, res) => {
  const { userId, currentStepIndex } = req.body;

  try {
    const user = await User_QuyTrinh.findOne({ userId: userId });
    const quytrinh = await Quytrinh.findOne({ _id: user.quyTrinhId })
    // console.log(quytrinh)
    const stepNumber = await Step.countDocuments({ quyTrinhId: quytrinh._id });
    // console.log(stepNumber, " ", currentStepIndex)
    if(currentStepIndex == stepNumber){
      await User_QuyTrinh.updateOne({ userId: userId }, { $set: { step: currentStepIndex } });
      await User.updateOne({ _id: userId }, { $set: { status: "Hoàn thành" } });
      res.status(200).send({ message: 'Bạn đã hoàn thành!' });
    }else{
    if(user.step < currentStepIndex){
    // Cập nhật thông tin người dùng trong cơ sở dữ liệu
    await User_QuyTrinh.updateOne({ userId: userId }, { $set: { step: currentStepIndex } });
    await User.updateOne({ _id: userId }, { $set: { status: "Onboarding" } });
    // Trả về phản hồi thành công
    res.status(200).send({ message: 'Cập nhật bước thành công!' });
    }else{
      res.status(400).send({ message: 'Bạn không thể cập nhật bước này!' });
    }
  }
  } catch (error) {
    res.status(500).send({ message: 'Lỗi khi cập nhật bước người dùng', error });
  }
});

// Route để lấy thông tin tiến trình người dùng
router.get('/get-user-progress/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Tìm người dùng trong database
    const user = await User_QuyTrinh.findOne({ userId: userId });

    if (!user) {
      return res.status(404).send({ message: 'Không tìm thấy người dùng' });
    }

    // Trả về bước hiện tại mà người dùng đã hoàn thành
    res.status(200).json({ currentStepIndex: user.step });
  } catch (error) {
    res.status(500).send({ message: 'Lỗi khi lấy thông tin tiến trình', error });
  }
});



router.get('/', async function(req, res, next) {
  await check(req)
  // console.log(user)
  const quytrinh = await User_QuyTrinh.findOne({ userId: user._id }).populate('quyTrinhId')
  // console.log(quytrinh)
  let step = []
  if(quytrinh){
    step = await Step.find({ quyTrinhId: quytrinh.quyTrinhId._id }).lean();

    for (let s of step) {
      if (s.type === "form") {
        const forms = await Form.find({ stepId: s._id }).lean();
    
        // Lấy toàn bộ câu trả lời của user cho bước này
        const answers = await FormAnswer.find({ userId: user._id }).lean();
        // Gắn câu trả lời vào từng form
        for (let form of forms) {
          const answer = answers.find(a => a.formId.toString() === form._id.toString());
          if (answer) {
            form.answer = answer.answer;  // value có thể là string hoặc array (nếu checkbox)
          }
        }
    
        s.forms = forms;
      }

      if (s.type === "document") {
        const files = await File.find({ stepId: s._id }).lean();
        s.files = files; // Gắn danh sách file vào step
      }
    }
  }
  // console.log(step[5])
  res.render('Home', { data: quytrinh ,user: user, step:step});
});

module.exports = router;
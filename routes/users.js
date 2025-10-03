var express = require('express');
var router = express.Router();
var User = require('../models/user')
const bcrypt = require('bcrypt');

var user = null;
async function check(req,res){
const id = req.cookies['id']
const password = req.cookies['password']
user = await User.findOne({_id:id});
if(!user || !await bcrypt.compare(password,user.password)){
  res.redirect('/Dangnhap')
}
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/Profile',async function(req, res, next) {
  let manager = null;
  await check(req,res)
  if(user.manager){
    manager = await User.findOne({_id:user.manager})
    // console.log(manager);
  }
  res.render('Profile', { user: user, manager: manager});
});

router.put('/update/:id', async function(req, res, next) {
  await check(req,res)
  try {
      const { name, email, phone, address } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Tên và email là bắt buộc' });
      }
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedUser) {
          return res.status(404).json({ error: 'Người dùng không tồn tại' });
      }
      res.json(updatedUser); // Trả về dữ liệu đã cập nhật
  } catch (error) {
      console.error("Lỗi cập nhật:", error);
      res.status(500).json({ error: 'Lỗi server' });
  }
});

router.put('/change-password/:id', async (req, res) => {
  try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
          return res.status(400).json({ error: "Thiếu thông tin" });
      }

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "Người dùng không tồn tại" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ error: "Mật khẩu hiện tại không đúng" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();

      res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
      res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

router.post('/logout', (req, res) => {
    res.clearCookie('id');
    res.clearCookie('password');
    res.sendStatus(200);
});

router.post('/dangki', function(req, res, next) {
  var user = req.body;
  User.create({
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    address: user.address,
    role: user.role,
    group: user.group,
    manager: user.manager,
    status: user.status,
    time: user.time,
    document: user.document
  }).then(data=>{
    res.json("Tao thanh cong")
  }).catch(err=>{
    res.status(500).json("Tao that bai")
  })
})

module.exports = router;

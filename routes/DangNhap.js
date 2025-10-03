var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser')
var app = express();
var User = require('../models/user')

// router.post('/register', async (req, res) => {
//   console.log('a')
//   const { username, email, password, confirmPassword } = req.body;
//   if (!username || !email || !password || !confirmPassword) {
//     return res.status(400).json({ error: 'Hãy nhập đầy đủ thông tin' });
//   }
//   if (password.length < 8) {
//     return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 kí tự'});
//   }
//   // Kiểm tra password và confirmPassword
//   if (password !== confirmPassword) {
//       return res.status(400).json({ error: 'Nhập sai mật khẩu' });
//   }
//   // Mã hóa mật khẩu
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Kiểm tra xem email đã tồn tại chưa
//   const email_existed = await req.truyvan(`SELECT * FROM Users WHERE email = '${email}'`)
//   console.log(email_existed.length)
//   if(email_existed.length > 0){
//     return res.status(400).json({ error: 'Email đã tồn tại' });
//   }
//   const username_existed = await req.truyvan(`SELECT * FROM Users WHERE username = '${username}'`)
//   if(username_existed.length > 0){
//     return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
//   }
//   try{
//       // Thêm người dùng mới vào database
//       const query = `INSERT INTO Users (username, email, password) VALUES ('${username}','${email}','${hashedPassword}')`
//       console.log(query)
//       req.truyvan(query)
//   }catch{
//           if (err) {
//               return res.status(400).json({ error: 'Đăng kí không thành công' });
//           }
//   }
//   return res.status(200).json({ message: 'Đăng kí thành công' });
// });


router.post('/login', async (req, res) => {
  const {email, password} = req.body;
  // console.log(email)
  if(!email || !password){
    return res.status(400).json({ error: 'Hãy nhập đầy đủ thông tin' });
  }
  const user = await User.findOne({ email: email });
  // console.log(user)
  if(user){
    if(await bcrypt.compare(password, user.password)){
      console.log('Passwords match! User authenticated.');
      res.cookie('password',password,{ expires: new Date(Date.now() + 2592000000)})
      res.cookie('id',user._id,{ expires: new Date(Date.now() + 2592000000)})
      //return res.redirect('/TaiKhoan')
      return res.status(200).json({ message: 'Đăng nhập thành công' });
    }else{
      console.log('Passwords do not match! Authentication failed.');
      return res.status(400).json({ error: 'Sai tài khoản hoặc mật khẩu' });
    }
  }else{
    return res.status(400).json({ error: 'Tài khoản không tồn tại' });
  }
});

router.post('/forget', async (req, res) => {
  
});



/* GET home page. */
router.get('/',async function(req, res, next) {
  const idcheck = req.cookies['id'];
  const passwordcheck = req.cookies['password'];
  if (idcheck && passwordcheck) {
    const user = await User.findOne({ _id: idcheck });
    const username = user.name
    const userpassword = user.password
    if(await bcrypt.compare(passwordcheck,userpassword)){
      // console.log(user.role)
      if(user.role === "Quản lý"){
        console.log("quanly")
        return res.redirect('/')
      }else if(user.role === "Nhân viên"){
        return res.redirect('/Home')
      }else if(user.role === "Admin"){
        return res.redirect('/Admin')
      }
    }
    }
    res.render('DangNhap', { title: 'Express' ,
      message: 'Hello, World!',
      A : ['1','2','3']
    });
});


module.exports = router;

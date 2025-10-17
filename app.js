var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt');
var dotenv = require('dotenv');
dotenv.config();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var DangnhapRouter = require('./routes/DangNhap');
var QuytrinhRouter = require('./routes/Quytrinh');
var ThanhvienRouter = require('./routes/Thanhvien');
var StepRouter = require('./routes/Step');
var HomeRouter = require('./routes/Home');
var uploadRoute = require('./routes/upload');
var FormRoute = require('./routes/Form');
var AdminRoute = require('./routes/Admin');


var app = express();

//Connect db
var connectDB = require('./connect');
connectDB(process.env.DB_URI);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var User = require('./models/user')
var user = null;
var checkLogin = async function(req, res, next){
  console.log("AAA")
  const id = req.cookies['id']
  const password = req.cookies['password']
  if(!id||!password){
    console.log("---")
    res.redirect('/Dangnhap')
  }
  else{
    user = await User.findOne({_id:id});
    console.log(user + password)
    if(await bcrypt.compare(password, user.password)){
      console.log("next")
      return next()
    }else{
      res.clearCookie('id');
      res.clearCookie('password');
      res.redirect('/Dangnhap')
    }
  }
}

var checkManager = async function(req, res, next){
  if(user.role === "Quản lý"){
    return next()
  }else{
    console.log("manage")
    res.redirect('/Dangnhap')
  }
}

var checkAdmin = async function(req, res, next){
  if(user && user.role === "Admin"){
    return next()
  }else{
    console.log("admin-only")
    res.redirect('/Dangnhap')
  }
}

app.use('/Dangnhap', DangnhapRouter);
app.use('/users',checkLogin, usersRouter);
app.use('/Quytrinh',checkLogin,checkManager, QuytrinhRouter);
app.use('/Thanhvien',checkLogin,checkManager, ThanhvienRouter);
app.use('/Step',checkLogin,checkManager, StepRouter);
app.use('/Upload', uploadRoute);
app.use('/Home',checkLogin ,HomeRouter);
app.use('/Form',checkLogin,checkManager,FormRoute);
app.use('/Admin',checkLogin,checkAdmin, AdminRoute);

app.use('/',checkLogin,checkManager, indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const express = require('express')
const path = require('path') //path 모듈 추가(안하면 5번행 오류)
const app = express()
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb')
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local') //로그인




app.use(express.static(path.join(__dirname, 'public'))) //퍼블릭 폴더안에 파일들 등록()
app.use(express.static(path.join(__dirname, 'dist')))
app.set('view engine', 'ejs') //ejs셋팅
app.use(express.json())
app.use(express.urlencoded({extended:true})) 
//app.use('/', require('./../router/login.js'))
app.use(cors());

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false,
  cookie: { secure: false }
}))
app.use(passport.session()) //로그인 라이브러리




app.listen(3000, '172.16.111.168' ,() =>{
  console.log('http://172.16.111.168:3000 에서 서버 실행중')
}) //서버열기


/*mongoose.connect('mongodb+srv://rjsdnmm1230:1234@cluster0.rzo2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log("MongoDB 연결 성공");
  })
  .catch((err) => {
    console.log(err);
  }); */


let connectDB = require('./datavase.js')

let db 
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
})  //DB 연결코드 


app.get('/', (요청, 응답) => {
    응답.sendFile(path.join(__dirname, 'dist/main.html')) //뷰에서 빌드받은 폴더 안에 html전송
})
                                              
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ userid : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }
  if (result.password == 입력한비번) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
})) //아이디 비번이 맞는지 db에서 확인하는 코드(라이브러리)

passport.serializeUser((user, done) => {
  console.log(user)
  process.nextTick(() => {
    done(null, { id: user._id, userid: user.userid, username :user.username})
  })
})

passport.deserializeUser(async(user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
  process.nextTick(() => {
    return done(null, user)
  })
})

app.get('/login', async (요청,응답)=>{
  console.log(요청.user)
  응답.render('login')
})

app.post('/login', (요청,응답,next)=>{
  passport.authenticate('local', (error,user,info)=>{
      if (error) return 응답.status(500).json(error)
      if (!user) return 응답.status(401).json(info.message) 
      
      const { userid, username } = user

      요청.logIn(user, (err)=>{
        if (err) return next(err)
          응답.json({ message: '로그인 성공',
                      user :{
                        userID : userid,
                        username : username
                      }
                      
        });
   })  
  })(요청, 응답, next)
})// 로그인 기능 

app.get('/register', (요청, 응답)=>{
  응답.render('register.ejs')
})

app.post('/register', async(요청,응답)=>{
  await db.collection('user').insertOne({
      username : 요청.body.username,
      userid : 요청.body.userid,
      password : 요청.body.password
  })
  응답.redirect('/login')
})//회원가입기능


  app.get('/mypage', async (요청, 응답) => {
    if (요청.isAuthenticated()) {
      try {
        // DB에서 요청한 유저의 정보 가져오기 (세션의 userid로 찾기)
        let result = await db.collection('user').findOne({ userid: 요청.user.userid });
        console.log('DB 조회 결과: ', result);
        
        // 유저 정보가 존재할 경우 응답
        if (result) {
          응답.json({ userId: result.userid, nickname: result.username });
        } else {
          응답.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
      } catch (error) {
        console.error("DB 요청 중 에러 발생:", error);
        응답.status(500).json({ message: '서버 에러' });
      }
    } else {
      응답.status(401).json({ message: '로그인먼저해주세요' });
    }
  });
  
  app.get('/post', (요청, 응답)=>{
    응답.render('post.ejs')
  })

  app.post('/api/posts', async (요청, 응답) => {
    try {
      console.log('게시물 생성:', 요청.body); // 서버 로그 확인
      const tags = 요청.body.tags ? 요청.body.tags.split(',').map(tag => tag.trim()) : [];
      
      await db.collection('post').insertOne({
        title: 요청.body.title,
        content: 요청.body.content,
        tags: tags,
        image: 요청.body.image
      });
  
      응답.status(201).json({ message: '게시물 생성 성공' });
    } catch (err) {
      console.error('Error inserting post:', err); // 오류 로그
      응답.status(500).json({ message: '게시물 생성 중 오류가 발생했습니다.', error: err });
    }
  });
  



  
  
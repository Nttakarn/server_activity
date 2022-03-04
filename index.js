const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const multer = require('multer');
const knex = require("knex");
const { raw } = require("body-parser");

const db = knex({
  client: "mysql",
  connection: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASS || "",
    database: process.env.MYSQL_DB || "end_project",
    supportBigNumber: true,
    timezone: "+7:00",
    dateStrings: true,
    charset: "utf8mb4_unicode_ci",
  },
});

const app = express();

//var mysql = require("mysql");

//var con = mysql.createConnection({
//  host: "localhost",
// user: "root",
//  password: "12345678",
//  database: "dve_tvet",
//});
// app.use(bodyParser.json());
// app.use(express.static("./public"));
// app.use(cors());
// app.use(fileUpload());

app.use(bodyParser.urlencoded({extended: true})) 
// SET STORAGE
var storage = multer.diskStorage({
  destination:  (req, file, cb) => {
    cb(null, '/Desktop/project/VueE1/static/image')
  },
  filename:  (req, file, cb) => {
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
    cb(null, 'Img-' + Date.now() + ext )
  }
})
 
var upload = multer({ storage: storage })

app.use((req, res, next) => {
  var header = { 'Access-Control-Allow-Origin': '*'}
  for (var i in req.headers){
      if (i.toLowerCase().substr(0, 15) === 'access-control-'){
          header[i.replace(/-request-/g, '-allow-')] = req.headers[i]
      }
  }
  //res.header(header)  // แบบเก่า
  res.set(header)   // แบบใหม่
  next()
})


app.post("/login",bodyParser.json(), async (req, res) => {
  console.log(req.body);
  // check require
  if (req.body.ID_student == "" || req.body.Password == "") {
    res.send({
      massenge: "กรุณาตรวจสอบชื่อผู้หรือรหัส",
      status: "fail",
    })
  }
  let row = await db("user").where("ID_student", "=", req.body.ID_student) .where("Password", "=", req.body.Password)
  console.log("row", row)
  console.log("row ความยาว", row.length)
  if (row.length > 0) {
    res.send({
      status: "ok",
      rows: row,
    })
  } else {
    res.send({
      status: "no",
    })
  }
})

app.get('/logUser', async (req, res) => {
  console.log('logUser',req.query)
  let row = await db.raw('SELECT * FROM user WHERE ID_student = ' + req.query.ID_student)
  console.log("row", row[0])
  res.send({
    status: 'ok',
    rows: row
  })
})




app.post('/insert_user', bodyParser.json(), async (req, res) => {
  console.log(req.body)
  console.log('req.body.ID_student',req.body.ID_student)
  if (req.body.Con_Password != req.body.Password) {// เช็ค pass ว่าตรงกันไหม
    return res.send({
      massenge: "กรุณาตรวจสอบชื่อผู้หรือรหัส",
      status: "fail",
    });
  }
  let row = await db('user') // เช็ค ID_student ว่ามีคนใช้ยัง
  console.log('row[0].ID_student',row[0].ID_student)
  // console.log('row',row)
  if(req.body.ID_student === row.ID_student) {
    res.send({
      status: 'false',
    })
  }else{
    let row = await db('user')
    .insert({
      ID_student: req.body.ID_student,
      Title: req.body.Title,
      Firstname: req.body.Firstname,
      Class: req.body.Class,
      Department: req.body.Department,
      Password: req.body.Password
    })

    res.send({
      status: 'ok',
      rows: row
    })
  }
  

app.listen(7000, () => {
  console.log("ready for server ACT : TAN:7000");
});

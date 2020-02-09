const mongoose = require('mongoose');
const express = require('express');
const User = require('../models/user')
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config.js');
const url = 'mongodb://127.0.0.1:27017/tasks'
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectID;
const saltRounds = 10;

mongoose.connect(url, { useNewUrlParser: true })
mongoose.set('useFindAndModify', false);
const db = mongoose.connection
db.once('open', _ => {
  console.log('Database connected:', url)
})

db.on('error', err => {
  console.error('connection error:', err)  
})

function verifyToken(req, res, next) {
  if(!req.headers.authorization)
    return res.status(401).send('Unauthorized request')
  let token = req.headers.authorization.split(' ')[1]
  if(token === null)
    return res.status(401).send('Unauthorized request')
  let payload = jwt.verify(token, config.secret)
  if(!payload)
    return res.status(401).send('Unauthorized request')
  req.userId = payload.subject
  next()
}

router.get('/', (req, res) => {
    res.send("From api route")
})

router.post('/register', (req, res) => {
    let userData = req.body;
    bcrypt.hash(userData.password, saltRounds, function(err, hash) {
      let user = new User({email: userData.email, password: hash})
      user.save((error, registeredUser)=> {
          if(error)
              console.log(error)
          else {
            let payload = { subject: registeredUser._id }
            let token = jwt.sign(payload, config.secret)
            res.status(200).send({token})
          }
  
      })
    })
})

router.post('/login', (req, res) => {
  let userData = req.body;
  
  User.findOne({email: userData.email}, (err, user) => {
    if(err)
      console.log(err)
    else {
      if(!user) {
        res.status(401).send('Invalid email')
      } else {
        bcrypt.compare(userData.password, user.password, function(err, result) {
          if(result === true) {
            let payload = { subject: user._id }
            let token = jwt.sign(payload, config.secret)
            res.status(200).send({token})
          } else {
            res.status(401).send('Invalid password')
          }
        })
      }
    }
  })  
})

router.post('/add', verifyToken, (req, res) => {
  let task = req.body;
  let userId = req.userId
  User.findOneAndUpdate(
    { _id: req.userId }, 
    { $push: { tasks: task  } },
    { new: true},
    function (error, user) {
        if (error) {
            console.log(error);
        } else {
            res.status(200).send(user.tasks[user.tasks.length - 1])
        }
  });
})

router.get('/getTasks', verifyToken, (req, res) => {
  let userId = req.userId
  User.findById(userId, (err, user) => {
    if(!user)
      res.status(401).send('User not found')

    if(err)
      console.log(err)

    res.status(200).send(user.tasks)

  })
})

router.post('/edit', verifyToken, (req,res) => {
  console.log(req.body)
  User.updateOne(
    {  "tasks._id": req.body._id },
    { $set: { "tasks.$.title":  req.body.title, "tasks.$.description":  req.body.description }  },
    function(err, status) {
      if(err)
        console.log(err)
      else {
        res.status(200).send(req.body)
      }
    }
  );

})

router.post('/remove', verifyToken, (req,res) => {
  res.status(200).send()
  User.findOneAndUpdate(
    {  "tasks._id": req.body._id },
    { $pull: { "tasks":  { '_id': req.body._id } }  },
    function(err, status) {
      if(err)
        console.log(err)
      else {
        res.status(200).send()
      }
    }
  );

})

module.exports = router
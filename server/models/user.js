const mongoose = require('mongoose')
const Schema = mongoose.Schema
const taskSchema = new Schema({
    title: String,
    description: String,
})
const userSchema = new Schema({
    email: String,
    password: String,
    tasks: [{
        title: String,
        description: String,
    }]
})


module.exports = mongoose.model('user', userSchema, 'users')

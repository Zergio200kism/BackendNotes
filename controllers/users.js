const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User=require('../models/user')


usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body
    console.log('password recibido:', password) 
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
  
    const user = new User({
      username,
      name,
      passwordHash,
    })
    
    const savedUser = await user.save()
    console.log(savedUser)
    response.status(201).json(savedUser)
})

usersRouter.get('/',(request,response)=>{
    User.find({}).populate('notes', { content: 1, important: 1 }).then(users =>{response.send(users)})
})

module.exports = usersRouter
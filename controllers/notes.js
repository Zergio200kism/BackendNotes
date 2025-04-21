const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', (request, response) => {
  Note.find({}).populate('user', { username: 1, name: 1 }).then(notes => {
    response.json(notes)
  })
})

notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

notesRouter.post('/', async (request, response, next) => {
  const body = request.body
  const user = await User.findById(body.userId)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })


  const savedNote= await note.save()

  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote) 
})

notesRouter.delete('/:id',async (request, response, next) => {

  //Como ya instale el paquete express-async-errors no hace falta usar el try catch 
  // Note.findByIdAndDelete(request.params.id)
  //   .then(() => {
  //     response.status(204).end()
  //   })
  //   .catch(error => next(error))


  //Ahora de haber u nerror automaticante se llama al middle de error next(error)
    await Note.findByIdAndDelete(request.params.id)
    response.status(204).end()

})

notesRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findById(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch(error => next(error))
})

module.exports = notesRouter
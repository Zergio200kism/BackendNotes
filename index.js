//Con express

//Para acceder a las variables del archivo .env  Solo hace falta ejecutarlo una vez
require('dotenv').config()


const express = require('express')
const Note = require('./models/note')

const app = express()
let notes = []


//Importamos el middleware cors
const cors=require('cors')

//Llamamos el middleware cors para facilitar la comunicacion entre frontend y backend
//en caso ambos se encuentren separados
app.use(cors())

//Creamos un middleware para que cuando el backend reciba una solicitud HTTP , 
// este middeware me imprima en consola info de peticion realizada
const requestLogger = (request,response,next) =>{
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()   
}
//Usamos el middleware
app.use(requestLogger)
// express.json() es un middleware.
// Se encarga de leer el body en formato JSON y convertirlo en un objeto JS automáticamente en request.body.
// Sin él, request.body será undefined en una POST que envíe JSON.
app.use(express.json())
app.use(express.static('dist'))

//Este es otro middleware
const morgan=require('morgan')
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
  })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//Creamos otro middleware para enviar un repuesta http 404 en caso la ruta de la peticion http
//no coincida con ninguna de las rutas que declaramos mas abajo
const unknownEndpoint= (request,response)=>{
    response.status(404).send({error:'unknown Endpoint'})
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes=> response.json(notes)) 
})

app.get('/api/notes/:id',(request,response) =>{
        const id= request.params.id
        //const note=notes.find(note=> note.id === id)
        const note=Note.findById(id).then(note => response.json(note)).catch(error => {
          response.status(400).send({ error: 'malformatted id' })
        })
    }
)
app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then((savedNote) => {
    response.json(savedNote)
  })
})

app.delete('/api/notes/:id',async (request,response)=>{
    const id=request.params.id

    try {
      const result = await Note.deleteOne({ _id: id });
  
      if (result.deletedCount === 1) {
        response.json({exito:"Elemento eliminado con exito"}); // ✅ Eliminado con éxito, sin contenido
      } else {
        response.status(404).send({ error: 'Note not found' }); // ❌ No se encontró el documento
      }
    } catch (error) {
      response.status(400).send({ error: 'Malformatted id' }); // ⚠️ ID inválido
    }
})

app.put('/api/notes/:id', async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        content: body.content,
        important: body.important,
      },
      {
        new: true,            // <- Retorna el documento ya actualizado
        runValidators: true,  // <- Ejecuta validaciones definidas en el esquema
        context: 'query'      // <- Necesario para algunas validaciones
      }
    );

    if (updatedNote) {
      response.json(updatedNote);
    } else {
      response.status(404).send({ error: 'Note not found' });
    }
  } catch (error) {
    console.error(error);
    response.status(400).send({ error: 'Malformatted ID or validation error' });
  }
});


app.put(`/api/notes/:id`,(request,response)=>{
    const id=request.params.id;
    const body=request.body;
    const index=notes.findIndex(person => person.id ==id)
    notes[index]=body;
    response.json(notes[index])
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


// Sin express
// const http = require('http')

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })

// const PORT = 3001
// app.listen(PORT)
// console.log(`Server running on port ${PORT}`)
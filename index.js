//Con express
const express = require('express')
const app = express()
const morgan=require('morgan')
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
  })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const cors=require('cors')

//Esta linea es importante para que nuestro front end pueda cominicarse con back end

app.use(cors())


//Para poder hacer mas facil las peticiones de tipo post
// express.json() es un middleware.
// Se encarga de leer el body en formato JSON y convertirlo en un objeto JS automáticamente en request.body.
// Sin él, request.body será undefined en una POST que envíe JSON.


const requestLogger = (request,response,next) =>{
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()   
}

const unknownEndpoint= (request,response)=>{
    response.status(404).send({error:'unknown Endpoint'})
}
app.use(express.json())
app.use(requestLogger)

let notes = [
    {
        "id": "1",
        "content": "HTML is easy",
        "important": true
      },
      {
        "id": "2",
        "content": "Browser can execute only JavaScript",
        "important": false
      },
      {
        "id": "3",
        "content": "GET and POST are the most important methods of HTTP protocol",
        "important": true
      },
      {
        "id": "4",
        "content": "GET and POST are the most important methods of HTTP protocol",
        "important": true
      }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id',(request,response) =>{
        const id= request.params.id
        const note=notes.find(note=> note.id === id)
        
        if (note){
            response.json(note)
        }else{
            response.status(404).end()
        }


    }
)

app.delete('/api/notes/:id',(request,response)=>{
    const id=request.params.id
    notes= notes.filter(note => note.id != id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => Number(n.id)))
      : 0
    return String(maxId + 1)
}
  
app.post('/api/notes', (request, response) => {
    const body = request.body
  
    if (!body.content) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
  
    const note = {
      content: body.content,
      important: body.important || false,
      id: generateId(),
    }
  
    notes = notes.concat(note)
  
    response.json(note)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
// Sin express
// const http = require('http')

// let notes = [
//     {
//       id: "1",
//       content: "HTML is easy",
//       important: true
//     },
//     {
//       id: "2",
//       content: "Browser can execute only JavaScript",
//       important: false
//     },
//     {
//       id: "3",
//       content: "GET and POST are the most important methods of HTTP protocol",
//       important: true
//     }
//   ]
// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })

// const PORT = 3001
// app.listen(PORT)
// console.log(`Server running on port ${PORT}`)
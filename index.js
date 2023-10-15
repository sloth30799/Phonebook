const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")

morgan.token("body", (req, res) =>
  req.method === "POST" ? JSON.stringify(req.body) : null
)

app.use(cors())

app.use(express.json())
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ")
  })
)

app.use(express.static("dist"))

let data = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

const generateId = () => {
  return Math.floor(Math.random() * 100)
}

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${data.length} people <br /> ${new Date()}</p>`
  )
})

app.get("/api/persons", (req, res) => {
  res.json(data)
})

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  const person = data.find((p) => p.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.post("/api/persons", (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "person data missing",
    })
  }

  const existingPerson = data.find((p) => p.name === body.name)

  if (existingPerson) {
    return res.status(400).json({
      error: "name must be unique",
    })
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  data = data.concat(newPerson)

  res.json(newPerson)
})

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  data = data.filter((p) => p.id !== id)

  res.status(204).end()
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

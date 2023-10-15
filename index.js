require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

morgan.token("body", (req) =>
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

app.get("/info", (req, res, next) => {
  Person.find({})
    .then((persons) =>
      res.send(
        `<p>Phonebook has info for ${
          persons.length
        } people <br /> ${new Date()}</p>`
      )
    )
    .catch((error) => {
      next(error)
    })
})

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => res.json(persons))
    .catch((error) => {
      next(error)
    })
})

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.post("/api/persons", (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "person data missing",
    })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson
    .save()
    .then((savedPerson) => {
      res.json(savedPerson)
    })
    .catch((error) => {
      next(error)
    })
})

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))

  res.status(204).end()
})

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((error) => next(error))
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

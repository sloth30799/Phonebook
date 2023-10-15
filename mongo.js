const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("need password!")
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://sloth30799:${password}@cluster0.yb5bjlc.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model("Person", personSchema)

const name = process.argv[3]
const number = process.argv[4]

const person = new Person({
  name,
  number,
})

if (process.argv.length === 5) {
  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

if (process.argv.length === 3) {
  Person.find({}).then((people) => {
    people.forEach((p) => {
      console.log(p)
    })
    mongoose.connection.close()
  })
}

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')
const helper = require('./test_helper')


beforeEach(async () => {
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)
})

describe('addition of a new user', () => {
  test('POST request creates a new user', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "greeter",
      name: 'Hello McGreeterson',
      password: "helloThere"
    }
  
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(
      'greeter'
    )
  })

  // TODO: add tests to test username requirement validation for user operations
  test('user creation fails if username not provided', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  // TODO: add tests to test username length validation for user operations
  
  // TODO: add tests to test username uniqueness validation for user operations
  
  // TODO: add tests to test password requirement validation for user operations
  
  // TODO: add tests to test username length validation for user operations
})

afterAll(() => {
  mongoose.connection.close()
})
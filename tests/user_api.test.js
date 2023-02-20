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
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)
  
    const usernames = usersAtEnd.map(n => n.username)
    expect(usernames).toContain(
      'greeter'
    )
  })
})

afterAll(() => {
  mongoose.connection.close()
})
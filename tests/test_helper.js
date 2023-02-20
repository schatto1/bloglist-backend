const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
  {
    title: "This is the first blog post.",
    author: "Bloggy McBloggerson",
    url: "first-blog",
    likes: 0
  },
  {
    title: "This is a second blog post.",
    author: "Writing McWriterson",
    url: "second-blog",
    likes: 5
  }
]

const initialUsers = [
  {
    username: "testy", 
    name: "Test McTesterson",
    password: bcrypt.hash("testing", 10)
  },
  {
    username: "blogger",
    name: "Bloggy McBloggerson",
    password: bcrypt.hash("blogging", 10)
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, blogsInDb, usersInDb
}
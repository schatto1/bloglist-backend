const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "This is the first blog post.",
    author: "Testy McTesterson",
    url: "first-blog",
    likes: 0
  },
  {
    title: "This is a second blog post.",
    author: "Bloggy McBloggerson",
    url: "second-blog",
    likes: 5
  }
]

const initialUsers = [
  {
    username: "testy", 
    name: "Test McTesterson",
    password: "testing"
  },
  {
    username: "blogger",
    name: "Bloggy McBloggerson",
    password: "blogging"
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user')
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({}).populate('blogs')
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, blogsInDb, usersInDb
}
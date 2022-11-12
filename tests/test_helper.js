const Blogs = require('../models/blog')

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

module.exports = {
  initialBlogs
}
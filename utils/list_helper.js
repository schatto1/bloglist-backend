const _ = require('lodash')

const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce((sum, current) => sum + current, 0)
}

const favoriteBlog = (blogs) => {
  const maxValue = Math.max(...blogs.map(blog => blog.likes))

  return blogs.length === 0
    ? {}
    : blogs.find(blog => blog.likes === maxValue)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const authors = _.groupBy(blogs, "author")

  Object.keys(authors).forEach( (key) => {
    authors[key] = authors[key].length
  })

  const mostBlogAuthor = _.max(Object.keys(authors), author => authors[author])

  const mostBlogsObject = {
    author: mostBlogAuthor,
    blogs: authors[mostBlogAuthor]
  }

  return mostBlogsObject
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const authors = _.groupBy(blogs, "author")

  const authorLikes = Object.keys(authors).map( key => {
    return {
      author: key,
      likes : authors[key].reduce( (sum, element) => sum + element['likes'], 0)
    }
  })

  const mostLikesAuthor = _.maxBy(authorLikes, 'likes')

  return mostLikesAuthor

}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}


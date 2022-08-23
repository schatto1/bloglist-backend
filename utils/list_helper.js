const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce((sum, current) => sum + current, 0)
}

const favoriteBlog = (blogs) => {
  const maxValue = Math.max(...blogs.map(blog => blog.likes))

  return blogs.length === 0
    ? {}
    : blogs.find(blog => blog.likes === maxValue)
}

module.exports = {
  totalLikes,
  favoriteBlog
}


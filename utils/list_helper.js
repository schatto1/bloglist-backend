const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce((sum, current) => sum + current, 0)
}

module.exports = {
  totalLikes
}
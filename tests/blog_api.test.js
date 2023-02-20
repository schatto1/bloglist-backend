const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blog posts are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blog posts have unique identifier property "id"', async () => {
    const response = await api.get('/api/blogs')
  
    response.body.forEach(blog => expect(blog.id).toBeDefined())
  })
})

describe('addition of a new blog', () => {
  test('POST request creates a new blog post', async () => {
    const newBlog = {
      title: 'this is a newly added blog post',
      author: "Testy McTesterson",
      url: "added-by-test",
      likes: 6
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
      'this is a newly added blog post'
    )
  })
  
  test('if likes missing, defaults to zero', async () => {
    const newBlog = {
      title: 'this blog post is missing likes',
      author: "Likey McLikerson",
      url: "added-by-test-again"
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const blogToView = blogsAtEnd[blogsAtEnd.length - 1]
  
    expect(blogToView.likes).toEqual(0)
  })
  
  test('blogs without title is not added', async () => {
    const newBlog = {
      author: "Missing McMisserson",
      url: "added-by-test-three",
      likes: 21
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
  
  test('blogs without url is not added', async () => {
    const newBlog = {
      title: "URL is missing from this",
      author: "Missing McMisserson",
      likes: 21
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('blog title is properly updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlogTitle = {
      ...blogToUpdate, 
      title: 'This is an updated title'
    }

    // console.log("updatedBlogTitle", updatedBlogTitle)

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlogTitle)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).toContain(updatedBlogTitle.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
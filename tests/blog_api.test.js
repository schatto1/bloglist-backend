const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')


beforeEach(async () => {
  await User.deleteMany({})
  for (initialUser of helper.initialUsers) {
    const { username, name, password } = initialUser

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    await user.save();
  }

  const usersAtStart = await helper.usersInDb()
  const currentUser = usersAtStart[0]

  await Blog.deleteMany({})
  for (initialBlog of helper.initialBlogs) {
    const { title, author, url, likes } = initialBlog

    const blog = new Blog({
      title: title,
      author: author,
      url: url,
      likes: likes || 0,
      user: currentUser.id
    })

    await blog.save();
  }
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
    const user = {
      username: "testy",
      password: "testing"
    }
  
    const auth = await api
        .post('/api/login')
        .send(user)
    
    const token = "Bearer " + auth.body.token


    const newBlog = {
      title: 'this is a newly added blog post',
      author: "Testy McTesterson",
      url: "added-by-test",
      likes: 6
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
      'this is a newly added blog post'
    )
  })

  test('blog is not added when auth token missing', async () => {
    const newBlog = {
      title: 'this is a newly added blog post',
      author: "Missing McMisserson",
      url: "added-by-test-three",
      likes: 21
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
  
  test('if likes missing, defaults to zero', async () => {
    const user = {
      username: "testy",
      password: "testing"
    }
  
    const auth = await api
        .post('/api/login')
        .send(user)
    
    const token = "Bearer " + auth.body.token

    const newBlog = {
      title: 'this blog post is missing likes',
      author: "Likey McLikerson",
      url: "added-by-test-again"
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const blogToView = blogsAtEnd[blogsAtEnd.length - 1]
  
    expect(blogToView.likes).toEqual(0)
  })
  
  test('blogs without title is not added', async () => {
    const user = {
      username: "testy",
      password: "testing"
    }
  
    const auth = await api
        .post('/api/login')
        .send(user)
    
    const token = "Bearer " + auth.body.token

    const newBlog = {
      author: "Missing McMisserson",
      url: "added-by-test-three",
      likes: 21
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
  
  test('blogs without url is not added', async () => {
    const user = {
      username: "testy",
      password: "testing"
    }
  
    const auth = await api
        .post('/api/login')
        .send(user)
    
    const token = "Bearer " + auth.body.token

    const newBlog = {
      title: "URL is missing from this",
      author: "Missing McMisserson",
      likes: 21
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const user = {
      username: "testy",
      password: "testing"
    }
  
    const auth = await api
        .post('/api/login')
        .send(user)
    
    const token = "Bearer " + auth.body.token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', token)
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
    const user = {
      username: "testy",
      password: "testing"
    }
  
    const auth = await api
        .post('/api/login')
        .send(user)
    
    const token = "Bearer " + auth.body.token

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
      .set('Authorization', token)
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

afterAll(async () => {
  await mongoose.connection.close()
})
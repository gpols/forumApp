// Export a function that takes in the Express app and forumData
module.exports = function (app, forumData) {
  // Handle routes

  // Route for the home page
  app.get('/', function (req, res) {
    res.render('index.ejs', forumData)
  })

  // Route for the about page
  app.get('/about', function (req, res) {
    res.render('about.ejs', forumData)
  })

  // Route for the search page
  app.get('/search', function (req, res) {
    res.render('search.ejs', forumData)
  })

  // Route for the home page
  app.get('/home', function (req, res) {
    res.render('home.ejs', forumData)
  })

  // Route for the posts page
  app.get('/posts', function (req, res) {
    // Post and topic query
    let sqlqueryPost = `
      SELECT 
        post.post_id, 
        post.user_id, 
        post.topic_id, 
        post.post_title,
        post.post_content, 
        user_profile.first_name, 
        user_profile.last_name, 
        topic.topic_name
      FROM post
      JOIN user_profile ON post.user_id = user_profile.user_id
      JOIN topic ON post.topic_id = topic.topic_id
    `

    db.query(sqlqueryPost, (err, result) => {
      if (err) {
        res.redirect('./')
      }
      // Combine forumData with the result and render the posts.ejs template
      let newData = Object.assign({}, forumData, { existingPosts: result })
      console.log(newData)
      res.render('posts.ejs', newData)
    })
  })

  // Route for the topics page
  app.get('/topics', function (req, res) {
    // Query to get all topics
    let sqlquery = 'SELECT * FROM topic'

    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect('./')
      }
      // Combine forumData with the result and render the topics.ejs template
      let newData = Object.assign({}, forumData, { availableTopics: result })
      console.log(newData)
      res.render('topics.ejs', newData)
    })
  })

  // Route for displaying users
  app.get('/users', function (req, res) {
    // Query to get all users
    let sqlquery = 'SELECT * FROM user_profile'

    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect('./')
      }
      // Combine forumData with the result and render the users.ejs template
      let newData = Object.assign({}, forumData, { existingUsers: result })
      console.log(newData)
      res.render('users.ejs', newData)
    })
  })

  // Route for the registration page
  app.get('/', function (req, res) {
    res.render('index.ejs', forumData)
  })

  // Route for handling registration form submission
  app.post('/registered', (req, res) => {
    // Get user registration data from the request body
    let { first, last, email } = req.body

    // Perform validation on user input
    if (!first || !last || !email) {
      return res.status(400).json({
        error: 'Invalid input. Please provide first name, last name, and email.'
      })
    }

    // Insert the user data into the 'user_profile' table
    let insertUserQuery =
      'INSERT INTO user_profile (first_name, last_name, email) VALUES (?, ?, ?)'
    let userValues = [first, last, email]

    db.query(insertUserQuery, userValues, (err, result) => {
      if (err) {
        console.error('Error inserting user into database:', err)
        return res.status(500).json({
          error: 'Error registering user'
        })
      }

      // Assuming the user is successfully inserted, render a success message
      res.json({
        message: `Hello ${first} ${last}, you are now registered! We will send an email to you at ${email}`
      })
    })
  })

  // Route for the add post page
  app.get('/add_post', function (req, res) {
    res.render('add_post.ejs', forumData)
  })

  // Route for adding a new post
  app.post('/add_post', function (req, res) {
    // Save data in the database
    let sqlquery =
      'INSERT INTO post (user_id, topic_id, post_title, post_content) VALUES (?, ?, ?, ?)'
    let newrecord = [
      req.body.user_id,
      req.body.topic_id,
      req.body.post_title,
      req.body.post_content
    ]

    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        return console.error(err.message)
      } else {
        res.send('Post added successfully!')
      }
    })
  })

  // Route for searching posts
  app.get('/search_posts', function (req, res) {
    // Get the search keyword from the query parameter
    const searchKeyword = req.query.keyword
    const queryParamPartial = ['%' + searchKeyword + '%']
    let sqlqueryPartial = `SELECT * FROM post WHERE post_title LIKE ?`

    db.query(
      sqlqueryPartial,
      queryParamPartial,
      (errPartial, resultPartial) => {
        if (errPartial) {
          console.error('Error executing partial match SQL query:', errPartial)
          return
        }

        const message =
          resultPartial.length > 0 ? null : 'No matching results found.'
        // Render the search_posts.ejs template with the results and a message
        res.render(
          'search_posts.ejs',
          Object.assign({}, forumData, {
            result: resultPartial,
            message: message
          })
        )
      }
    )
  })
}

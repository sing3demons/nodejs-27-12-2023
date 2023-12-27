const { MongoClient } = require('mongodb')

const uri = 'mongodb://localhost:27017,localhost:27018,localhost:27019/my-database?replicaSet=my-replica-set'

const client = new MongoClient(uri)

async function connectToDB() {
  try {
    await client.connect()
    console.log('Connected to MongoDB replica set')
    const db = client.db()
    // await insertSampleData(db)
    // await populatePosts(db)
    await getPostsAndPopulateAuthor(db)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

connectToDB()

async function insertSampleData(db) {
  try {
    const usersCollection = db.collection('users')
    const postsCollection = db.collection('posts')

    // Insert users
    const user1 = { username: 'user1', email: 'user1@example.com' }
    const user2 = { username: 'user2', email: 'user2@example.com' }
    const user3 = { username: 'user3', email: 'user3@example.com' }
    const users = await usersCollection.insertMany([user1, user2, user3])

    // Insert posts with an array of authors
    const posts = [
      { title: 'Post 1', content: 'Content 1', authors: [users.insertedIds[0], users.insertedIds[1]] },
      { title: 'Post 2', content: 'Content 2', authors: [users.insertedIds[1], users.insertedIds[2]] },
    ]

    const insertManyResult = await postsCollection.insertMany(posts)
    console.log('Inserted posts:', insertManyResult.insertedIds)
  } catch (error) {
    console.error('Error inserting data:', error)
  }
}

async function populatePosts(db) {
  try {
    const postsCollection = db.collection('posts')
    const usersCollection = db.collection('users')

    const posts = await postsCollection.find().toArray()

    for (const post of posts) {
      const author = await usersCollection.findOne({ _id: post.author })
      post.author = author
    }

    console.log('Posts with populated author data:', posts)
  } catch (error) {
    console.error('Error querying and populating data:', error)
  }
}

// Query posts and populate the 'author' field with user data
async function getPostsAndPopulateAuthor(db) {
  try {
    const usersCollection = db.collection('users')
    const postsCollection = db.collection('posts')
    const posts = await postsCollection.find().toArray()

    // for (const post of posts) {
    //   const author = await usersCollection.findOne({ _id: post.author })
    //   post.author = author
    //   console.log('Post:', post)
    // }
    const postsWithAuthors = await postsCollection
      .aggregate([
        {
          $lookup: {
            from: 'users', 
            localField: 'authors',
            foreignField: '_id',
            as: 'authors',
          },
        },

      ])
      .toArray()

    console.log(JSON.stringify(postsWithAuthors))
  } catch (error) {
    console.error('Error querying and populating data:', error)
  } finally {
    client.close()
  }
}

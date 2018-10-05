const { ApolloServer, gql } = require('apollo-server');

const users = [
  {
    id: '1',
    name: 'นายอ๋อม'
  },
  {
    id: '2',
    name: 'เติ้ลนักยิ้ม'
  },
  {
    id: '3',
    name: 'ทัต หล่อ'
  }
]

const posts = [
  {
    id: '1',
    user_id: '2',
    desc: 'Welcome to GraphQL Session'
  },
  {
    id: '2',
    user_id: '1',
    desc: 'Easier to use'
  }
]

const comments = [
  {
    id: '1',
    parent: '2',
    user_id: '1',
    desc: 'Awesome GraphQL'
  },
  {
    id: '2',
    parent: '1',
    user_id: '2',
    desc: 'Declarative Type'
  }
]

const replies = [
  {
    id: '1',
    parent: '2',
    user_id: '2',
    desc: 'Just a Query Language'
  },
  {
    id: '2',
    parent: '2',
    user_id: '3',
    desc: 'Mutation'
  },
  {
    id: '3',
    parent: '1',
    user_id: '1',
    desc: 'Not a database Naaa'
  }
]

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  type User {
    id: String
    name: String
    posts: [Post]
    comments: [Comment]
    replies: [Reply]
  }

  type Post {
    id: String
    user_id: String
    desc: String
    user: User
    comments: [Comment]
  }

  type Comment {
    id: String
    user_id: String
    desc: String
    parent: String
    user: User
    post: Post
    replies: [Reply]
  }

  type Reply {
    id: String
    user_id: String
    desc: String
    parent: String
    user: User
    comment: Comment
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    users(limit: Int): [User]
    user(id: String): User
    posts(user_id: String, limit: Int): [Post]
    post(id: String): Post
    comments(user_id: String, parent: String, limit: Int): [Comment]
    comment(id: String): Comment
    replies(user_id: String, parent: String, limit: Int): [Reply]
    reply(id: String): Reply
  }

  type Mutation {
    addUser(name: String): User
    editUser(id: String, name: String): User
    deleteUser(id: String): User
    addPost(user_id: String, desc: String): Post
    editPost(id: String, desc: String): Post
    deletePost(id: String): Post
    addComment(parent: String, user_id: String, desc: String): Comment
    editComment(id: String, desc: String): Comment
    deleteComment(id: String): Comment
    addReply(parent: String, user_id: String, desc: String): Reply
    editReply(id: String, desc: String): Reply
    deleteReply(id: String): Reply
  }
`

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  User: {
    posts: ({ id }) => posts.filter(item => item.user_id === id),
    comments: ({ id }) => comments.filter(item => item.user_id === id),
    replies: ({ id }) => replies.filter(item => item.user_id === id)
  },
  Post: {
    user: ({ user_id: id }) => (id) => users.find(item => item.id === id),
    comments: ({ id }) => comments.filter(item => item.parent === id)
  },
  Comment: {
    user: ({ user_id: id }) => (id) => users.find(item => item.id === id),
    post: ({ parent }) => posts.find(item => item.id === parent),
    replies: ({ id }) => replies.filter(item => item.parent === id)
  },
  Reply: {
    user: ({ user_id: id }) => (id) => users.find(item => item.id === id),
    comment: ({ parent }) => comments.find(item => item.id === parent)
  },
  Query: {
    users: (_, args = { limit: 50 }) => users.slice(0, args.limit),
    user: (_, { id }) => users.find(item => item.id === id),
    posts: (_, args = {}) => {
      const { limit = 50, user_id } = args
      let result = posts.slice(0, limit)
      if (user_id) {
        result = result.filter(item => item.user_id === user_id)
      }
      return result
    },
    post: (_, { id }) => posts.find(item => item.id === id),
    comments: (_, args = {}) => {
      const { limit = 50, user_id, parent } = args
      let result = comments.slice(0, limit)
      if (user_id) {
        result = result.filter(item => item.user_id === user_id)
      }
      if (parent) {
        result = result.filter(item => item.parent === parent)
      }
      return result
    },
    comment: (_, { id }) => comments.find(item => item.id === id),
    replies: (_, args = {}) => {
      const { limit = 50, user_id, parent } = args
      let result = replies.slice(0, limit)
      if (user_id) {
        result = result.filter(item => item.user_id === user_id)
      }
      if (parent) {
        result = result.filter(item => item.parent === parent)
      }
      return result
    },
    reply: (_, { id }) => replies.find(item => item.id === id)
  },
  Mutation: {
    addUser: (_, { name }) => {
      const user = {
        id: String(+(new Date())),
        name
      }
      users.push(user)
      return user
    },
    editUser: (_, { id, name }) => {
      const user = users.find(item => item.id === id)
      if (!user) return null
      user.name = name
      return user
    },
    deleteUser: (_, { id }) => {
      const index = users.findIndex(item => item.id === id)
      if (~index) {
        users.splice(index, 1)
      }
      return null
    },
    addPost: (_, { user_id, desc }) => {
      const post = {
        id: String(+(new Date())),
        user_id,
        desc
      }
      posts.push(post)
      return post
    },
    editPost: (_, { id, desc }) => {
      const post = posts.find(item => item.id === id)
      if (!post) return null
      post.desc = desc
      return post
    },
    deletePost: (_, { id }) => {
      const index = posts.findIndex(item => item.id === id)
      if (~index) {
        posts.splice(index, 1)
      }
      return null
    },
    addComment: (_, { parent, user_id, desc }) => {
      const comment = {
        id: String(+(new Date())),
        parent,
        user_id,
        desc
      }
      comments.push(comment)
      return comment
    },
    editComment: (_, { id, desc }) => {
      const comment = comments.find(item => item.id === id)
      if (!comment) return null
      comment.desc = desc
      return comment
    },
    deleteComment: (_, { id }) => {
      const index = comments.findIndex(item => item.id === id)
      if (~index) {
        comments.splice(index, 1)
      }
      return null
    },
    addReply: (_, { parent, user_id, desc }) => {
      const reply = {
        id: String(+(new Date())),
        parent,
        user_id,
        desc
      }
      replies.push(reply)
      return reply
    },
    editReply: (_, { id, desc }) => {
      const reply = replies.find(item => item.id === id)
      if (!reply) return null
      reply.desc = desc
      return reply
    },
    deleteReply: (_, { id }) => {
      const index = replies.findIndex(item => item.id === id)
      if (~index) {
        replies.splice(index, 1)
      }
      return null
    }
  }
}

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})

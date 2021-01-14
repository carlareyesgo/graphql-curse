import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";
//Demo user data
const users = [
  {
    id: "1",
    name: "Carla",
    email: "carla@email.com",
    age: 26,
  },
  {
    id: "2",
    name: "Maria",
    email: "maria@email.com",
  },
  {
    id: "3",
    name: "Hector",
    email: "hector@email.com",
  },
];

const posts = [
  {
    id: "10",
    title: "GraphQL 101",
    body: "this is how to use GraphQL",
    published: true,
    author: "1",
  },
  {
    id: "11",
    title: "GraphQL 201",
    body: "this is how to use GraphQL",
    published: false,
    author: "1",
  },
  {
    id: "12",
    title: "Programming Music",
    body: "",
    published: true,
    author: "2",
  },
];

const comments = [
  {
    id: "102",
    text: "Hi",
    author: "1",
    post: "10",
  },
  {
    id: "103",
    text: "Bye",
    author: "2",
    post: "11",
  },
  {
    id: "104",
    text: "Goodbye",
    author: "3",
    post: "12",
  },
  {
    id: "105",
    text: "Goodbye2",
    author: "1",
    post: "10",
  },
];

//type definition
const typeDefs = `
type Query{
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
    me: User!
    post: Post!

}
type Mutation{
    createUser(data: CreateUserInput!): User!
    createPost(post: CreatePostInput! ):Post! 
    createComment(data: CreateCommentInput! ): Comment!
}

input CreateUserInput{
    name: String!
    email: String!
    age: Int
}

input CreatePostInput{
    title: String!,
    body: String!,
    published: Boolean!,
    author: ID!
}

input CreateCommentInput{
    text: String!,
    author: ID!,
    post: ID!
}


type User{
    id:ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!

}

type Post{
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
}

type Comment{
    id: ID!
    text: String!
    author: User!
    post: Post!
}

`;

//Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts;
      }
      return posts.filter((post) => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase());
        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase());
        return isTitleMatch || isBodyMatch;
      });
    },
    comments(parent, args, ctx, info) {
      return comments;
    },
    me() {
      return {
        id: "123098",
        name: "Carla",
        email: "carla@email.com",
      };
    },
    post() {
      return {
        id: "092",
        title: "Graphql 181",
        body: "",
        published: false,
      };
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.data.email);

      if (emailTaken) {
        throw new Error("Email taken.");
      }

      const user = {
        id: uuidv4(),
        ...args.data,
      };
      users.push(user);

      return user;
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.post.author);
      if (!userExists) {
        throw new Error("User not found");
      }
      const post = {
        id: uuidv4(),
        ...args.post,
      };
      posts.push(post);

      return post;
    },
    createComment(parent, args, ctx, info) {
      const userExist = users.some((user) => user.id === args.data.author);
      const postExists = posts.some(
        (post) => post.id === args.data.post && post.published === true
      );

      if (!userExist || !postExists) {
        throw new Error("Unable to find user and post");
      }
      const comment = {
        id: uuidv4(),
        ...args.data,
      };
      comments.push(comment);

      return comment;
    },
  },

  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.post === parent.id;
      });
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return post.id === parent.post;
      });
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

server.start(() => {
  console.log("The server is up!");
});

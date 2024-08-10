// import express from 'express';
// import { graphqlHTTP } from 'express-graphql';
// import { buildSchema } from 'graphql';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import cors from 'cors';
// import { sendEmail } from './mailer';
// import sqlite3 from 'sqlite3';
// import { open } from 'sqlite';
// import { CustomError } from './errors';

// // 打开 SQLite 数据库
// const dbPromise = open({
//   filename: ':memory:',
//   driver: sqlite3.Database
// });

// async function setupDatabase() {
//   const db = await dbPromise;

//   // 创建用户表
//   await db.exec(`
//     CREATE TABLE users (
//       id TEXT PRIMARY KEY,
//       name TEXT,
//       email TEXT,
//       password TEXT,
//       verified BOOLEAN
//     )
//   `);

//   // 初始化用户数据
//   const users = [
//     { id: '1', name: 'John Doe', email: 'john@example.com', password: bcrypt.hashSync('password', 8), verified: false },
//     { id: '2', name: 'Jane Doe', email: 'jane@example.com', password: bcrypt.hashSync('password', 8), verified: false },
//   ];

//   // 插入用户数据到 SQLite 数据库
//   const insertUser = await db.prepare('INSERT INTO users (id, name, email, password, verified) VALUES (?, ?, ?, ?, ?)');
//   for (const user of users) {
//     await insertUser.run(user.id, user.name, user.email, user.password, user.verified);
//   }
//   await insertUser.finalize();
// }

// // GraphQL schema
// const schema = buildSchema(`
//   type User {
//     id: ID!
//     name: String!
//     email: String!
//     verified: Boolean!
//   }

//   type AuthPayload {
//     token: String!
//     user: User!
//   }

//   type Query {
//     user(id: ID!): User
//     users: [User]
//   }

//   type Mutation {
//     login(email: String!, password: String!): AuthPayload
//     signup(name: String!, email: String!, password: String!): AuthPayload
//     verifyEmail(token: String!): Boolean
//     requestPasswordReset(email: String!): Boolean
//     resetPassword(token: String!, newPassword: String!): Boolean
//     createUser(name: String!, email: String!, password: String!): AuthPayload
//     updateUser(id: ID!, name: String, email: String, password: String): User
//   }
// `);

// // Root resolver
// const root = {
//   user: async ({ id }: { id: string }) => {
//     const db = await dbPromise;
//     return db.get('SELECT * FROM users WHERE id = ?', id);
//   },
//   users: async () => {
//     const db = await dbPromise;
//     return db.all('SELECT * FROM users');
//   },
//   login: async ({ email, password }: { email: string, password: string }) => {
//     const db = await dbPromise;
//     const user = await db.get('SELECT * FROM users WHERE email = ?', email);
//     if (!user) throw new CustomError(404, 'User not found');
//     const valid = bcrypt.compareSync(password, user.password);
//     if (!valid) throw new CustomError(401, 'Invalid password');
//     if (!user.verified) throw new CustomError(403, 'Please verify your email first');
//     const token = jwt.sign({ userId: user.id }, 'your_secret_key');
//     return { token, user };
//   },
//   signup: async ({ name, email, password }: { name: string, email: string, password: string }) => {
//     const db = await dbPromise;
//     const hashedPassword = bcrypt.hashSync(password, 8);
//     const user = { id: String(Date.now()), name, email, password: hashedPassword, verified: false };
//     await db.run('INSERT INTO users (id, name, email, password, verified) VALUES (?, ?, ?, ?, ?)', user.id, user.name, user.email, user.password, user.verified);
//     const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
//     const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
//     sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);
//     return { token, user };
//   },
//   verifyEmail: async ({ token }: { token: string }) => {
//     try {
//       const decoded: any = jwt.verify(token, 'your_secret_key');
//       const db = await dbPromise;
//       const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.userId);
//       if (!user) throw new CustomError(404, 'User not found');
//       await db.run('UPDATE users SET verified = ? WHERE id = ?', true, user.id);
//       return true;
//     } catch (error) {
//       throw new CustomError(400, 'Invalid or expired token');
//     }
//   },
//   requestPasswordReset: async ({ email }: { email: string }) => {
//     const db = await dbPromise;
//     const user = await db.get('SELECT * FROM users WHERE email = ?', email);
//     if (!user) throw new CustomError(404, 'User not found');
//     const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
//     const resetLink = `http://localhost:3000/reset-password?token=${token}`;
//     sendEmail(email, 'Password Reset', `Click the link to reset your password: ${resetLink}`);
//     return true;
//   },
//   resetPassword: async ({ token, newPassword }: { token: string, newPassword: string }) => {
//     try {
//       const decoded: any = jwt.verify(token, 'your_secret_key');
//       const db = await dbPromise;
//       const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.userId);
//       if (!user) throw new CustomError(404, 'User not found');
//       const hashedPassword = bcrypt.hashSync(newPassword, 8);
//       await db.run('UPDATE users SET password = ? WHERE id = ?', hashedPassword, user.id);
//       return true;
//     } catch (error) {
//       throw new CustomError(400, 'Invalid or expired token');
//     }
//   },
//   createUser: async ({ name, email, password }: { name: string, email: string, password: string }) => {
//     const db = await dbPromise;
//     const hashedPassword = bcrypt.hashSync(password, 8);
//     const user = { id: String(Date.now()), name, email, password: hashedPassword, verified: false };
//     await db.run('INSERT INTO users (id, name, email, password, verified) VALUES (?, ?, ?, ?, ?)', user.id, user.name, user.email, user.password, user.verified);
//     const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
//     const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
//     sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);
//     return { token, user };
//   },
//   updateUser: async ({ id, name, email, password }: { id: string, name?: string, email?: string, password?: string }) => {
//     const db = await dbPromise;
//     const user = await db.get('SELECT * FROM users WHERE id = ?', id);
//     if (!user) throw new CustomError(404, 'User not found');
//     if (name) user.name = name;
//     if (email) user.email = email;
//     if (password) user.password = bcrypt.hashSync(password, 8);
//     await db.run('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', user.name, user.email, user.password, user.id);
//     return user;
//   },
// };

// // Initialize Express app
// const app = express();

// // Apply CORS middleware
// app.use(cors());

// // Middleware to handle GraphQL requests
// app.use('/graphql', graphqlHTTP({
//   schema,
//   rootValue: root,
//   graphiql: true,
//   context: ({ req }: { req: Request }) => ({ req }),
// }));

// // Start server
// app.listen(4000, async () => {
//   await setupDatabase();
//   console.log('Running a GraphQL API server at http://localhost:4000/graphql');
// });
// index.ts
import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { dbPromise, setupDatabase } from './db';
import { resolvers } from './resolvers';
import { graphqlHTTP } from 'express-graphql';
import { readFileSync } from 'fs';
import { join } from 'path';

// Import schema from schema.graphql
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');
// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const server = new ApolloServer({ schema });

// Create Express app
const app: Application = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Apply Apollo middleware to Express app
// server.applyMiddleware({ app, path: '/graphql' });

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true,
  context: ({ req }: { req: Request }) => ({ req }),
}));


// Setup database and start the server
setupDatabase().then(() => {
  app.listen({ port: 4000 }, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
});
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { sendEmail } from './mailer';

// In-memory user storage
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', password: '123456', verified: false },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', password: '123456', verified: false },
];

// GraphQL schema
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    verified: Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    user(id: ID!): User
    users: [User]
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload
    signup(name: String!, email: String!, password: String!): AuthPayload
    verifyEmail(token: String!): Boolean
    requestPasswordReset(email: String!): Boolean
    resetPassword(token: String!, newPassword: String!): Boolean
    createUser(name: String!, email: String!, password: String!): AuthPayload
    updateUser(id: ID!, name: String, email: String, password: String): User
  }
`);

// Root resolver
const root = {
  user: ({ id }: { id: string }) => users.find(user => user.id === id),
  users: () => users,
  login: ({ email, password }: { email: string, password: string }) => {
    const user = users.find(user => user.email === email);
    if (!user) throw new Error('User not found');
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) throw new Error('Invalid password');
    if (!user.verified) throw new Error('Please verify your email first');
    const token = jwt.sign({ userId: user.id }, 'your_secret_key');
    return { token, user };
  },
  signup: ({ name, email, password }: { name: string, email: string, password: string }) => {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = { id: String(users.length + 1), name, email, password: hashedPassword, verified: false };
    users.push(user);
    const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
    sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);
    return { token, user };
  },
  verifyEmail: ({ token }: { token: string }) => {
    try {
      const decoded: any = jwt.verify(token, 'your_secret_key');
      const user = users.find(user => user.id === decoded.userId);
      if (!user) throw new Error('User not found');
      user.verified = true;
      return true;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },
  requestPasswordReset: ({ email }: { email: string }) => {
    const user = users.find(user => user.email === email);
    if (!user) throw new Error('User not found');
    const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    sendEmail(email, 'Password Reset', `Click the link to reset your password: ${resetLink}`);
    return true;
  },
  resetPassword: ({ token, newPassword }: { token: string, newPassword: string }) => {
    try {
      const decoded: any = jwt.verify(token, 'your_secret_key');
      const user = users.find(user => user.id === decoded.userId);
      if (!user) throw new Error('User not found');
      user.password = bcrypt.hashSync(newPassword, 8);
      return true;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },
  createUser: ({ name, email, password }: { name: string, email: string, password: string }) => {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = { id: String(users.length + 1), name, email, password: hashedPassword, verified: false };
    users.push(user);
    const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
    sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);
    return { token, user };
  },
  updateUser: ({ id, name, email, password }: { id: string, name?: string, email?: string, password?: string }) => {
    const user = users.find(user => user.id === id);
    if (!user) throw new Error('User not found');
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = bcrypt.hashSync(password, 8);
    return user;
  },
};

// Initialize Express app
const app = express();

// Apply CORS middleware
app.use(cors());

// Middleware to handle GraphQL requests
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
  context: ({ req }: { req: Request }) => ({ req }),
}));

// Start server
app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});

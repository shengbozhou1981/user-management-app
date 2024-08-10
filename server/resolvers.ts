// resolvers.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from './mailer';
import { dbPromise } from './db';
import { CustomError } from './errors';

export const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      const db = await dbPromise;
      return db.get('SELECT * FROM users WHERE id = ?', id);
    },
    users: async () => {
      const db = await dbPromise;
      return db.all('SELECT * FROM users');
    },
  },
  Mutation: {
    login: async (_: any, { email, password }: { email: string, password: string }) => {
      const db = await dbPromise;
      const user = await db.get('SELECT * FROM users WHERE email = ?', email);
      if (!user) throw new CustomError(404, 'User not found');
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) throw new CustomError(401, 'Invalid password');
      if (!user.verified) throw new CustomError(403, 'Please verify your email first');
      const token = jwt.sign({ userId: user.id }, 'your_secret_key');
      return { token, user };
    },
    signup: async (_: any, { name, email, password }: { name: string, email: string, password: string }) => {
      const db = await dbPromise;
      const hashedPassword = bcrypt.hashSync(password, 8);
      const user = { id: String(Date.now()), name, email, password: hashedPassword, verified: false };
      await db.run('INSERT INTO users (id, name, email, password, verified) VALUES (?, ?, ?, ?, ?)', user.id, user.name, user.email, user.password, user.verified);
      const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
      const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
      sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);
      return { token, user };
    },
    verifyEmail: async (_: any, { token }: { token: string }) => {
      try {
        const decoded: any = jwt.verify(token, 'your_secret_key');
        const db = await dbPromise;
        const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.userId);
        if (!user) throw new CustomError(404, 'User not found');
        await db.run('UPDATE users SET verified = ? WHERE id = ?', true, user.id);
        return true;
      } catch (error) {
        throw new CustomError(400, 'Invalid or expired token');
      }
    },
    requestPasswordReset: async (_: any, { email }: { email: string }) => {
      const db = await dbPromise;
      const user = await db.get('SELECT * FROM users WHERE email = ?', email);
      if (!user) throw new CustomError(404, 'User not found');
      const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
      const resetLink = `http://localhost:3000/reset-password?token=${token}`;
      sendEmail(email, 'Password Reset', `Click the link to reset your password: ${resetLink}`);
      return true;
    },
    resetPassword: async (_: any, { token, newPassword }: { token: string, newPassword: string }) => {
      try {
        const decoded: any = jwt.verify(token, 'your_secret_key');
        const db = await dbPromise;
        const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.userId);
        if (!user) throw new CustomError(404, 'User not found');
        const hashedPassword = bcrypt.hashSync(newPassword, 8);
        await db.run('UPDATE users SET password = ? WHERE id = ?', hashedPassword, user.id);
        return true;
      } catch (error) {
        throw new CustomError(400, 'Invalid or expired token');
      }
    },
    createUser: async (_: any, { name, email, password }: { name: string, email: string, password: string }) => {
      const db = await dbPromise;
      const hashedPassword = bcrypt.hashSync(password, 8);
      const user = { id: String(Date.now()), name, email, password: hashedPassword, verified: false };
      await db.run('INSERT INTO users (id, name, email, password, verified) VALUES (?, ?, ?, ?, ?)', user.id, user.name, user.email, user.password, user.verified);
      const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
      const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
      sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);
      return { token, user };
    },
    updateUser: async (_: any, { id, name, email, password }: { id: string, name?: string, email?: string, password?: string }) => {
      const db = await dbPromise;
      const user = await db.get('SELECT * FROM users WHERE id = ?', id);
      if (!user) throw new CustomError(404, 'User not found');
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = bcrypt.hashSync(password, 8);
      await db.run('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', user.name, user.email, user.password, user.id);
      return user;
    },
  },
};

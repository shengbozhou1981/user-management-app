// db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

export const dbPromise = open({
  filename: ':memory:',
  driver: sqlite3.Database,
});

export async function setupDatabase() {
  const db = await dbPromise;

  // 创建用户表
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      password TEXT,
      verified BOOLEAN
    )
  `);

  // 初始化用户数据
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', password: bcrypt.hashSync('password', 8), verified: false },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com', password: bcrypt.hashSync('password', 8), verified: false },
  ];

  // 插入用户数据到 SQLite 数据库
  const insertUser = await db.prepare('INSERT INTO users (id, name, email, password, verified) VALUES (?, ?, ?, ?, ?)');
  for (const user of users) {
    await insertUser.run(user.id, user.name, user.email, user.password, user.verified);
  }
  await insertUser.finalize();
}

const mysql = require('mysql2/promise');
const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let pool;
let dbType = 'mysql';
let sqliteDb;

const initDb = async () => {
  if (process.env.DB_TYPE === 'sqlite') {
    return useSqlite();
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'placement_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    
    // Test connection
    const conn = await pool.getConnection();
    console.log('✅ MySQL Connected Successfully');
    conn.release();
    dbType = 'mysql';
  } catch (error) {
    console.warn('⚠️ MySQL Connection Failed, falling back to SQLite');
    useSqlite();
  }
};

const useSqlite = () => {
  const dbPath = path.join(__dirname, '../database/placement.db');
  sqliteDb = new sqlite3(dbPath);
  console.log('✅ SQLite Connected Successfully at:', dbPath);
  dbType = 'sqlite';
};

const execute = async (sql, params = []) => {
  if (dbType === 'mysql') {
    return await pool.execute(sql, params);
  } else {
    // Convert ? to @ or keep as ? (better-sqlite3 supports ?)
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = stmt.all(...params);
      return [rows];
    } else {
      const info = stmt.run(...params);
      return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
    }
  }
};

const query = async (sql, params = []) => {
  return await execute(sql, params);
};

module.exports = { pool, connectDB: initDb, execute, query, dbType };


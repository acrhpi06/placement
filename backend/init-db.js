const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  console.log('Connected to MySQL server');
  
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'placement_db'}\``);
  console.log(`Database ${process.env.DB_NAME || 'placement_db'} ensured`);
  
  await connection.end();
}

initDB().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

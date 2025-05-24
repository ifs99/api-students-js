const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('students.sqlite');

// Crear la tabla students
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      gender TEXT NOT NULL,
      age TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table "students" created or already exists');
    }
  });
});

module.exports = db;
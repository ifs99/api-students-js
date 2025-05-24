const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para manejar todos los estudiantes
app.route('/students')
  .get((req, res) => {
    // GET request para todos los estudiantes
    db.all("SELECT * FROM students", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  })
  .post((req, res) => {
    // POST request para crear un nuevo estudiante
    const { firstname, lastname, gender, age } = req.body;
    
    db.run(
      `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`,
      [firstname, lastname, gender, age],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          message: `Student created successfully`,
          id: this.lastID
        });
      }
    );
  });

// Ruta para manejar un estudiante específico
app.route('/student/:id')
  .get((req, res) => {
    // GET request para un estudiante específico
    const id = req.params.id;
    
    db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.json(row);
    });
  })
  .put((req, res) => {
    // PUT request para actualizar un estudiante
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;
    
    db.run(
      `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`,
      [firstname, lastname, gender, age, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          message: `Student with id: ${id} updated`,
          changes: this.changes
        });
      }
    );
  })
  .delete((req, res) => {
    // DELETE request para eliminar un estudiante
    const id = req.params.id;
    
    db.run(
      `DELETE FROM students WHERE id = ?`,
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          message: `Student with id: ${id} deleted`,
          changes: this.changes
        });
      }
    );
  });

// Iniciar el servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
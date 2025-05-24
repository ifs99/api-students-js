const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

// MIDDLEWARE FIX - Must come before routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Keep this for potential JSON requests

// POST endpoint with error handling
app.post('/students', (req, res) => {
    console.log('Received body:', req.body); // Debug log
    
    if (!req.body) {
        return res.status(400).json({ error: 'No data received' });
    }

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const gender = req.body.gender;
    const age = req.body.age;

    if (!firstname || !lastname || !gender) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            received: req.body  // Shows what was actually received
        });
    }

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
    console.log('Update request body:', req.body); // Debug log
    
    if (!req.body) {
      return res.status(400).json({ error: 'No data received' });
    }

    const id = req.params.id;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const gender = req.body.gender;
    const age = req.body.age || null; // Make age optional
    
    if (!firstname || !lastname || !gender) {
      return res.status(400).json({ 
        error: 'Missing required fields (firstname, lastname, gender)',
        received: req.body  // Echo back what was received
      });
    }

    db.run(
      `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`,
      [firstname, lastname, gender, age, id],
      function(err) {
        if (err) {
          return res.status(500).json({ 
            error: err.message,
            details: 'Database update failed' 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ 
            message: 'No student found with that ID',
            id: id
          });
        }
        
        res.json({
          message: `Student with id: ${id} updated successfully`,
          changes: this.changes,
          updatedStudent: {
            id: id,
            firstname: firstname,
            lastname: lastname,
            gender: gender,
            age: age
          }
        });
      }
    );
  })  // <-- Removed the semicolon that was breaking the chain
  .delete((req, res) => {
    const id = req.params.id;
    
    db.run(
      `DELETE FROM students WHERE id = ?`,
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ 
            error: err.message,
            details: 'Database deletion failed'
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ 
            message: 'No student found with that ID',
            id: id
          });
        }
        
        res.json({
          message: `Student with id: ${id} deleted successfully`,
          changes: this.changes
        });
      }
    );
  });

// Iniciar el servidor
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

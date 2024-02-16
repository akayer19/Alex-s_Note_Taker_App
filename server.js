const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Function to generate a unique ID using UNIX timestamp
function generateUniqueId() {
  const timestamp = Date.now(); // Get current UNIX timestamp in milliseconds
  return timestamp; // Return the UNIX timestamp as the unique ID
}

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

app.post('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const notes = JSON.parse(data);
    const newNote = req.body;
    // Generate unique ID for the new note (you may use a library like 'uuid')
    newNote.id = generateUniqueId();
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(newNote);
    });
  });
});



// DELETE route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  // Read the existing notes from db.json
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    let notes = JSON.parse(data);

    // Find the index of the note with the specified id
    const index = notes.findIndex(note => note.id === parseInt(noteId));

    // If the note with the specified id is found, remove it
    if (index !== -1) {
      notes.splice(index, 1);

      // Write the updated notes back to db.json
      fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes), (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Note deleted successfully' });
      });
    } else {
      // If the note with the specified id is not found, send a 404 response
      res.status(404).json({ error: 'Note not found' });
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});

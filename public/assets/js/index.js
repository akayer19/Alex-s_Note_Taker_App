// Function to show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Function to hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// Function to generate a unique ID using UNIX timestamp
const generateUniqueId = () => {renderAc
  const timestamp = Date.now(); // Get current UNIX timestamp in milliseconds
  return timestamp; // Return the UNIX timestamp as the unique ID
};

// Function to fetch notes from the server
const getNotes = () =>
  fetch('/api/notes')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching notes:', error);
      return [];
    });

// Function to save a note to the server
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .catch(error => {
    console.error('Error saving note:', error);
  });

// Function to delete a note from the server
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .catch(error => {
    console.error('Error deleting note:', error);
  });

// Function to render the active note
const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.readOnly = true;
    noteText.readOnly = true;
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.readOnly = false;
    noteText.readOnly = false;
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Function to render the list of note titles
const renderNoteList = (notes) => {
  noteList.innerHTML = '';
  if (notes.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No saved notes';
    noteList.appendChild(li);
  } else {
    notes.forEach(note => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.textContent = note.title;
      li.addEventListener('click', () => handleNoteView(note));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('btn', 'btn-outline-danger', 'delete-note');
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleNoteDelete(note.id);
      });
      
      li.appendChild(deleteBtn);
      noteList.appendChild(li);
    });
  }
};

// Function to get notes from the server and render them
const getAndRenderNotes = () => {
  getNotes()
    .then(renderNoteList)
    .catch(error => console.error('Error fetching and rendering notes:', error));
};

// Function to handle saving a note
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  };
  saveNote(newNote)
    .then(getAndRenderNotes)
    .then(() => renderActiveNote())
    .catch(error => console.error('Error saving note:', error));
};

// Function to handle deleting a note
const handleNoteDelete = (id) => {
  deleteNote(id)
    .then(getAndRenderNotes)
    .then(() => {
      if (activeNote.id === id) {
        activeNote = {};
        renderActiveNote();
      }
    })
    .catch(error => console.error('Error deleting note:', error));
};

// Function to handle viewing a note
const handleNoteView = (note) => {
  activeNote = { ...note };
  renderActiveNote();
};

// Function to handle viewing a new note
const handleNewNoteView = () => {
  activeNote = {};
  renderActiveNote();
};

// Function to render the appropriate buttons based on the state of the form
const handleRenderBtns = () => {
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(saveNoteBtn);
    hide(clearBtn);
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
    show(clearBtn);
  } else {
    show(saveNoteBtn);
    show(clearBtn);
  }
};

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  // Assign DOM elements to variables
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note'); // Check if this is correctly targeting the save button
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelector('.list-container .list-group');

  // Add event listeners
  saveNoteBtn.addEventListener('click', handleNoteSave); // Check if this line is executed after the button is assigned
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  noteForm.addEventListener('input', handleRenderBtns);

  // Fetch and render notes
  getAndRenderNotes();
});

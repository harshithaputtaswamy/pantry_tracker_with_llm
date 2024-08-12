"use client"
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { List, ListItem, ListItemText, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PantryForm from '../app/components/PantryForm';
import CameraCapture from '../app/components/cameraCapture';

export default function Home() {
    const [refreshList, setRefreshList] = useState(false);

    const handleCapture = () => {
        setRefreshList(!refreshList); // Toggle state to refresh the list
    };

    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState('');
  
    useEffect(() => {
      const q = query(collection(db, 'pantry'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
      await deleteDoc(doc(db, 'pantry', id));
    };
  
    const handleEdit = (item) => {
      setEditingItem(item);
    };
  
    const handleFormSubmit = () => {
      setEditingItem(null);
    };
  
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  
    return (
      <>
        <CameraCapture onCapture={handleCapture} />
        <TextField
          label="Search Items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          margin="normal"
        />
        <PantryForm
          id={editingItem?.id}
          existingName={editingItem?.name}
          existingQuantity={editingItem?.quantity}
          onSubmit={handleFormSubmit}
        />
        <List>
          {filteredItems.map((item) => (
            <ListItem key={item.id}>
              <ListItemText primary={item.name} secondary={`Quantity: ${item.quantity}`} />
              <IconButton edge="end" onClick={() => handleEdit(item)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </>
    );
}

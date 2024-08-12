"use client"
import { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const PantryForm = ({ id, existingName, existingQuantity, onSubmit }) => {
    console.log(existingName, existingQuantity)
  const [name, setName] = useState(existingName || '');
  const [quantity, setQuantity] = useState(existingQuantity || '');

  console.log(name, quantity)

  useEffect(() => {
    setName(existingName);
    setQuantity(existingQuantity);
  }, [existingName, existingQuantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      // Update existing item
      const itemDoc = doc(db, 'pantry', id);
      await updateDoc(itemDoc, { name, quantity });
    } else {
      // Add new item
      await addDoc(collection(db, 'pantry'), { name, quantity });
    }
    onSubmit();
    setName('');
    setQuantity('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" type="submit">
        {id ? 'Update Item' : 'Add Item'}
      </Button>
    </form>
  );
};

export default PantryForm;
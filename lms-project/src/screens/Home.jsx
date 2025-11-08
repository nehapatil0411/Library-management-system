import React from 'react'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBooks } from '../slices/bookSlice';
import Dashboard from '../componets/dashboard/Dashboard';
import BookList from '../componets/Booklist/BookList';

function Home() {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchBooks());
    }, []);

      return (
    <div>
      <Dashboard />
      {/* <BookList /> */}
    </div>
  )
}

export default Home

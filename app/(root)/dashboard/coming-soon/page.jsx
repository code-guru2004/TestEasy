"use client"
import React from 'react'
import { useSelector } from 'react-redux';

function ComingSoon() {
  const { user } = useSelector((state) => state.auth);
  console.log("user a",user);
  return (
    <div className='w-full h-full items-center justify-center'>
        <h1 className='test-lg font-bold'>Coming Soon</h1>
       
    </div>
  )
}

export default ComingSoon
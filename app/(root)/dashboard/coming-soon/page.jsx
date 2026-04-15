"use client"
import React from 'react'
import { useSelector } from 'react-redux';
import { MdAdminPanelSettings,MdMenuBook } from "react-icons/md";
function ComingSoon() {
  const { user } = useSelector((state) => state.auth);
  console.log("user a",user);
  return (
    <div className='w-full h-[100vh] flex items-center justify-center'>
      <h1 className='text-4xl font-bold '>Coming Soon...</h1>
     
    </div>
  )
}

export default ComingSoon
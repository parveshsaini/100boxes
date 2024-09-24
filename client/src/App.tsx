import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from 'socket.io-client'

function App() {
  const [count, setCount] = useState(0)

  // useEffect(() => {
  //   const socket = io("ws://localhost:3000")
   
  // },  [count])

  const connectsocket = () => {
    const socket = io("http://localhost:3000")
    socket.on("connect", () => {
      console.log("connected")
    })
  }

  return (
    <>
      <h1 className='bg-red-400'>hllo</h1>
      <button onClick={connectsocket}>Click me</button>
    </>
  )
}

export default App

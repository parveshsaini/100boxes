import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './providers/auth.provider.tsx'
import { SocketProvider } from './providers/socket.provider.tsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')!).render(
 
    <AuthProvider>
      <SocketProvider>
        <Toaster/>
        <App />
      </SocketProvider>
    </AuthProvider>
 
)

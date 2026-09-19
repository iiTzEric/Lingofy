import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "stream-chat-react/dist/css/index.css";
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router"
import { GoogleOAuthProvider } from '@react-oauth/google'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import axios from 'axios';

// Ensure all axios requests include cookies/credentials
axios.defaults.withCredentials = true;

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from "@react-oauth/google";
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import { Toaster } from 'react-hot-toast';
createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <BrowserRouter basename="/business">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
        </GoogleOAuthProvider>
          <Toaster/>
      </BrowserRouter>
    </Provider>
)

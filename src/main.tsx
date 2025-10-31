import React from 'react'
import ReactDOM from 'react-dom/client'
import { Demo } from './Demo'
import './index.css'

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>,
)
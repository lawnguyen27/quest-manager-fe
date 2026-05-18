import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from './store'
import App from './App'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster position="bottom-right" richColors duration={4500} closeButton />
    </Provider>
  </React.StrictMode>,
)

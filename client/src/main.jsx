import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './components/Home.jsx'
import AddCoffee from './components/AddCoffee.jsx'
import UpdateCoffee from './components/UpdateCoffee.jsx'
import CoffeeDetails from './components/CoffeeDetails.jsx'
import SignIn from './components/SignIn.jsx'
import SignUp from './components/SignUp.jsx'
import AuthProvider from './contexts/AuthProvider.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      {
        index: true,

        Component: Home,
      },
      {
        path: 'addCoffee',
        Component: AddCoffee,
      },
      {
        path: 'coffee/:id',

        Component: CoffeeDetails,
      },
      {
        path: 'updateCoffee/:id',

        Component: UpdateCoffee,
      },
      {
        path: 'signin',
        Component: SignIn,
      },
      {
        path: 'signup',
        Component: SignUp,
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)

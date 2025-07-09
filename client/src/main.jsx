import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router";
import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./components/Home.jsx";
import AddCoffee from "./components/AddCoffee.jsx";
import UpdateCoffee from "./components/UpdateCoffee.jsx";
import CoffeeDetails from "./components/CoffeeDetails.jsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import AuthProvider from "./contexts/AuthProvider.jsx";
import axios from "axios";
import MyAddedCoffees from "./components/MyAddedCoffees.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        hydrateFallbackElement: <p>Loading...</p>,
        loader: () => axios(`${import.meta.env.VITE_API_URL}/coffees`),
        Component: Home,
      },
      {
        path: "addCoffee",
        element: (
          <PrivateRoute>
            <AddCoffee />
          </PrivateRoute>
        ),
      },
      {
        path: "coffee/:id",
        hydrateFallbackElement: <p>Loading...</p>,
        loader: ({ params }) =>
          axios(`${import.meta.env.VITE_API_URL}/coffee/${params.id}`),
        element: (
          <PrivateRoute>
            <CoffeeDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "updateCoffee/:id",

        element: (
          <PrivateRoute>
            <UpdateCoffee />
          </PrivateRoute>
        ),
      },
      {
        path: "signin",
        Component: SignIn,
      },
      {
        path: "signup",
        Component: SignUp,
      },
      {
        path: "my-added-coffees/:email",
        hydrateFallbackElement: <p>Loading...</p>,
        loader: ({ params }) =>
          axios(
            `${import.meta.env.VITE_API_URL}/my-added-coffees/${params.email}`
          ),
        element: (
          <PrivateRoute>
            <MyAddedCoffees />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);

import React, { use, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import MyOrderCard from "./MyOrderCard";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";

function MyOrders() {
  const { user } = use(AuthContext);
  const [orders, setOrders] = useState([]);
  const axiosSecure = useAxiosSecure();

  console.log(orders);

  useEffect(() => {
    axiosSecure(`/my-orders/${user?.email}`)
      .then((data) => {
        // console.log(data?.data);
        setOrders(data?.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [user, axiosSecure]);

  const handleDelete = (_id) => {
    // Sweet Alert
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // start deleting
        fetch(`${import.meta.env.VITE_API_URL}/my-orders/${_id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data) {
              Swal.fire({
                title: "Deleted!",
                text: "Your Coffee has been deleted.",
                icon: "success",
              });
            }
            // remove the plant from the state
            const remainingOrders = orders.filter((order) => order._id !== _id);
            setOrders(remainingOrders);
          });
      }
    });
  };

  return (
    <div className="py-20 grid grid-cols-1 lg:grid-cols-3 gap-3 ">
      {orders.map((order) => (
        <MyOrderCard
          key={order._id}
          order={order}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default MyOrders;

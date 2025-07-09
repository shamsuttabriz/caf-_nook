import React, { use, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { Heart } from "lucide-react";

const CoffeeDetails = () => {
  const { user } = use(AuthContext);
  const { data } = useLoaderData();
  const [coffee, setCoffee] = useState(data);

  const {
    _id,
    name,
    quantity,
    supplier,
    taste,
    email,
    price,
    details,
    photo,
    likeBy,
  } = coffee || {};

  const [liked, setLiked] = useState(likeBy.includes(user?.email));
  const [likeCount, setLikeCount] = useState(0);
  console.log("Like Count", likeCount);

  console.log("Is Liked", liked);
  console.log(coffee);

  useEffect(() => {
    setLikeCount(likeBy.includes(user?.email));
  }, [likeBy, user]);

  useEffect(() => {
    setLikeCount(likeBy.length);
  }, [likeBy]);

  // Handle like / dislike
  const handleLike = () => {
    if (user?.email === email) return alert("Lojja lage na tor?");

    axios
      .patch(`${import.meta.env.VITE_API_URL}/like/${_id}`, {
        email: user?.email,
      })
      .then((data) => {
        console.log(data?.data);
        const isLiked = data?.data?.liked;
        // update liked state
        setLiked(isLiked);
        // update likeCount State
        setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Handle order
  const handleOrder = () => {
    if (user?.email === email) return alert("Eta tmr nijer toiri coffee");
    const orderInfo = {
      coffeeId: _id,
      customerEmail: user?.email,
    };
    // save order info in database
    axios
      .post(`${import.meta.env.VITE_API_URL}/place-order/${_id}`, orderInfo)
      .then((data) => {
        console.log(data);
        setCoffee((prev) => {
          return { ...prev, quantity: prev.quantity - 1 };
        });
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 px-4">
      <div className="max-w-4xl w-full bg-white shadow-lg p-6 md:flex md:gap-6">
        <div className="md:w-1/2">
          <img
            src={photo}
            alt={name}
            className="w-full h-80 object-cover rounded-xl"
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-amber-800 mb-4">{name}</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Supplier:</span> {supplier}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Taste:</span> {taste}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Quantity:</span> {quantity}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Price:</span> ${price}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Likes:</span> {likeCount}
            </p>
            <p className="text-gray-700 mt-4">{details}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleOrder}
              className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition cursor-pointer"
            >
              Order Now
            </button>
            <button
              onClick={handleLike}
              className="px-6 py-2 rounded-full transition cursor-pointer"
            >
              {liked ? (
                <p className="flex gap-1 items-center text-red-600">
                  <Heart color="#ff0000" /> Loved
                </p>
              ) : (
                <p className="flex gap-1 items-center ">
                  <Heart /> <span>Love</span>
                </p>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeDetails;

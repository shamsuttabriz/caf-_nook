const MyOrderCard = ({ order, handleDelete }) => {
  const { _id, name, photo, price, customerEmail } = order;
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden flex gap-4 p-4 transform transition-transform duration-400 hover:scale-110">
      <img
        className="w-32 h-32 object-cover rounded-xl"
        src={photo}
        alt={name}
      />
      <div className="flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <p className="text-sm text-gray-500">Email: {customerEmail}</p>
        </div>
        <div className="mt-2 text-sm text-gray-700 space-y-1">
          <p>
            Price: <span className="font-medium text-green-600">${price}</span>
          </p>
        </div>
        <div className="mt-3">
          <button
            onClick={() => handleDelete(_id)}
            className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium py-1.5 px-4 rounded-lg shadow cursor-pointer"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyOrderCard;

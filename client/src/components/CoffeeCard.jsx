import { Link } from 'react-router'

const CoffeeCard = ({ coffee }) => {
  const { _id, name, price, quantity, photo } = coffee

  return (
    <div className='card card-side bg-base-100 shadow-sm border-2'>
      <figure>
        <img className='w-40 object-cover' src={photo} alt='Movie' />
      </figure>
      <div className='flex w-full justify-around items-center'>
        <div>
          <h2 className=''>{name}</h2>
          <p>Price: ${price}</p>
          <p>Quantity: {quantity}</p>
        </div>
        <div className='card-actions justify-end'>
          <div className='join join-vertical space-y-2'>
            <Link to={`/coffee/${_id}`}>
              <button className='btn join-item w-16'>View</button>
            </Link>
            <Link to={`/updateCoffee/${_id}`}>
              <button className='btn join-item w-16'>Edit</button>
            </Link>
            <button className='btn join-item w-16'>X</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoffeeCard

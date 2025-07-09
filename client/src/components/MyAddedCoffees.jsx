import React, { useState } from 'react'
import { useLoaderData } from 'react-router';
import CoffeeCard from './CoffeeCard';

function MyAddedCoffees() {
    const { data } = useLoaderData();
    const [coffees, setCoffees] = useState(data || []);
  
    console.log(coffees);
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12">
          {/* Coffee Cards */}
          {
            coffees.map(coffee => <CoffeeCard key={coffee._id} coffee={coffee} /> )
          }
        </div>
      </div>
    );
}

export default MyAddedCoffees;
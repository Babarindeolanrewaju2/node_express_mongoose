import React, { useState } from 'react';
import axios from 'axios';
import { Map, TileLayer, Marker } from 'react-leaflet';

function App() {
  const [coordinates, setCoordinates] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    const address = event.target.address.value;
    const apiKey = 'YOUR_API_KEY';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.status === 'OK') {
      const location = data.results[0].geometry.location;
      setCoordinates({
        lat: location.lat,
        lng: location.lng,
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Address:
          <input type="text" name="address" />
        </label>{' '}
        <button type="submit"> Submit </button>{' '}
      </form>{' '}
      <Map center={[coordinates.lat, coordinates.lng]} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[coordinates.lat, coordinates.lng]}></Marker>{' '}
      </Map>{' '}
    </div>
  );
}

export default App;

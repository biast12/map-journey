import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { useEffect } from 'react';

function Maps() {

  useEffect(() => {
    const map = new Map({
      target: 'map',
      view: new View({
        center: [0, 0],
        zoom: 2,
      })
    });
  }, []);

  return (
    <>
      <div>Maps</div>
      <div id="map" style={{ width: '100%', height: '400px' }}></div>
    </>
  );
}

export default Maps;
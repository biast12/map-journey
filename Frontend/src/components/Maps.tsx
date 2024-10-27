import "ol/ol.css";
import "./Maps.scss"; // Import the SCSS file

import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import MousePosition from "ol/control/MousePosition.js";
import OSM from "ol/source/OSM";
import { default as OlMap } from "ol/Map";
import Point from "ol/geom/Point";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { createStringXY } from "ol/coordinate.js";
import { defaults as defaultControls } from "ol/control.js";
import { useEffect } from "react";
import useRequestData from "../hooks/useRequestData";

interface MapProps {
  APIurl: string;
}

const debug = false; // Set this to false to disable logging

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: "EPSG:4326",
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: "custom-mouse-position",
  target: document.getElementById("mouse-position") as HTMLElement,
});

function Map({ APIurl }: MapProps) {
  const points: Point[] = [];
  const { makeRequest, data, error, isLoading } = useRequestData();

  useEffect(() => {
    makeRequest(`pins/${APIurl}`);
  }, [APIurl]);

  useEffect(() => {
    if (Array.isArray(data)) {
      data.forEach((pin: any) => {
        points.push(new Point(fromLonLat([pin.longitude, pin.latitude])));
        console.log(`Pin: Longitude: ${pin.longitude}, Latitude: ${pin.latitude}`);
      });
    }

    const view = new View({
      center: [0, 0],
      zoom: 2,
    }) as View;
    const vectorSource = new VectorSource({
      features: points.map((point) => {
        return new Feature({
          geometry: point,
        });
      }),
    });
    const map = new OlMap({
      target: "map",
      controls: defaultControls().extend([mousePositionControl]),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: view,
    });
    getBrowserLocation(map, view);

    let lastLogTime = 0;

    // Add pointermove event listener to log mouse position
    map.on('pointermove', (event) => {
      if (!debug) return; // Check if debug is true
      const currentTime = Date.now();
      if (currentTime - lastLogTime >= 1000) {
        lastLogTime = currentTime;
        const coordinates = toLonLat(event.coordinate);
        console.log(`Longitude: ${coordinates[0]}, Latitude: ${coordinates[1]}`);
      }
    });
  }, [data]);

  const getBrowserLocation = (map: OlMap, view: View) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates = fromLonLat([longitude, latitude]);
        view.setCenter(coordinates);
        view.setZoom(12);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  return data && <div id="map"></div>;
}

export default Map;
import "ol/ol.css";

import { useEffect, useState } from "react";

import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";
import MousePosition from "ol/control/MousePosition.js";
import OSM from "ol/source/OSM";
import { default as OlMap } from "ol/Map";
import Point from "ol/geom/Point";
import { Size } from "ol/size";
import { Source } from "ol/source";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { createStringXY } from "ol/coordinate.js";
import { defaults as defaultControls } from "ol/control.js";
import { fromLonLat } from "ol/proj";

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: "EPSG:4326",
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: "custom-mouse-position",
  target: document.getElementById("mouse-position") as HTMLElement,
});

const points: Point[] = [];
points.push(new Point(fromLonLat([37.41, 8.82])));

function Map() {
  const [currentLocation, setCurrentLocation] = useState([0, 0]);

  const getBrowserLocation = (map: OlMap, view: View, source: any) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);
        const feature = source.getFeatures()[1];
        const point: Point = feature.getGeometry() as Point;
        const size: Size = map.getSize() as Size;
        view.centerOn(point.getCoordinates(), size, [570, 500]);
      },
      (error) => {
        console.log(error);
      }
    );
  };
  useEffect(() => {
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
          source: vectorSource
        }),
      ],
      view: view,
    });
    getBrowserLocation(map, view, vectorSource);
  }, []);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
}

export default Map;

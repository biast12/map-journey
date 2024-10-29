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
import { useEffect, useState } from "react";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { close } from "ionicons/icons";
import useRequestData from "../hooks/useRequestData";
import ShowPinModal from "../modals/ShowPinModal";

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
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const openShowPinModal = () => setShowPinModal(true);
  const closeShowPinModal = () => setShowPinModal(false);

  useEffect(() => {
    makeRequest(`pins/${APIurl}`);
  }, [APIurl]);

  useEffect(() => {
    if (Array.isArray(data)) {
      data.forEach((pin: any) => {
        points.push(new Point(fromLonLat([pin.longitude, pin.latitude])));
      });
    }

    const view = new View({
      center: [0, 0],
      zoom: 2,
    }) as View;
    const vectorSource = new VectorSource({
      features: points.map((point, index) => {
        const feature = new Feature({
          geometry: point,
        });
        feature.setId(index);
        return feature;
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
    map.on("pointermove", (event) => {
      if (!debug) return; // Check if debug is true
      const currentTime = Date.now();
      if (currentTime - lastLogTime >= 1000) {
        lastLogTime = currentTime;
        const coordinates = toLonLat(event.coordinate);
        console.log(
          `Longitude: ${coordinates[0]}, Latitude: ${coordinates[1]}`
        );
      }
    });

    // Add click event listener to open ShowPinModal
    map.on("click", (event) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const pinIndex = feature.getId();
        if (pinIndex !== undefined && data[pinIndex] !== undefined) {
          const pinData = data[pinIndex];
          setSelectedPin(pinData);
          openShowPinModal();
        }
      });
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

  return (
    <>
      {data && <div id="map"></div>}
      <IonModal isOpen={showPinModal} onDidDismiss={closeShowPinModal}>
        <div className="modal-content">
          <IonButton
            className="close-button"
            onClick={closeShowPinModal}
            fill="clear"
          >
            <IonIcon icon={close} />
          </IonButton>
          <ShowPinModal pinData={selectedPin} />
        </div>
      </IonModal>
    </>
  );
}

export default Map;

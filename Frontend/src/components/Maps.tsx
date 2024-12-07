import { useEffect, useState } from "react";
import { IonButton, IonIcon, IonImg, IonModal } from "@ionic/react";
import { useTranslation } from "react-i18next";
import "ol/ol.css";
import {
  Circle as CircleStyle,
  Fill,
  Icon,
  Stroke,
  Style,
  Text,
} from "ol/style.js";
import { Cluster, OSM, Vector as VectorSource } from "ol/source.js";
import { Extent, createEmpty, extend } from "ol/extent.js";
import { MousePosition, defaults as defaultControls } from "ol/control.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { fromLonLat } from "ol/proj";

import Feature from "ol/Feature";
import { FeatureLike } from "ol/Feature";
import { default as OlMap } from "ol/Map";
import Point from "ol/geom/Point";
import View from "ol/View";
import { close } from "ionicons/icons";
import { createStringXY } from "ol/coordinate.js";
import { Geolocation } from "@capacitor/geolocation";

/* Hooks */
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/ProviderContext";

/* Components */
import ShowPinModal from "../components/modals/ShowPinModal";
import Toast, { showToastMessage } from "./Toast";
import Loader from "./Loader";

import "./Maps.scss";

interface MapProps {
  APIurl: string;
  pinID?: string | null;
}

interface PinData {
  id: string;
  longitude: number;
  latitude: number;
  [key: string]: any;
}

// Predefined styles for clustering
const distanceBetweenPinsBeforeClustering = 20; // Distance between pins before clustering
const clusterRadius = 5; // base radius of the cluster circle it is multiplied by the number of pins in the cluster
const clusterMultiplier = 0.8; // Multiplier for the cluster circle radius after the calculation
const clusterFillColor = "#236477"; // Color of the cluster circle
const clusterStrokeColor = "#fff"; // Color of the cluster circle stroke
const clusterTextColor = "#fff"; // Color of the text/number inside the cluster circle

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(6),
  projection: "EPSG:4326",
  className: "custom-mouse-position",
  target: document.getElementById("mouse-position") as HTMLElement,
});

function createStyle(size: number = 0.3) {
  return new Style({
    image: new Icon({
      anchor: [0.5, 0.96],
      crossOrigin: "anonymous",
      src: "icons/ping.webp",
      scale: size,
    }),
  });
}

function createClusterStyle(feature: FeatureLike): Style {
  const size = feature.get("features").length;
  let style;
  if (size > 1) {
    style = new Style({
      image: new CircleStyle({
        radius: clusterRadius * size * clusterMultiplier,
        stroke: new Stroke({
          color: clusterStrokeColor,
        }),
        fill: new Fill({
          color: clusterFillColor,
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({
          color: clusterTextColor,
        }),
      }),
    });
  } else {
    style = createStyle();
  }
  return style;
}

function Map({ APIurl, pinID }: MapProps) {
  const { t } = useTranslation();
  const points: Feature[] = [];

  /* States */
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);

  /* Hooks */
  const { makeRequest, data, isLoading } = useRequestData();
  const { role } = useAuth();

  /* Functions */
  const openShowPinModal = () => setShowPinModal(true);
  const closeShowPinModal = () => setShowPinModal(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await makeRequest(`pins/${APIurl}`);
      } catch (error) {
        showToastMessage(t("map.error_message"));
      }
    };

    fetchData();
  }, [APIurl]);

  useEffect(() => {
    if (Array.isArray(data)) {
      data.forEach((pin: PinData) => {
        const point = new Point(fromLonLat([pin.longitude, pin.latitude]));
        const feature = new Feature({
          geometry: point,
        });
        feature.setId(pin.id);
        points.push(feature);
      });
    }

    const view = new View({
      center: [0, 0],
      zoom: 2,
      enableRotation: false,
    }) as View;
    const vectorSource = new VectorSource({
      features: points,
    });

    const clusterSource = new Cluster({
      distance: distanceBetweenPinsBeforeClustering,
      source: vectorSource,
    });

    const map = new OlMap({
      target: "map",
      controls:
        role === "admin"
          ? defaultControls().extend([mousePositionControl])
          : defaultControls(),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          style: (feature: FeatureLike) => createClusterStyle(feature),
          source: clusterSource,
        }),
      ],
      view: view,
    });

    // Add click event listener to open ShowPinModal or zoom in on cluster
    map.on("click", (event) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const features = feature.get("features");
        // Open ShowPinModal if only one pin is clicked and zoom in on cluster if multiple pins are clicked
        if (features.length === 1) {
          const pinIndex = features[0].getId();
          if (pinIndex !== undefined && data !== undefined) {
            const pin = data.find((pin: PinData) => pin.id === pinIndex);
            if (pin) {
              setSelectedPin(pin);
              view.animate(
                { center: fromLonLat([pin.longitude, pin.latitude]) },
                { zoom: 19 },
                { duration: 10000 }
              );
              openShowPinModal();
            }
          }
        } else if (features.length > 1) {
          // Zoom in on cluster
          const extent = createEmpty();
          features.forEach((feature: Feature) => {
            extend(extent, feature.getGeometry()?.getExtent() as Extent);
          });
          map.getView().fit(extent, { duration: 1000 });
        }
      });
    });

    if (pinID && data) {
      const pin = data.find((pin: PinData) => pin.id === pinID);
      if (pin) {
        setSelectedPin(pin);
        view.animate(
          { center: fromLonLat([pin.longitude, pin.latitude]) },
          { zoom: 19 },
          { duration: 10000 }
        );
        openShowPinModal();
      }
    } else {
      getBrowserLocation(view);
    }
  }, [data]);

  const getBrowserLocation = async (view: View) => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const coordinates = fromLonLat([longitude, latitude]);
      view.setCenter(coordinates);
      view.setZoom(12);
    } catch (error) {
      console.error("Error getting current position:", error);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <Toast />
      {data && (
        <div id="map">
          {/* Preload the image cause else React/Ionic will not load it and add it to "the public folder" */}
          <IonImg
            src="icons/ping.webp"
            alt={t("map.pin_alt")}
            style={{ display: "none" }}
            aria-hidden="true"
          />
        </div>
      )}
      <IonModal isOpen={showPinModal} onDidDismiss={closeShowPinModal}>
        <div className="modal-content">
          <IonButton
            className="close-button"
            onClick={closeShowPinModal}
            fill="clear"
            shape="round"
          >
            <IonIcon slot="icon-only" icon={close} />
          </IonButton>
          <ShowPinModal pinData={selectedPin} />
        </div>
      </IonModal>
    </>
  );
}

export default Map;

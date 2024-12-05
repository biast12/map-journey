import { useEffect } from "react";

/* Components */
import PinsManagement from "../../components/admin/PinsManagement";

import "./Pins.scss";

const Pins = () => {
  useEffect(() => {
    document.title = "Map Journey - Pins Settings";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return <PinsManagement url={"pins"} />;
};

export default Pins;

import { useEffect } from "react";
import Map from "../components/Maps";

interface OwnMapProps {
  userID: string;
  pinId?: string | null;
}

function GlobalMap({ userID, pinId }: OwnMapProps) {
  useEffect(() => {
    document.title = "Map Journey - Global Map";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <>
      <Map APIurl={`all/${userID}`} pinID={pinId} />
    </>
  );
}

export default GlobalMap;

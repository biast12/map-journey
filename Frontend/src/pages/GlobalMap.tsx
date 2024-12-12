import { useEffect } from "react";
import Map from "../components/Maps";

interface OwnMapProps {
  userData: UserData;
  pinId?: string | null;
}

function GlobalMap({ userData, pinId }: OwnMapProps) {
  useEffect(() => {
    document.title = "Map Journey - Global Map";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <>
      <Map userData={userData} APIurl={`all/${userData.id}`} pinID={pinId} />
    </>
  );
}

export default GlobalMap;

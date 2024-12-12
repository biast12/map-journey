import { useEffect } from "react";
import Map from "../components/Maps";

interface OwnMapProps {
  userData: UserData;
}

function OwnMap({ userData }: OwnMapProps) {
  useEffect(() => {
    document.title = "Map Journey - Own Map";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <>
      <Map userData={userData} APIurl={userData.id} />
    </>
  );
}

export default OwnMap;

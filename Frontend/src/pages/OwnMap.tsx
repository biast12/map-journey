import { useEffect } from "react";
import Map from "../components/Maps";

interface OwnMapProps {
  userID: string;
}

function OwnMap({ userID }: OwnMapProps) {
  useEffect(() => {
    document.title = "Map Journey - Own Map";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <>
      <Map APIurl={userID} />
    </>
  );
}

export default OwnMap;

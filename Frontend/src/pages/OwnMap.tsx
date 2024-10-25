import Map from "../components/Maps";

interface OwnMapProps {
  userID: string;
}

function OwnMap({ userID }: OwnMapProps) {
  return (
    <>
      <Map APIurl={userID} />
    </>
  );
}

export default OwnMap;

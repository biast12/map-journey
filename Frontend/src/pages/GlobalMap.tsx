import Map from "../components/Maps";

interface OwnMapProps {
  userID: string;
}

function GlobalMap({ userID }: OwnMapProps) {
  return (
    <>
      <Map APIurl={`all/${userID}`} />
    </>
  );
}

export default GlobalMap;

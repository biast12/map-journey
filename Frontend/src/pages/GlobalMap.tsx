import Map from "../components/Maps";

interface OwnMapProps {
  userID: string;
  pinId?: string | null;
}

function GlobalMap({ userID, pinId }: OwnMapProps) {
  return (
    <>
      <Map APIurl={`all/${userID}`} pinID={pinId} />
    </>
  );
}

export default GlobalMap;

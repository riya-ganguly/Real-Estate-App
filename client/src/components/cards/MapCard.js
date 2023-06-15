import GoogleMapReact from "google-map-react";
import { GOOGLE_PLACES_KEY } from "../../config";

export default function MapCard({ad}) {

    const defaultProps = {
        center: {
            lat: ad?.location?.coordinates[1],
            lng: ad?.location?.coordinates[0],
        },
        zoom: 11,
    };

if (ad?.location?.coordinates?.length) {
    return (
        <div style={{width: "100%", height: "350px", }}>
            <GoogleMapReact 
                bootstrapURLKeys={{ key: GOOGLE_PLACES_KEY }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
            >
                <div
                    lat = {ad?.location?.coordinates[1]}
                    lng = {ad?.location?.coordinates[0]}
                >
                    <span className="lead">📌</span>
                </div>
            </GoogleMapReact>
        </div>
    )}
}

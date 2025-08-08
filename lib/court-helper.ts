/*
this function will take in a latitude and longitude and check if it is within 1km of a tennis court
specifically, the ones in courtLocatons.

it will return the name of the court if it is within 1km, otherwise it will return null
*/

const courtLocations = [
    {
        name: 'prospect-park',
        latitude: 40.6511936,
        longitude: -73.971698
    },
    {
        name: 'fort-greene',
        latitude: 40.691086,
        longitude: -73.975854
    },
    {
        name: 'mccarren',
        latitude: 40.721734,
        longitude: -73.954570
    },
    {
        name: 'central-park',
        latitude: 40.789949,
        longitude: -73.961942
    },
    {
        name: 'riverside',
        latitude: 40.79733,
        longitude: -73.97675
    },
    {
        name: 'randalls-island',
        latitude: 40.79296,
        longitude: -73.91943
    },
    {
        name: 'hudson-river',
        latitude: 40.72724,
        longitude: -74.013901
    },
    {
        name: 'fractal-tech',
        latitude: 40.715226,
        longitude: -73.949295
    },
]

interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Calculates the distance (in kms) between point A and B using earth's radius as the spherical surface
 * @param pointA Coordinates from Point A
 * @param pointB Coordinates from Point B
 * Based on https://www.movable-type.co.uk/scripts/latlong.html
 */
function haversineDistance(pointA: Coordinates, pointB: Coordinates): number {
    var radius = 6371; // km     

    //convert latitude and longitude to radians
    const deltaLatitude = (pointB.latitude - pointA.latitude) * Math.PI / 180;
    const deltaLongitude = (pointB.longitude - pointA.longitude) * Math.PI / 180;

    const halfChordLength = Math.cos(
        pointA.latitude * Math.PI / 180) * Math.cos(pointB.latitude * Math.PI / 180)
        * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2)
        + Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2);

    const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLength), Math.sqrt(1 - halfChordLength));

    return radius * angularDistance;
}

const distance = haversineDistance({
    latitude: 39.352629,
    longitude: -7.514824
},
    {
        latitude: 38.744263,
        longitude: -8.084076
    })
console.log(distance);

export function checkLocation(latitude: number, longitude: number): string | null {

    for (const court of courtLocations) {
        const distance = haversineDistance({ latitude, longitude }, { latitude: court.latitude, longitude: court.longitude });

        if (distance <= 1) { // less than 1km
            return court.name;
        }
    }

    return null;
}
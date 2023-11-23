var credentials = "AmmJKyxVf-6eaa2iHK_GT4J0wH58FQbLciGKGgSMYZWJSjeZ8x5Tc67SrzWnTLmQ";
var bingMap = null;
var selectedPin = null;
const pinPointSale = [];
const pinGarage = [];
const pinParkingPlace = [];

function initializeBingMap() {
    GetMap();
}

function GetMap() {
    lat = -34.670560;
    long = -58.562780;


    if (viewName === "parking-register") {
        document.getElementById("lat").value = lat;
        document.getElementById("ln").value = long;
    }

    bingMap = new Microsoft.Maps.Map("#myMap", {
        credentials: credentials,
        center: new Microsoft.Maps.Location(lat, long),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        zoom: 16
    });

    var center = bingMap.getCenter();

    const url = `https://dev.virtualearth.net/REST/v1/Locations/${lat},${long}?key=${credentials}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.resourceSets.length > 0 && data.resourceSets[0].resources.length > 0) {
                var address = data.resourceSets[0].resources[0].address.formattedAddress;
                var personalPin = createPin(center, '¡Yo!', address, "PERSONAL");

                setInfoboxOnPin(personalPin);
                clickFunctionToInfoboxPin(personalPin);

                if (viewName === "parking-register") {
                    adjustPersonalPinMap(personalPin);
                }

                bingMap.entities.push(personalPin);
            } else {
                console.error('No se encontró ninguna dirección.');
            }
        })
        .catch(error => {
            console.error('Error en la solicitud: ', error);
        });
    if (viewName === "home") {
        createPinParkingPlaces('All');
    }
}

function adjustPersonalPinMap(personalPin) {
    Microsoft.Maps.Events.addHandler(bingMap, 'click', function (e) {
        var newCenter = e.location;
        var newLat = newCenter.latitude;
        var newLng = newCenter.longitude;

        personalPin.setLocation(newCenter);

        document.getElementById("lat").value = newLat;
        document.getElementById("ln").value = newLng;

        const newUrl = `https://dev.virtualearth.net/REST/v1/Locations/${newLat},${newLng}?key=${credentials}`;

        fetch(newUrl)
            .then(response => response.json())
            .then(newData => {
                if (newData.resourceSets.length > 0 && newData.resourceSets[0].resources.length > 0) {
                    personalPin.metadata.description = newData.resourceSets[0].resources[0].address.formattedAddress;
                } else {
                    console.error('No se encontró ninguna dirección.');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud: ', error);
            });
        setInfoboxOnPin(personalPin);
    });
}

function createPinParkingPlaces(type) {
    var parkingPlaces = [
        {
            id: 24,
            geolocation: {lat: -34.668094, ln: -58.566560},
            name: "UNLaM",
            type: "Garage",
        },
        {
            id: 25,
            geolocation: {lat: -34.672212, ln: -58.567592},
            name: "Punto de Pago 1",
            type: "PointSale",
        },
        {
            id: 26,
            geolocation: {lat: -34.678361, ln: -58.560129},
            name: "Punto de Pago 2",
            type: "PointSale",
        },
        {
            id: 27,
            geolocation: {lat: -34.677681, ln: -58.566560},
            name: "Punto de Pago 3",
            type: "PointSale",
        },
    ];
    var promises = [];

    for (let i = 0; i < parkingPlaces.length; i++) {
        const lat = parkingPlaces[i].geolocation.lat;
        const ln = parkingPlaces[i].geolocation.ln;
        const title = parkingPlaces[i].name;
        const url = `https://dev.virtualearth.net/REST/v1/Locations/${lat},${ln}?key=${credentials}`;

        promises.push(
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.resourceSets.length > 0 && data.resourceSets[0].resources.length > 0) {
                        const address = data.resourceSets[0].resources[0].address.formattedAddress;
                        let pin;

                        if (viewName === "home" && type === 'All') {
                            pin = createPin(new Microsoft.Maps.Location(lat, ln), title, address, parkingPlaces[i].type);
                        }


                        if (viewName === "parking-register") {
                            if (type === 'PointSale' && parkingPlaces[i].type === 'PointSale') {
                                pin = createPin(new Microsoft.Maps.Location(lat, ln), title, address, parkingPlaces[i].type);
                            }
                            else if (type === 'Garage' && parkingPlaces[i].type === 'Garage') {
                                pin = createPin(new Microsoft.Maps.Location(lat, ln), title, address, parkingPlaces[i].type);
                            }
                        }

                        setInfoboxOnPin(pin);

                        if (viewName === "parking-register" && type === "PointSale") {
                            Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                                for (var j = 0; j < pinPointSale.length; j++) {
                                    pinPointSale[j].infobox.setOptions({ visible: false });
                                }

                                pin.infobox.setOptions({ visible: true });

                                if (selectedPin) {
                                    var customIconUrl = "img/pinIcons/point-icon.png";
                                    selectedPin.setOptions({ icon: customIconUrl });
                                }

                                selectedPin = pin;
                                var customIconUrlSelected = "img/pinIcons/point-icon-selected.png";
                                pin.setOptions({ icon: customIconUrlSelected });
                                document.getElementById("pointSale").value = parkingPlaces[i].id;
                                document.getElementById("pointSaleText").textContent = parkingPlaces[i].name + " | " + address;
                                document.getElementById("feePerHourAmmount").textContent = parkingPlaces[i].feePerHour;
                            });
                        } else {
                            clickFunctionToInfoboxPin(pin);
                        }
                        if (type === 'PointSale') pinPointSale.push(pin);
                        if (type === 'Garage') pinGarage.push(pin);
                        if (type === 'All') pinParkingPlace.push(pin);
                    } else {
                        console.error('No se encontró ninguna dirección.');
                    }
                })
                .catch(error => {
                    console.error('Error en la solicitud: ', error);
                })
        );
    }

    Promise.all(promises)
        .then(() => {
            if (type === 'PointSale') bingMap.entities.push(pinPointSale);
            if (type === 'Garage') bingMap.entities.push(pinGarage);
            if (type === 'All') bingMap.entities.push(pinParkingPlace);
        })
        .catch(error => {
            console.error('Error al cargar los datos: ', error);
        });
}

function createPin(location, title, description, type) {
    var customIconUrl;
    switch (type) {
        case "PERSONAL":
            customIconUrl = "img/pinIcons/loc-icon.png";
            break;
        case "PointSale":
            customIconUrl = "img/pinIcons/point-icon.png";
            break;
        case "Garage":
            customIconUrl = "img/pinIcons/garage-icon.png";
            break;
        default:
            break;
    }

    var iconOptions = {
        title: title,
        icon: customIconUrl,
    };

    var pin = new Microsoft.Maps.Pushpin(location, iconOptions);
    pin.metadata = { description: description };

    return pin;
}

function setInfoboxOnPin(pin) {
    var infoboxOffset = new Microsoft.Maps.Point(0, -170);

    if (!pin.infobox) {
        var center = pin.getLocation();
        var title = pin.getTitle();
        var description = pin.metadata.description;

        var infobox = new Microsoft.Maps.Infobox(center, {
            title: title,
            description: description,
        });

        infobox.setMap(bingMap);
        infobox.setOptions({
            visible: false,
            offset: infoboxOffset
        })
        pin.infobox = infobox;
    } else {
        var newCenter = pin.getLocation();
        var newTitle = pin.getTitle();
        var newDescription = pin.metadata.description;

        infobox.setLocation(newCenter);
        infobox.setOptions({
            title: newTitle,
            description: newDescription,
            visible: false,
            offset: infoboxOffset
        });
    }
}

function clickFunctionToInfoboxPin(pin) {
    Microsoft.Maps.Events.addHandler(pin, 'click', function () {
        pin.infobox.setOptions({ visible: true });
    });
}

function deleteParkingPlacePin(type) {
    if (type === 'Garage')
        bingMap.entities.remove(pinPointSale);
    if (type === 'PointSale')
        bingMap.entities.remove(pinGarage);
}
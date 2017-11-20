window.LocalshredTravelMap = (() => {
  const { fetch, R, Request } = window

  const ICONS = {
    true: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    false: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
  }

  const MAP_ELEMENT_ID = 'map'
  const MAP_OPTIONS = {
    zoom: 1,
    center: {
      lat: -3.0115848030750905,
      lng: 8.189064499999992
    }
  }

  const loadTravelLocations = () =>
    fetch(new Request('/data/travel/locations.json')).then(response =>
      response.json()
    )

  const createMap = () => {
    const map = new window.google.maps.Map(
      document.getElementById(MAP_ELEMENT_ID),
      MAP_OPTIONS
    )

    map.addListener('click', event => {
      console.log({ lat: event.latLng.lat(), lng: event.latLng.lng() })
    })
    return map
  }

  const toggleWindow = (map, marker, infoWindow) => {
    let isOpen = false
    return () => {
      if (isOpen) {
        infoWindow.close()
        isOpen = false
      } else {
        infoWindow.open(map, marker)
        isOpen = true
      }
    }
  }

  const createMarker = R.curry((map, location) => {
    const infoWindow = new window.google.maps.InfoWindow({
      content: `${location.title} ${location.dateStart}`
    })

    const marker = new window.google.maps.Marker({
      animation: window.google.maps.Animation.DROP,
      icon: ICONS[R.propOr(true, 'family', location)],
      position: location.position,
      title: location.title,
      map
    })
    marker.addListener('click', toggleWindow(map, marker, infoWindow))

    return marker
  })

  const renderMap = locations => {
    const map = createMap()
    const markers = R.map(createMarker(map), locations)
    return { map, markers }
  }

  const render = () =>
    loadTravelLocations().then(renderMap).catch(console.error.bind(console))

  return {
    createMap,
    createMarker,
    loadTravelLocations,
    render,
    renderMap
  }
})()

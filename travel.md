---
layout: main
title: Our World Travels
scripts:
  header:
    - "//cdnjs.cloudflare.com/ajax/libs/ramda/0.25.0/ramda.min.js"
    - "/js/travel.js"
  body:
    - "https://maps.googleapis.com/maps/api/js?key=AIzaSyD4G4S9xDBG2EuEo2MgVCvgAwlFTvYHls4&callback=LocalshredTravelMap.render"
---

<div id="map"></div>

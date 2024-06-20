mapboxgl.accessToken = "pk.eyJ1IjoibGF6MTMiLCJhIjoiY2xqd3NydDI0MGVmaDNkbnZ1eDJodXZ4ZSJ9.Dw_GajVD9Y5z20S6BgfbpA";

const map = new mapboxgl.Map({
  container: "map",
  center: [9.0129, 40.1209],
  zoom: 7,
});

const allRoutes = [];
const dayLayers = [];
let allLayer = null;
let tripData = null;

async function fetchData() {
  const response = await fetch("data.json");
  data = await response.json();
  tripData = data.trips[0]; // Assuming you want to use the first trip
}

function loadGPXFiles() {
  const gpxFiles = tripData.days;

  Promise.all(
    gpxFiles.map((day, index) =>
      fetch("data/gpx/" + day.gpx_file_name)
        .then((response) => response.text())
        .then((gpxData) => {
          const parser = new DOMParser();
          const gpx = parser.parseFromString(gpxData, "application/xml");
          const geojson = toGeoJSON.gpx(gpx);

          const routeLayer = {
            id: "route" + index,
            type: "line",
            source: {
              type: "geojson",
              data: geojson,
            },
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": day.track_color,
              "line-width": 5,
            },
          };

          dayLayers.push(routeLayer);
          allRoutes.push(...geojson.features);

          map.on("load", () => {
            map.addLayer(routeLayer);
            map.setLayoutProperty("route" + index, "visibility", "none");
          });

          return { day, index };
        })
    )
  ).then((results) => {
    results.forEach(({ day, index }) => {
      const daySelector = document.createElement("label");
      daySelector.innerHTML = `<input type="checkbox" id="day${index}" onchange="toggleDay(${index})"> ${day.label}<br>`;
      document.getElementById("daySelectors").appendChild(daySelector);
    });
  });
}

function toggleDay(index) {
  const visibility = map.getLayoutProperty("route" + index, "visibility");
  if (visibility === "visible") {
    map.setLayoutProperty("route" + index, "visibility", "none");
  } else {
    map.setLayoutProperty("route" + index, "visibility", "visible");
  }
}

function toggleAllRoutes() {
  const showAll = document.getElementById("showAll").checked;
  const daySelectors = document.getElementById("daySelectors").getElementsByTagName("input");

  if (showAll) {
    if (!allLayer) {
      const allRoutesGeoJSON = {
        type: "FeatureCollection",
        features: allRoutes,
      };
      allLayer = {
        id: "allRoutes",
        type: "line",
        source: {
          type: "geojson",
          data: allRoutesGeoJSON,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "rgba(0, 0, 255, 0.5)",
          "line-width": 5
        },
      };
      map.addLayer(allLayer);
    } else {
      map.setLayoutProperty("allRoutes", "visibility", "visible");
    }
    dayLayers.forEach((_, index) => {
      if (map.getLayer("route" + index)) {
        map.setLayoutProperty("route" + index, "visibility", "none");
      }
    });
    // Disable all day checkboxes
    for (let i = 0; i < daySelectors.length; i++) {
      daySelectors[i].checked = false;
      daySelectors[i].disabled = true;
    }
  } else {
    map.setLayoutProperty("allRoutes", "visibility", "none");
    dayLayers.forEach((_, index) => {
      if (map.getLayer("route" + index)) {
        map.setLayoutProperty("route" + index, "visibility", "none");
      }
    });
    // Enable all day checkboxes
    for (let i = 0; i < daySelectors.length; i++) {
      daySelectors[i].disabled = false;
    }
  }
}

function processImages() {
  tripData.days.forEach((day, dayIndex) => {
    day.images.forEach((imageData) => {
      const imagePath = imageData.filename;
      const img = new Image();

      img.onload = function () {
        EXIF.getData(img, function () {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const lon = EXIF.getTag(this, "GPSLongitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef");
          const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

          if (lat && lon) {
            const latDecimal = convertDMSToDD(lat, latRef);
            const lonDecimal = convertDMSToDD(lon, lonRef);

            const el = document.createElement("div");
            el.className = "image-marker mapboxgl-marker";
            el.style.backgroundImage = "url(icons/image-solid.svg)";
            el.style.width = "30px";
            el.style.height = "30px";

            const marker = new mapboxgl.Marker(el)
              .setLngLat([lonDecimal, latDecimal])
              .addTo(map);

            const popup = new mapboxgl.Popup({
              offset: 25,
              closeOnClick: true,
              maxWidth: "400px",
            }).setHTML(
              "<a target='_blank' href='data/img/jpg_big/" +
              imagePath +
              "'><img src='data/img/optimized/" +
              imagePath +
              "' alt='Picture' style='width:280px;height:auto;'></a>"
            );

            marker.setPopup(popup);

            el.addEventListener("click", () => popup.addTo(map));
          }
        });
      };
      img.src = "data/img/optimized/" + imagePath;
    });
  });
}

function addVideoMarkers() {
  tripData.days.forEach((day) => {
    day.videos.forEach((video) => {
      const el = document.createElement("div");
      el.className = "video-marker mapboxgl-marker";
      el.style.backgroundImage = "url(icons/video-icon.svg)";
      el.style.width = "40px";
      el.style.height = "40px";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([video.lon, video.lat])
        .addTo(map);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeOnClick: true,
        maxWidth: "95vw",
      }).setHTML(
        `<div class="responsive-iframe-container"><iframe src="${video.videourl}" allowfullscreen></iframe></div>`
      );

      marker.setPopup(popup);
      el.addEventListener("click", () => popup.addTo(map));
    });
  });
}

function convertDMSToDD(dms, ref) {
  const degrees = dms[0].numerator;
  const minutes = dms[1].numerator;
  const seconds = dms[2].numerator / dms[2].denominator;

  let dd = degrees + minutes / 60 + seconds / 3600;

  if (ref === "S" || ref === "W") {
    dd = dd * -1;
  }
  return dd;
}

function hideMarkers() {
  const markers = document.getElementsByClassName("mapboxgl-marker");
  for (let i = 0; i < markers.length; i++) {
    markers[i].style.visibility = "hidden";
  }
}

function showMarkers() {
  const markers = document.getElementsByClassName("mapboxgl-marker");
  for (let i = 0; i < markers.length; i++) {
    markers[i].style.visibility = "visible";
  }
}

function toggleShowMarkers() {
  const hideMarkerCheck = document.getElementById("hideMarkers").checked;
  if (!hideMarkerCheck) {
    showMarkers();
  } else {
    hideMarkers();
  }
}
function initHammenu() {
  
  const hamMenu = document.querySelector(".ham-menu");

  const offScreenMenu = document.querySelector(".menu");

  hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    offScreenMenu.classList.toggle("active");
  });
  hamMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
}

async function initialize() {
  await fetchData();
  loadGPXFiles();
  initHammenu();
  processImages();
  addVideoMarkers();
  
  
}

map.on('load', initialize);

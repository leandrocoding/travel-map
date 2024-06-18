mapboxgl.accessToken =
  "pk.eyJ1IjoibGF6MTMiLCJhIjoiY2xqd3NydDI0MGVmaDNkbnZ1eDJodXZ4ZSJ9.Dw_GajVD9Y5z20S6BgfbpA";

const map = new mapboxgl.Map({
  container: "map",
//   style: "mapbox://styles/mapbox/streets-v11",
  center: [9.0129, 40.1209],
  zoom: 7,
});
const DARKRED = "rgba(166, 39, 30 ,0.5)";
const DARKBLUE = "rgba(5, 5, 255, 0.5)";

const gpxFiles = [
  {
    file: "SA-Day-1.gpx",
    label: "Day 1: Start of Adventure",
    color: DARKRED,
  },
  {
    file: "SA-Day-2.gpx",
    label: "Day 2: Exploring the North-west coast",
    color: DARKBLUE,
  },
  {
    file: "SA-Day-3.gpx",
    label: "Day 3: TET to Oristano",
    color: DARKRED,
  },
  {
    file: "SA-Day-4.gpx",
    label: "Day 4: Exploring the clifs near Oristano",
    color: DARKBLUE,
  },
  {
    file: "SA-Day-5.gpx",
    label: "Day 5: Oristano - Sant Antico",
    color: DARKRED,
  },
  {
    file: "SA-Day-6.gpx",
    label: "Day 6: Sant Antico - Cagliari",
    color: DARKBLUE,
  },
  {
    file: "SA-Day-7.gpx",
    label: "Day 7: Cagliari - Belvi",
    color: DARKRED,
  },
  {
    file: "SA-Day-8.gpx",
    label: "Day 8: Belvi - Irgoli",
    color: DARKBLUE,
  },
  {
    file: "SA-Day-9.gpx",
    label: "Day 9: Irgoli - Olbia - Porto Torres",
    color: DARKRED,
  },
];

const mapImages = [
  "20240605_070837313_iOS.jpg",
  "20240605_070837313_iOS.jpg",
  "20240605_070839784_iOS.jpg",
  "20240605_075948626_iOS.jpg",
  "20240605_080043321_iOS.jpg",
  "20240605_081434644_iOS.jpg",
  "20240605_104655136_iOS.jpg",
  "20240605_161505752_iOS.jpg",
  "20240605_165008085_iOS.jpg",
  "20240605_171353817_iOS.jpg",
  "20240605_173249851_iOS.jpg",
  "20240605_183454198_iOS.jpg",
  "20240606_095504791_iOS.jpg",
  "20240606_100520333_iOS.jpg",
  "20240606_101409727_iOS.jpg",
  "20240606_150128495_iOS.jpg",
  "20240606_150147345_iOS.jpg",
  "20240606_151414754_iOS.jpg",
  "20240606_182241825_iOS.jpg",
  "20240607_082147251_iOS.jpg",
  "20240607_102241973_iOS.jpg",
  "20240607_102717757_iOS.jpg",
  "20240607_123958907_iOS.jpg",
  "20240607_130218154_iOS.jpg",
  "20240607_131008156_iOS.jpg",
  "20240607_131254514_iOS.jpg",
  "20240607_135711724_iOS.jpg",
  "20240607_174046755_iOS.jpg",
  "20240608_072554064_iOS.jpg",
  "20240608_080456823_iOS.jpg",
  "20240608_081331296_iOS.jpg",
  "20240608_081946126_iOS.jpg",
  "20240608_103553526_iOS.jpg",
  "20240608_114345278_iOS.jpg",
  "20240609_092825448_iOS.jpg",
  "20240609_093831159_iOS.jpg",
  "20240609_105623359_iOS.jpg",
  "20240609_120627547_iOS.jpg",
  "20240610_112033502_iOS.jpg",
  "20240610_120818083_iOS.jpg",
  "20240610_162550741_iOS.jpg",
  "20240610_162945749_iOS.jpg",
  "20240610_163059125_iOS.jpg",
  "20240610_164255280_iOS.jpg",
  "20240610_165301962_iOS.jpg",
  "20240610_165643856_iOS.jpg",
  "20240610_172818327_iOS.jpg",
  "20240610_183306380_iOS.jpg",
  "20240610_185114760_iOS.jpg",
  "20240611_102958448_iOS.jpg",
  "20240611_110036616_iOS.jpg",
  "20240611_114845764_iOS.jpg",
  "20240611_123334728_iOS.jpg",
  "20240611_125437182_iOS.jpg",
  "20240611_162127247_iOS.jpg",
  "20240612_092042799_iOS.jpg",
  "20240612_110059181_iOS.jpg",
  "20240612_115007150_iOS.jpg",
  "20240612_132941767_iOS.jpg",
  "20240613_102149778_iOS.jpg",
  "20240613_164808358_iOS.jpg",
];

const allRoutes = [];
const dayLayers = [];
let allLayer = null;
function genRGB() {
  let r, g, b;
  do {
    r,
      g,
      (b = Math.floor(Math.random() * 256)),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256);
  } while (r * 0.299 + g * 0.587 + b * 0.114 > 200);
  return "rgba(" + r + "," + g + "," + b + ",0.7)";
}

function generateColor() {
  let color;
  do {
    color = Math.floor(Math.random() * 16777215).toString(16);
  } while (isColorTooLight(color));
  return color;
}

// Check if a color is too light
function isColorTooLight(color) {
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
}
// Load and parse GPX files
function loadGPXFiles() {
  Promise.all(
    gpxFiles.map((gpxFile, index) =>
      fetch("data/gpx/" + gpxFile.file)
        .then((response) => response.text())
        .then((gpxData) => {
          const parser = new DOMParser();
          const gpx = parser.parseFromString(gpxData, "application/xml");
          const geojson = toGeoJSON.gpx(gpx);
          let r, g, b;
          r, g, (b = gpxFile.color);
          console.log(gpxFile.color);
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
              "line-color": gpxFile.color,
              "line-width": 5,
            },
          };

          dayLayers.push(routeLayer);
          allRoutes.push(...geojson.features);

          map.on("load", () => {
            map.addLayer(routeLayer);
            map.setLayoutProperty("route" + index, "visibility", "none");
          });

          return { gpxFile, index };
        })
    )
  ).then((results) => {
    results.forEach(({ gpxFile, index }) => {
      const daySelector = document.createElement("label");
      daySelector.innerHTML = `<input type="checkbox" id="day${index}" onchange="toggleDay(${index})"> ${gpxFile.label}<br>`;
      document.getElementById("daySelectors").appendChild(daySelector);
    });
  });
}

loadGPXFiles();

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
  const daySelectors = document
    .getElementById("daySelectors")
    .getElementsByTagName("input");

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
          "line-width": 5,
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
  mapImages.forEach((imagePath) => {
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
            "<a target=”_blank” href=data/img/jpg_big/" +
              imagePath +
              '><img src="' +
              "data/img/optimized/" +
              imagePath +
              '" alt="Picture" style="width:280px;height:auto;"></a>'
          );

          marker.setPopup(popup);

          el.addEventListener("click", () => popup.addTo(map));
          // el.addEventListener('mouseleave', () => popup.remove());
        }
      });
    };
    img.src = "data/img/optimized/" + imagePath; // this is the image where the exif data is going to be extracted
  });
}

function addVideoMarkers() {
  const videoMarkers = [
    //         {
    //     // "lng": 8.66480459267018,
    //     // "lat": 40.55910982526967
    // }
    {
      lat: 40.55910982526967,
      lon: 8.66480459267018,
      video: "https://www.youtube.com/watch?v=u1f2KGRRynE",
    },
  ];

  videoMarkers.forEach(({ lat, lon, video }) => {
    const el = document.createElement("div");
    el.className = "video-marker mapboxgl-marker";
    el.style.backgroundImage = "url(icons/video-icon.svg)";
    el.style.width = "40px";
    el.style.height = "40px";

    const marker = new mapboxgl.Marker(el).setLngLat([lon, lat]).addTo(map);

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeOnClick: true,
      maxWidth: "95vw",
    }).setHTML(
      '<div class="responsive-iframe-container"> <iframe src="https://www.youtube.com/embed/u1f2KGRRynE" allowfullscreen></iframe> </div>'
    );

    marker.setPopup(popup);

    // el.addEventListener('mouseenter', () => popup.addTo(map));
    // el.addEventListener('mouseleave', () => popup.remove());

    el.addEventListener("click", () => popup.addTo(map)); // Open popup on click
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
hideMarkers = () => {
  const markers = document.getElementsByClassName("mapboxgl-marker");
  for (let i = 0; i < markers.length; i++) {
    markers[i].style.visibility = "hidden";
  }
};
showMarkers = () => {
  const markers = document.getElementsByClassName("mapboxgl-marker");
  for (let i = 0; i < markers.length; i++) {
    markers[i].style.visibility = "visible";
  }
};
toggleShowMarkers = () => {
  const hideMarkerCheck = document.getElementById("hideMarkers").checked;
  if (!hideMarkerCheck) {
    showMarkers();
  } else {
    hideMarkers();
  }
};

processImages();
addVideoMarkers();

const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".menu");

hamMenu.addEventListener("click", () => {
  hamMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
});
hamMenu.classList.toggle("active");
offScreenMenu.classList.toggle("active");

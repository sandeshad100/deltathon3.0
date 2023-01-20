var x = document.getElementById("sendLocation");
x.addEventListener("click", function () {
  getLocation();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      // Success function
      showPosition,
      // Error function
      null,
      // Options. See MDN for details.
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  var latlon = position.coords.latitude + "," + position.coords.longitude;
  var img_url =
    "https://www.google.com/maps/search/?api=1&query=" +
    position.coords.latitude +
    "%2C" +
    position.coords.longitude;

  fetch("/location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location: img_url,
    }),
  }).then((res) => {
    console.log(res);
  });
}

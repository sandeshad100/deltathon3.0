function simulateClick(tabID) {
  document.getElementById(tabID).click();
}

function predictOnLoad() {
  // Simulate a click on the predict button
  setTimeout(simulateClick.bind(null, "predict-button"), 500);
}

// LOAD THE MODEL
let model;
(async function () {
  model = await tf.loadModel(
    "http://skin.test.woza.work/final_model_kaggle_version1/model.json"
  );
  $("#selected-image").attr("src", "./disease/image_6.jpg");

  $(".progress-bar").hide();

  predictOnLoad();
})();

$("#predict-button").click(async function () {
  let image = undefined;

  // IMAGE FROM FORNT-END
  image = $("#selected-image").get(0);

  // Pre-process the image
  let tensor = tf.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat();

  let offset = tf.scalar(127.5);

  tensor = tensor.sub(offset).div(offset).expandDims();

  let predictions = await model.predict(tensor).data();
  let top5 = Array.from(predictions)
    .map(function (p, i) {
      // this is Array.map
      return {
        probability: p,
        className: TARGET_CLASSES[i],
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 3);

  var file_name = "samplepic.jpg";
  $("#prediction-list").append(
    `<li class="w3-text-blue fname-font" style="list-style-type:none;">${file_name}</li>`
  );

  //$("#prediction-list").empty();
  top5.forEach(function (p) {
    $("#prediction-list").append(
      `<li style="list-style-type:none;">${
        p.className
      }: ${p.probability.toFixed(3)}</li>`
    );
  });
});

$("#image-selector").change(async function () {
  fileList = $("#image-selector").prop("files");

  model_processArray(fileList);
});

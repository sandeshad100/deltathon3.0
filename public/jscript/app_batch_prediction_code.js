async function model_makePrediction(fname) {
  // clear the previous variable from memory.
  let image = undefined;

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
        className: TARGET_CLASSES[i], // we are selecting the value from the obj
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 3);

  // Append the file name to the prediction list
  $("#prediction-list")
    .append(`<li class="w3-text-blue fname-font" style="list-style-type:none;">
	${fname}</li>`);

  //$("#prediction-list").empty();
  const className = top5.map(function (p, index) {
    $("#prediction-list").append(
      `<li style="list-style-type:none;">${
        p.className
      }: ${p.probability.toFixed(3)}</li>`
    );
    return p.className;
    
  });
  
  fetch("/consultDoctor/doctorAi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: ` How to cure ${className[0]}` }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("insertData").innerHTML = data.response;
      console.log(data);
    });

  // Add a space after the prediction for each image
  $("#prediction-list").append(`<br>`);
}

function model_delay() {
  return new Promise((resolve) => setTimeout(resolve, 200));
}

async function model_delayedLog(item, dataURL) {

  await model_delay();


  $("#selected-image").attr("src", dataURL);
  $("#displayed-image").attr("src", dataURL); //#########

}



async function model_processArray(array) {
  for (var item of fileList) {
    let reader = new FileReader();

    // clear the previous variable from memory.
    let file = undefined;

    reader.onload = async function () {
      let dataURL = reader.result;

      await model_delayedLog(item, dataURL);

      var fname = file.name;

      // clear the previous predictions
      $("#prediction-list").empty();

      // 'await' is very important here.
      await model_makePrediction(fname);
    };

    file = item;


    reader.readAsDataURL(file);
  }
}

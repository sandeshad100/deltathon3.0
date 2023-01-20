const API_KEY = '28ea89173amshbd47bbc1b2e04d9p155d8ajsnc8c90f2458a9';
const IMAGE_URL = 'https://my.clevelandclinic.org/-/scassets/images/org/health/articles/21737-cystic-acne-694069284';
const MIN_CONFIDENCE = 0.8;

async function detectAcne() {
  try {
    const response = await fetch('https://skin-analysis.p.rapidapi.com/face/effect/skin_analyze', {
      method: 'POST',
      headers: {
        
        'Content-Type': 'application/json',
        'x-rapidapi-key': API_KEY,
        'X-RapidAPI-Host': 'skin-analysis.p.rapidapi.com',
      },
      body: JSON.stringify({
        image_url: IMAGE_URL,
       
      })
    });

    const json = await response.json();
    console.log(json);
    if (json.results && json.results.length > 0) {
      const disease = json.results.find(result => result.confidence >= MIN_CONFIDENCE);
      if (disease) {
        console.log('Disease:', disease.name);
        console.log('Confidence:', disease.confidence);
      } else {
        console.log(`No disease detected with confidence above ${MIN_CONFIDENCE}`);
      }
    } else {
      console.log('No results returned by the API');
    }
  } catch (error) {
    console.error(error);
  }
}

detectAcne();
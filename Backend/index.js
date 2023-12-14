const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Function to calculate stoppages between two coordinates
async function calculateStoppages(start, end, startTime, travelTime) {
  const numStoppages = 5;
  const haltTime = 60; // in minutes

  // Calculate total travel time excluding stoppages
  const totalTimeWithoutStoppages = travelTime - (numStoppages * haltTime);

  // Calculate time between each stoppage
  const timeBetweenStoppages = totalTimeWithoutStoppages / (numStoppages + 1);

  // Calculate stoppage coordinates
  const stoppages = [];
  let currentTime = startTime;
  for (let i = 0; i < numStoppages; i++) {
    currentTime += timeBetweenStoppages;

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${start.lat}&lon=${start.lon}`
    );

    const stopName = response.data.display_name;

    stoppages.push({
      time: currentTime,
      location: stopName,
    });

    currentTime += haltTime; // Add halt time
  }

  return stoppages;
}

app.get('/stoppages', async (req, res) => {
  const start = { lat: 25.34957455169728, lon: 82.99796974281374 };
  const end = { lat: 25.33048369011401, lon: 83.02423928914392 }; 
  const startTime = 0;
  const travelTime = 720;
  try {
    const stoppages = await calculateStoppages(start, end, startTime, travelTime);
    res.json(stoppages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

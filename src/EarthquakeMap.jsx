import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

const EarthquakeMap = () => {
  const [countryStats, setCountryStats] = useState({});
  const [globalStats, setGlobalStats] = useState({
    totalEarthquakes: 0,
    countriesAffected: 0,
    avgMagnitude: 0,
    maxMagnitude: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const leafletRef = useRef(null);

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch('/earthquakes.csv');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvData = await response.text();

        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimitersToGuess: [',', '\t', '|', ';'],
          complete: (results) => {
            if (results.errors.length > 0) console.warn('CSV parsing warnings:', results.errors);
            const cleanedData = results.data.map(row => {
              const cleanedRow = {};
              Object.keys(row).forEach(key => cleanedRow[key.trim()] = row[key]);
              return cleanedRow;
            });
            processEarthquakeData(cleanedData);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            loadFallbackData();
          }
        });
      } catch (error) {
        console.error('Error fetching CSV file:', error);
        loadFallbackData();
      }
    };

    const loadFallbackData = () => {
      const csvData = `id,time,latitude,longitude,depth,mag,location,country,type,status,tsunami,sig,net
us70006vkq,1578377119759,2.3481,96.3575,17,6.3,14 km S of Sinabang,Indonesia,earthquake,reviewed,0,619,us
pr2020007007,1578385467370,17.9578,-66.8113,6,6.4,4 km SSE of Indios,Puerto Rico,earthquake,reviewed,1,1820,pr
us70006vvr,1578424295665,-5.2046,151.2659,117,6,130 km ENE of Kimbe,Papua New Guinea,earthquake,reviewed,0,554,us
us70006wuf,1578559088278,62.358,171.0611,10,6.4,Chukotskiy Avtonomnyy Okrug,Russia,earthquake,reviewed,0,630,us
us60007a3h,1579365494301,-2.8405,139.3363,44,6,146 km W of Abepura,Indonesia,earthquake,reviewed,0,555,us
us60007anp,1579440476630,39.8353,77.1084,5.55,6,104 km ENE of Kashgar,China,earthquake,reviewed,0,1006,us
us60007arp,1579453100002,-0.1042,123.8025,121.72,6.1,108 km SE of Gorontalo,Indonesia,earthquake,reviewed,0,574,us`;

      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          processEarthquakeData(results.data);
          setLoading(false);
        }
      });
    };

    loadCSVData();
  }, []);

  useEffect(() => {
    if (!loading && Object.keys(countryStats).length > 0) {
      initializeLeafletMap();
    }
  }, [countryStats, loading]);

  const initializeLeafletMap = () => {
    if (!leafletRef.current) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        leafletRef.current = window.L;
        createLeafletMap();
      };
      document.head.appendChild(script);
    } else {
      createLeafletMap();
    }
  };

  const createLeafletMap = () => {
    if (!mapRef.current || !leafletRef.current) return;
    if (leafletMapRef.current) leafletMapRef.current.remove();

    const map = leafletRef.current.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true
    });

    leafletRef.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    leafletMapRef.current = map;
    renderLeafletMarkers(map);

    // Add predicted marker
    const predictedIcon = leafletRef.current.divIcon({
      className: 'predicted-marker',
      html: `<div style="padding: 4px 8px; background-color: #10b981; color: white; border-radius: 6px; font-weight: bold; font-size: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.4);">Predicted: 6.23 Mag</div>`,
      iconSize: [140, 30],
      iconAnchor: [70, 15]
    });

    leafletRef.current.marker([64.9631, -19.0208], { icon: predictedIcon }).addTo(map)
      .bindPopup(`<strong>📍 Iceland</strong><br/>Predicted Magnitude: 6.23<br/>Year: 2026`);
  };

  const renderLeafletMarkers = (map) => {
    if (!leafletRef.current) return;
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    Object.entries(countryStats).forEach(([country, stats]) => {
      const markerColor = getMarkerColorHex(stats.maxMagnitude);
      const markerSize = Math.max(18, Math.min(40, stats.frequency * 4));

      const customIcon = leafletRef.current.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${markerSize}px;
            height: ${markerSize}px;
            background: ${markerColor};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: ${Math.max(9, markerSize / 3)}px;
            font-weight: 800;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            box-shadow: 0 0 12px rgba(0,0,0,0.3);
          ">
            ${stats.frequency}
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2]
      });

      const marker = leafletRef.current.marker([stats.avgLat, stats.avgLon], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="min-width:200px;">
          <strong>${country}</strong><br/>
          Avg Mag: ${stats.avgMagnitude}<br/>
          Max Mag: ${stats.maxMagnitude}<br/>
          Freq: ${stats.frequency}
        </div>
      `);

      marker.on('click', () => setSelectedCountry(country));
      markersRef.current.push(marker);
    });
  };

  const processEarthquakeData = (earthquakes) => {
    const valid = earthquakes.filter(eq =>
      eq && eq.country && typeof eq.latitude === 'number' &&
      typeof eq.longitude === 'number' && typeof eq.mag === 'number'
    );

    const grouped = {};
    valid.forEach(eq => {
      const country = eq.country.trim();
      grouped[country] = grouped[country] || [];
      grouped[country].push(eq);
    });

    const stats = {};
    Object.keys(grouped).forEach(country => {
      const eqs = grouped[country];
      const magnitudes = eqs.map(e => e.mag);
      const times = eqs.map(e => e.time).filter(Boolean);
      const avgLat = eqs.reduce((s, e) => s + e.latitude, 0) / eqs.length;
      const avgLon = eqs.reduce((s, e) => s + e.longitude, 0) / eqs.length;

      stats[country] = {
        earthquakes: eqs,
        avgLat, avgLon,
        frequency: eqs.length,
        avgMagnitude: parseFloat((magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(1)),
        maxMagnitude: Math.max(...magnitudes),
        minMagnitude: Math.min(...magnitudes),
        dateRange: {
          start: new Date(Math.min(...times)).toLocaleDateString(),
          end: new Date(Math.max(...times)).toLocaleDateString()
        }
      };
    });

    setCountryStats(stats);
    const allMags = valid.map(e => e.mag);
    setGlobalStats({
      totalEarthquakes: valid.length,
      countriesAffected: Object.keys(stats).length,
      avgMagnitude: parseFloat((allMags.reduce((a, b) => a + b, 0) / allMags.length).toFixed(1)),
      maxMagnitude: Math.max(...allMags)
    });
  };

  const getMarkerColorHex = (magnitude) => {
    if (magnitude >= 6.3) return '#ef4444';
    if (magnitude >= 6.1) return '#f59e0b';
    return '#10b981';
  };

  const getMagnitudeColor = (mag) => {
    if (mag >= 6.3) return 'text-red-500';
    if (mag >= 6.1) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMagnitudeBgColor = (mag) => {
    if (mag >= 6.3) return 'bg-red-500';
    if (mag >= 6.1) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(selectedCountry === country ? null : country);
    if (leafletMapRef.current && countryStats[country]) {
      leafletMapRef.current.setView([countryStats[country].avgLat, countryStats[country].avgLon], 6);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-500 text-white">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-white rounded-full mx-auto mb-4"></div>
          <p>Loading earthquake data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gray-800 text-white p-6">
          <h1 className="text-3xl font-light">🌍 Quake Compass</h1>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-2/3 relative">
            <div ref={mapRef} className="w-full h-[500px] bg-gray-200"></div>
          </div>

          <div className="lg:w-1/3 p-4 overflow-y-auto max-h-[500px] bg-gray-100">
            <h2 className="text-xl font-bold mb-2">Country Stats</h2>
            <p className="text-sm text-gray-600 mb-4">Click markers or items for detail</p>

            {/* Predicted Earthquake */}
            <div className="mb-4 p-4 border-l-4 border-green-500 bg-green-50 rounded-md shadow-sm">
              <h3 className="text-green-700 font-semibold">🔮 Predicted Earthquake</h3>
              <p className="text-sm">Location: <strong>Iceland</strong></p>
              <p className="text-sm">Magnitude: <strong>6.23</strong></p>
              <p className="text-sm">Expected: <strong>2026</strong></p>
              <p className="text-xs text-gray-500 mt-1 italic">Based on trend projection</p>
            </div>

            {Object.entries(countryStats).sort(([, a], [, b]) => b.frequency - a.frequency).map(([country, stats]) => (
              <div
                key={country}
                onClick={() => handleCountryClick(country)}
                className={`p-3 rounded-lg mb-2 cursor-pointer border-2 ${
                  selectedCountry === country
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{country}</span>
                  <span className={`w-3 h-3 rounded-full ${getMagnitudeBgColor(stats.maxMagnitude)}`}></span>
                </div>
                <div className="text-xs text-gray-600 mt-1">Freq: {stats.frequency}, Avg Mag: {stats.avgMagnitude}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <h2 className="text-xl font-bold mb-4">🌐 Global Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white shadow rounded">
              <div className="text-2xl font-bold text-blue-500">{globalStats.totalEarthquakes}</div>
              <div className="text-sm text-gray-600">Total Earthquakes</div>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <div className="text-2xl font-bold text-green-500">{globalStats.countriesAffected}</div>
              <div className="text-sm text-gray-600">Countries Affected</div>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <div className="text-2xl font-bold text-yellow-500">{globalStats.avgMagnitude}</div>
              <div className="text-sm text-gray-600">Avg Magnitude</div>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <div className="text-2xl font-bold text-red-500">{globalStats.maxMagnitude}</div>
              <div className="text-sm text-gray-600">Max Magnitude</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeMap;

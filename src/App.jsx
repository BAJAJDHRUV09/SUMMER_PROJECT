import React, { useState, useEffect } from 'react';
import './App.css';

function BoundaryLayerSimulation({ onBack }) {
  // State variables for dynamically loaded values
  const [nuValues, setNuValues] = useState([]);
  const [uInfValues, setUInfValues] = useState([]);

  const [nu, setNu] = useState(null);
  const [uInf, setUInf] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Starting data load...');
    fetch('/blasius_40000_boundary_layers.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        const rows = text.split('\n').slice(1); // Skip header
        const allPoints = [];
        const uniqueNu = new Set();
        const uniqueUInf = new Set();

        rows.forEach(row => {
          if (row.trim()) {
            const [nu_val, u_inf, x, re_x, delta99] = row.split(',').map(Number);
            allPoints.push({ nu_val, u_inf, x, re_x, delta99 });
            uniqueNu.add(nu_val);
            uniqueUInf.add(u_inf);
          }
        });

        const sortedNu = Array.from(uniqueNu).sort((a, b) => a - b);
        const sortedUInf = Array.from(uniqueUInf).sort((a, b) => a - b);

        console.log('Data loaded:', {
          totalPoints: allPoints.length,
          uniqueNuCount: sortedNu.length,
          uniqueUInfCount: sortedUInf.length,
          sampleNu: sortedNu.slice(0, 5),
          sampleUInf: sortedUInf.slice(0, 5),
        });

        setNuValues(sortedNu);
        setUInfValues(sortedUInf);
        setNu(sortedNu[0]); // Set initial nu to the first unique value
        setUInf(sortedUInf[0]); // Set initial uInf to the first unique value
        setData(allPoints);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const getCurrentPoints = () => {
    // Ensure data and initial values are loaded before filtering
    if (!data || nu === null || uInf === null) return [];

    const epsilon = 1e-9; // Tolerance for floating-point comparison

    const points = data.filter(point => {
      const nuMatch = Math.abs(point.nu_val - nu) < epsilon;
      const uMatch = Math.abs(point.u_inf - uInf) < epsilon;

      // Optional: Log matches for debugging if needed
      // if(nuMatch && uMatch) {
      //   console.log('Match found for:', { nu, uInf, pointNu: point.nu_val, pointUInf: point.u_inf });
      // }

      return nuMatch && uMatch;
    }).sort((a, b) => a.x - b.x);

    console.log('Filtering for:', { nu, uInf });
    console.log('Filtered points count:', points.length);

    if (points.length === 0) {
      console.log('No data found for:', { nu, uInf });
    }

    return points;
  };

  // Calculate Reynolds number, handling initial null state
  // Calculate Reynolds number using the x value of the last point
  const currentPoints = getCurrentPoints();
  const lastPoint = currentPoints.length > 0 ? currentPoints[currentPoints.length - 1] : null;
  const currentRe = (lastPoint && nu !== null && uInf !== null) ? (uInf * lastPoint.x) / nu : 'N/A';

  return (
    <div className="flex flex-col md:flex-row gap-4 p-2 w-full h-screen bg-[#282a36]"> {/* Corrected to flex-col by default, md:flex-row for larger screens */}
      {/* Plot section takes full width on small screens, 2/3 on medium+ */}
      <div className="w-full md:w-2/3 bg-[#21222c] p-6 rounded-xl shadow-md flex flex-col"> {/* Plot container, taking full width on small screens, 2/3 width on medium+, no mt-12, added flex flex-col */}
        <h3 className="text-lg font-semibold mb-4 text-[#f8f8f2]">Boundary Layer Profile</h3> {/* Title with light text */}
        {loading ? (
          <div className="flex items-center justify-center flex-grow"> {/* Used flex-grow to fill available space */}
            <div className="text-[#6272a4]">Loading data...</div> {/* Loading text with comment color */}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-grow">
            <div className="text-[#ff5555]">Error loading data: {error}</div> {/* Error text with red color */}
          </div>
        ) : (
          <div className="relative w-full flex-grow bg-[#21222c] rounded-lg overflow-hidden"> {/* Plot area background */}
            <svg className="w-full h-full" viewBox="0 0 800 600"> {/* Increased viewBox height to 600 for y-range 0-0.4 */}
              {/* Background representing the flow area */}
              <rect x="0" y="0" width="800" height="550" fill="#44475a" /> {/* Adjusted height for new viewBox */}

              {/* Plate */}
              {/* Removed plate line as requested */}
              {/* <line
                x1="0"
                y1="550" // Positioned at the bottom of the flow area (new scale)
                x2="800"
                y2="550"
                stroke="#ffb86c" // Plate with orange color
                strokeWidth="5"
              /> */}

              {/* X-axis grid lines and labels */}
              // Adjusted x-axis start from 0.5
              {[0.5, 1, 2, 3, 4, 5].map((x, i) => (
                <g key={`x-${i}`}>
                  <line
                    x1={50 + ((x - 0.5) / 4.5) * 700} // Scale x from 0.5-5 to 50-750
                    y1="50" // Start from top of plot area
                    x2={50 + ((x - 0.5) / 4.5) * 700}
                    y2="550" // End at the plate line (new scale)
                    stroke="#44475a" // Grid lines with selection background color
                    strokeWidth="1"
                  />
                  <text
                    x={50 + ((x - 0.5) / 4.5) * 700}
                    y="570" // Position below the plate/axis (new scale)
                    className="text-xs fill-[#f8f8f2]" // Axis labels with light text color
                    textAnchor="middle"
                  >
                    {x}
                  </text>
                </g>
              ))}

              {/* Y-axis grid lines and labels - adjusting for new scale and orientation */}
              {[0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40].map((y, i) => (
                <g key={`y-${i}`}>
                  <line
                    x1="50" // Start after y-axis label area
                    y1={550 - (y / 0.4) * 500} // Scale y from 0-0.4 to 550-50
                    x2="750" // End at the right edge
                    y2={550 - (y / 0.4) * 500}
                    stroke="#44475a" // Grid lines with selection background color
                    strokeWidth="1"
                  />
                  <text
                    x="45" // Position before the start of the graph lines - adjusted x position slightly
                    y={550 - (y / 0.4) * 500}
                    className="text-xs fill-[#f8f8f2]" // Axis labels with light text color
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {y.toFixed(2)}
                  </text>
                </g>
              ))}

              {/* Boundary layer profile */}
              {(() => {
                const points = getCurrentPoints();
                if (points.length === 0) {
                  return (
                    <text
                      x="400"
                      y="300" // Center vertically in new height (600/2) - adjusted
                      textAnchor="middle"
                      className="fill-red-600 text-lg"
                    >
                      No data found for selected parameters below x=0.5
                    </text>
                  );
                }

                const pathData = points.map((point, index) => {
                  // Scale x from 0.5-5 to 50-750 (leaving space for Y axis labels)
                  // Ensure point.x >= 0.5 before scaling
                  if (point.x < 0.5) return null; // Skip points before 0.5 for plotting
                  const x = 50 + ((point.x - 0.5) / 4.5) * 700;
                  // Scale y (delta99) from 0-0.4 to 550-50 (relative to plate and leaving space at top)
                  const y = 550 - (point.delta99 / 0.4) * 500; // Adjusted scaling
                  return `${index === 0 || points[index -1]?.x < 0.5 ? 'M' : 'L'} ${x} ${y}`;
                }).filter(d => d !== null).join(' '); // Filter out null entries and join

                // Handle case where all points are < 0.5
                if (!pathData) {
                   return (
                    <text
                      x="400"
                      y="300" // Center vertically in new height
                      textAnchor="middle"
                      className="fill-red-600 text-lg"
                    >
                      No data found for selected parameters below x=0.5
                    </text>
                  );
                }

                return (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ff79c6" // Boundary layer line with pink color
                    strokeWidth="2"
                  />
                );
              })()}              

              {/* Axis labels */}
              <text x="400" y="590" className="text-sm fill-[#f8f8f2]" textAnchor="middle">x (m)</text> {/* X-axis label below axis with light text color */}
              <text
                x="20" // Position further left for y-axis label - adjusted x position slightly
                y="300" // Center vertically
                className="text-sm fill-[#f8f8f2]" // Y-axis label with light text color
                textAnchor="middle"
                transform="rotate(-90, 20, 300)" // Adjusted rotation point
              >
                δ (m)
              </text>

            </svg>
          </div>
        )}
      </div> {/* End of plot section */}

      {/* Controls section takes full width on small screens, 1/3 on medium+ */}
      <div className="w-full md:w-1/3 bg-[#21222c] p-6 rounded-xl shadow-md"> {/* Controls container, taking full width on small screens, 1/3 width on medium+, no mt-12 */}
        <h3 className="text-lg font-semibold mb-4 text-[#f8f8f2]">Simulation Controls</h3> {/* Title with light text */}
        {/* Render controls only after data and initial values are loaded */}
        {!loading && nuValues.length > 0 && uInfValues.length > 0 && nu !== null && uInf !== null && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#f8f8f2] mb-2"> {/* Label with light text */}
                Dynamic Viscosity (ν)
              </label>
              <input
                type="range"
                min="0"
                max={nuValues.length - 1}
                step="1"
                value={nuValues.indexOf(nu)}
                onChange={(e) => setNu(nuValues[parseInt(e.target.value)])}
                className="w-full custom-dracula-slider" // Added custom class for slider styling
              />
              <div className="mt-2 text-sm text-[#bd93f9]"> {/* Current value with purple color */}
                Current ν: {nu.toExponential(4)} m²/s
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f8f8f2] mb-2"> {/* Label with light text */}
                Free Stream Velocity (U∞)
              </label>
              <input
                type="range"
                min="0"
                max={uInfValues.length - 1}
                step="1"
                value={uInfValues.indexOf(uInf)}
                onChange={(e) => setUInf(uInfValues[parseInt(e.target.value)])}
                className="w-full custom-dracula-slider" // Added custom class for slider styling
              />
              <div className="mt-2 text-sm text-[#bd93f9]"> {/* Current value with purple color */}
                Current U∞: {uInf.toFixed(4)} m/s
              </div>
            </div>

            <div className="pt-2 border-t border-[#44475a]"> {/* Border with selection background color */}
              <div className="text-sm text-[#50fa7b]"> {/* Reynolds number with green color */}
                Reynolds Number (Re): {currentRe !== 'N/A' ? currentRe.toExponential(2) : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div> {/* End of controls section */}
    </div>
  );
}

function HomePage({ onSelectSimulation }) {
  return (
    <div className="p-8 bg-[#282a36] min-h-screen text-[#f8f8f2]"> {/* Dracula background and light text for Home page */}
      <h1 className="text-4xl font-bold mb-8">Heat Transfer Simulations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          className="bg-[#21222c] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelectSimulation('boundary-layer')}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-[#50fa7b]">Boundary Layer Analysis</h2> {/* Title with green color */}
            <p className="text-[#f8f8f2] mb-4">Interactive visualization of boundary layer development with adjustable parameters.</p> {/* Text with light color */}
            <div className="flex items-center text-[#ff79c6]"> {/* Link with pink color */}
              <span className="font-medium">Click to View</span>
              <span className="ml-2 w-2 h-2 bg-[#ff79c6] rounded-full"></span> {/* Dot with pink color */}
            </div>
          </div>
        </div>
        
        <div className="bg-[#21222c] rounded-xl shadow-md overflow-hidden opacity-50"> {/* Disabled card with darker background */}
          <div className="p-6 text-[#f8f8f2]"> {/* Text with light color */}
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="mb-4">More heat transfer simulations will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeSimulation, setActiveSimulation] = useState(null);

  useEffect(() => {
    const handlePopstate = () => {
      setActiveSimulation(null); // Go back to home on browser back
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  const handleSelectSimulation = (simulation) => {
    setActiveSimulation(simulation);
    window.history.pushState({ simulation: simulation }, '', `/${simulation}`); // Push state for browser history
  };

  return (
    <div className="min-h-screen bg-[#282a36]"> {/* Main app container with Dracula background */}
      {activeSimulation === 'boundary-layer' ? (
        <BoundaryLayerSimulation onBack={() => window.history.back()} /> // Use history.back for going back
      ) : (
        <HomePage onSelectSimulation={handleSelectSimulation} />
      )}
    </div>
  );
}

export default App;
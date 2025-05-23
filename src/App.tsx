import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Papa from 'papaparse'

interface DataPoint {
  x: number
  y: number
  u: number
  Re: number
}

interface BoundaryLayerPoint {
  x: number
  delta: number
  Re: number
}

function App() {
  const [data, setData] = useState<DataPoint[]>([])
  const [boundaryLayerData, setBoundaryLayerData] = useState<BoundaryLayerPoint[]>([])
  const [selectedX, setSelectedX] = useState(0)
  const U_inf = 1.0

  useEffect(() => {
    // Load and parse CSV data
    fetch('/data.csv')
      .then(response => response.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            const parsedData = results.data as DataPoint[]
            setData(parsedData)

            // Calculate boundary layer thickness
            const blData: BoundaryLayerPoint[] = []
            const uniqueX = [...new Set(parsedData.map(d => d.x))]
            
            uniqueX.forEach(x => {
              const subset = parsedData.filter(d => d.x === x)
              const yAt99 = subset.find(d => d.u >= 0.99 * U_inf)?.y
              const Re = subset[0]?.Re
              if (yAt99 && Re) {
                blData.push({ 
                  x: Number(x), 
                  delta: Number(yAt99),
                  Re: Number(Re)
                })
              }
            })
            
            setBoundaryLayerData(blData)
          }
        })
      })
  }, [])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedX(parseFloat(e.target.value))
  }

  const currentPoint = boundaryLayerData.find(d => Math.abs(d.x - selectedX) < 0.01)
  const filteredData = boundaryLayerData.filter(d => d.x <= selectedX)

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Boundary Layer Visualization
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Interactive visualization of boundary layer thickness
          </p>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg shadow-xl p-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="x" 
                  label={{ value: 'x-position', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} 
                  stroke="#9CA3AF"
                />
                <YAxis 
                  label={{ value: 'Boundary Layer Thickness (δ)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} 
                  stroke="#9CA3AF"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.375rem' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: number, name: string) => [value.toFixed(4), name]}
                  labelFormatter={(label) => `x = ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="delta" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select x-position: {selectedX.toFixed(2)}
            </label>
            <input
              type="range"
              value={selectedX}
              onChange={handleSliderChange}
              min={boundaryLayerData[0]?.x || 0}
              max={boundaryLayerData[boundaryLayerData.length - 1]?.x || 1}
              step={0.01}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="mt-4 bg-gray-700 rounded-lg p-3">
            <h3 className="text-base font-medium text-white">Information</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-300">
              <li>• Blue line shows the boundary layer thickness up to current x-position</li>
              <li>• Free stream velocity (U∞) = {U_inf}</li>
              <li>• Selected x-position: {selectedX.toFixed(2)}</li>
              <li>• Current Reynolds number: {currentPoint?.Re.toFixed(2) || 'N/A'}</li>
              <li>• Current boundary layer thickness: {currentPoint?.delta.toFixed(4) || 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

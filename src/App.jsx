import { useState } from 'react'
import './App.css'
import EarthquakeMap from './EarthquakeMap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <EarthquakeMap /> 
    </>
  )
}

export default App

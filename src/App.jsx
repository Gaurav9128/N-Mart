import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivacyPolicy from './components/PrivacyPolicy';
import Footer from './components/FooterComponent';


function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
    <div className="App">
      {/* Your header and other components */}
      
      <Routes>
        {/* Other routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>

      <Footer />
    </div>
  </Router>
  );
}

export default App

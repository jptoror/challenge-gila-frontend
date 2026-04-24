import { getBackend, setBackend } from '../../services/api.js'
import { useState } from 'react'
import './BackendSelector.css'

export default function BackendSelector({ onChange }) {
  const [active, setActive] = useState(getBackend())

  function handleChange(backend) {
    setBackend(backend)
    setActive(backend)
    onChange?.(backend)
  }

  return (
    <div className="backend-selector">
      <span className="backend-label">Backend</span>
      <div className="backend-options">
        <button
          className={`backend-btn ${active === 'clojure' ? 'active' : ''}`}
          onClick={() => handleChange('clojure')}
        >
          Clojure
        </button>
        <button
          className={`backend-btn ${active === 'springboot' ? 'active' : ''}`}
          onClick={() => handleChange('springboot')}
        >
          Spring Boot
        </button>
      </div>
    </div>
  )
}

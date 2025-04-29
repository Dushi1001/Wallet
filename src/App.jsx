import React from 'react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header>
        <h1>AUTTOBI</h1>
        <nav>
          <button>Home</button>
          <button>Features</button>
          <button>About</button>
          <button>Contact</button>
        </nav>
      </header>
      
      <main>
        <section className="hero">
          <h2>Your Crypto, Your Way</h2>
          <p>A comprehensive cryptocurrency investment platform designed to simplify crypto portfolio management.</p>
        </section>
      </main>
    </div>
  )
}

export default App

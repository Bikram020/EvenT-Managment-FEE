import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ name: '', date: '' })

  // Fetch events from backend
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:5000/events')
      setEvents(response.data)
      setError('')
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    if (!newEvent.name || !newEvent.date) {
      setError('Please fill in both name and date')
      return
    }

    try {
      const eventToAdd = {
        id: Date.now(),
        name: newEvent.name,
        date: newEvent.date
      }

      await axios.post('http://localhost:5000/events', eventToAdd)
      setEvents([...events, eventToAdd])
      setNewEvent({ name: '', date: '' })
      setShowAddForm(false)
      setError('')
    } catch (err) {
      setError('Failed to add event')
    }
  }

  return (
    <div className="app">
      <h1>College Events</h1>
      
      {error && <div className="error">{error}</div>}
      
      <button onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'Cancel' : 'Add Event'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddEvent} className="add-form">
          <input
            type="text"
            placeholder="Event name"
            value={newEvent.name}
            onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
          />
          <button type="submit">Add</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="events">
          {events.length === 0 ? (
            <p>No events found</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="event">
                <h3>{event.name}</h3>
                <p>{event.date}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App

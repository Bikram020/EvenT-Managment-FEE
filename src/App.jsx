import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({ name: '', date: '' })
  const [searchName, setSearchName] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applyingEventId, setApplyingEventId] = useState(null)
  const [applicationData, setApplicationData] = useState({ 
    studentName: '', 
    email: '', 
    phone: '' 
  })

  // Fetch events from backend
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async (nameQuery = '', dateQuery = '') => {
    try {
      setLoading(true)
      let url = `${API_URL}/events`
      const params = []
      
      if (nameQuery) params.push(`name=${encodeURIComponent(nameQuery)}`)
      if (dateQuery) params.push(`date=${encodeURIComponent(dateQuery)}`)
      
      if (params.length > 0) {
        url += '?' + params.join('&')
      }
      
      console.log('Fetching events from:', url)
      const response = await axios.get(url)
      console.log('Response received:', response.data)
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        setEvents(response.data)
      } else if (response.data.data && Array.isArray(response.data.data.events)) {
        setEvents(response.data.data.events)
      } else {
        setEvents([])
      }
      setError('')
    } catch (err) {
      console.error('Error fetching events:', err)
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

      await axios.post(`${API_URL}/events`, eventToAdd)
      setEvents([...events, eventToAdd])
      setNewEvent({ name: '', date: '' })
      setShowAddForm(false)
      setError('')
    } catch (err) {
      setError('Failed to add event')
    }
  }

  const handleEditEvent = async (e) => {
    e.preventDefault()
    if (!editingEvent.name || !editingEvent.date) {
      setError('Please fill in both name and date')
      return
    }

    try {
      await axios.put(`${API_URL}/events/${editingEvent.id}`, {
        name: editingEvent.name,
        date: editingEvent.date
      })
      
      setEvents(events.map(event => 
        event.id === editingEvent.id ? editingEvent : event
      ))
      setEditingEvent(null)
      setError('')
    } catch (err) {
      if (err.response) {
        setError(`Failed to update event: ${err.response.data.error || err.response.statusText}`)
      } else {
        setError('Failed to update event')
      }
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      console.log('Deleting event with ID:', eventId, 'Type:', typeof eventId)
      await axios.delete(`${API_URL}/events/${eventId}`)
      setEvents(events.filter(event => event.id !== eventId))
      setError('')
    } catch (err) {
      console.error('Delete error:', err)
      if (err.response) {
        setError(`Failed to delete event: ${err.response.data.error || err.response.statusText}`)
      } else {
        setError('Failed to delete event')
      }
    }
  }

  const startEditing = (event) => {
    setEditingEvent({ ...event })
    setShowAddForm(false)
  }

  const cancelEditing = () => {
    setEditingEvent(null)
  }

  const handleSearch = () => {
    console.log('Search clicked - Name:', searchName, 'Date:', searchDate)
    // Search if either name or date has a value
    if (searchName || searchDate) {
      console.log('Searching with filters...')
      fetchEvents(searchName, searchDate)
    } else {
      console.log('No filters, showing all events...')
      // If both are empty, show all events
      fetchEvents()
    }
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setSearchName(value) 
    fetchEvents(value, searchDate)
  }

  const handleDateChange = (e) => {
    const value = e.target.value
    setSearchDate(value)
    fetchEvents(searchName, value)
  }

  const clearSearch = () => {
    setSearchName('')
    setSearchDate('')
    fetchEvents()
  }

  const startApplying = (eventId) => {
    setApplyingEventId(eventId)
    setShowApplyForm(true)
    setShowAddForm(false)
    setEditingEvent(null)
  }

  const cancelApplying = () => {
    setShowApplyForm(false)
    setApplyingEventId(null)
    setApplicationData({ studentName: '', email: '', phone: '' })
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!applicationData.studentName || !applicationData.email || !applicationData.phone) {
      setError('Please fill in all application fields')
      return
    }

    try {
      await axios.post(`${API_URL}/applications`, {
        eventId: applyingEventId,
        studentName: applicationData.studentName,
        email: applicationData.email,
        phone: applicationData.phone
      })
      
      cancelApplying()
      setError('')
      alert('Application submitted successfully!')
    } catch (err) {
      setError('Failed to submit application')
    }
  }

  return (
    <div className="app">
      <h1>College Events</h1>
      
      {error && <div className="error">{error}</div>}
      
      {/* Search Section */}
      <div className="search-section">
        <h3>Search Events</h3>
        <div className="search-inputs">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={handleNameChange}
          />
          <input
            type="date"
            value={searchDate}
            onChange={handleDateChange}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={clearSearch}>Clear</button>
        </div>
      </div>
      
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

      {editingEvent && (
        <form onSubmit={handleEditEvent} className="edit-form">
          <h3>Edit Event</h3>
          <input
            type="text"
            placeholder="Event name"
            value={editingEvent.name}
            onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
          />
          <input
            type="date"
            value={editingEvent.date}
            onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
          />
          <button type="submit">Update</button>
          <button type="button" onClick={cancelEditing}>Cancel</button>
        </form>
      )}

      {showApplyForm && (
        <form onSubmit={handleApply} className="apply-form">
          <h3>Apply for Event</h3>
          <input
            type="text"
            placeholder="Your full name"
            value={applicationData.studentName}
            onChange={(e) => setApplicationData({...applicationData, studentName: e.target.value})}
          />
          <input
            type="email"
            placeholder="Your email"
            value={applicationData.email}
            onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
          />
          <input
            type="tel"
            placeholder="Your phone number"
            value={applicationData.phone}
            onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
          />
          <button type="submit">Submit Application</button>
          <button type="button" onClick={cancelApplying}>Cancel</button>
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
                <div className="event-buttons">
                  <button onClick={() => startApplying(event.id)} className="apply-btn">
                    Apply
                  </button>
                  <button onClick={() => startEditing(event)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App

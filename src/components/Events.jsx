import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch events');
        }
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
          localStorage.removeItem('token');
          setToken(null);
          navigate('/login');
        }
      }
    };

    if (token) {
      fetchEvents();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  // Handle event registration
  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register for event');
      }
      alert(data.message);
      // Refresh events to reflect registration status if needed
      const updatedEvents = events.map((event) =>
        event._id === eventId
          ? { ...event, registeredUsers: [...event.registeredUsers, { _id: data.registration.userId }] }
          : event
      );
      setEvents(updatedEvents);
    } catch (err) {
      alert(`Error: ${err.message}`);
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">All Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <p className="text-center col-span-full">No events available.</p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {event.banner && (
                <img
                  src={event.banner}
                  alt={`${event.title} banner`}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Club:</span> {event.club?.name}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Date:</span> {event.date}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Time:</span> {event.time}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium">Location:</span> {event.location}
                </p>
                <button
                  onClick={() => handleRegister(event._id)}
                  disabled={event.registeredUsers.some(
                    (user) => user._id.toString() === localStorage.getItem('userId')
                  )}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
                    event.registeredUsers.some(
                      (user) => user._id.toString() === localStorage.getItem('userId')
                    )
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {event.registeredUsers.some(
                    (user) => user._id.toString() === localStorage.getItem('userId')
                  )
                    ? 'Already Registered'
                    : 'Register'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;

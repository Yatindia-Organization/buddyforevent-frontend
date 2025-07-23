import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalInfo } from "../../../contexts/globalContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { API_ROUTE } from "../../../lib/config";


export default function CreateEvent() {
  const navigate = useNavigate();
  const context = useGlobalInfo();
  const { theme } = useTheme();
  
  // Get plan and credit info from context
  const { 
    hasActivePlan, 
    hasEnoughCredits, 
    ticketCredits,
    deductCredits,
    fetchUserData 
  } = context;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    venue: "",
    maxParticipants: "",
    registrationFee: "",
    eventType: "conference",
    status: "active"
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCreditWarning, setShowCreditWarning] = useState(false);

  useEffect(() => {
    // Check if user has plan and credits when component loads
    if (!hasActivePlan()) {
      alert("You need an active plan to create events. Redirecting to plan selection...");
      navigate('/plans/selection');
      return;
    }

    if (!hasEnoughCredits(1)) {
      setShowCreditWarning(true);
    }

    // Refresh user data to get latest credit info
    fetchUserData();
  }, [hasActivePlan, hasEnoughCredits, navigate, fetchUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Event name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.venue.trim()) newErrors.venue = "Venue is required";
    if (!formData.maxParticipants || formData.maxParticipants <= 0) {
      newErrors.maxParticipants = "Max participants must be greater than 0";
    }

    // Check if start date is before end date
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    // Check if start date is in the future
    if (formData.startDate) {
      if (new Date(formData.startDate) <= new Date()) {
        newErrors.startDate = "Start date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final credit check before submission
    if (!hasEnoughCredits(1)) {
      alert("You don't have enough ticket credits to create a new event. Please purchase more credits.");
      navigate('/plans/selection');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const eventData = {
        ...formData,
        userId: context.userId,
        maxParticipants: parseInt(formData.maxParticipants),
        registrationFee: parseFloat(formData.registrationFee) || 0
      };

      const response = await fetch(`${API_ROUTE}/api/v1/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (data.success) {
        // Deduct 1 credit for creating the event
        deductCredits(1);
        
        alert("Event created successfully!");
        navigate("/dashboard");
      } else {
        alert(data.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("An error occurred while creating the event");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = () => {
    navigate('/plans/selection');
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-4 px-4 py-2 text-sm border border-border rounded hover:bg-card-hover transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-heading font-bold mb-2">Create New Event</h1>
          <p className="text-text-secondary">
            Fill in the details below to create your event
          </p>
        </div>

        {/* Credit Status Warning */}
        {showCreditWarning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-red-800 font-semibold mb-1">
                  ⚠️ Insufficient Credits
                </h3>
                <p className="text-red-700 text-sm mb-3">
                  You have {ticketCredits} ticket credits remaining. You need at least 1 credit to create an event.
                </p>
                <button
                  onClick={handleBuyCredits}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Buy More Credits
                </button>
              </div>
              <button
                onClick={() => setShowCreditWarning(false)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Credit Status Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-800 font-semibold mb-1">Ticket Credits</h3>
              <p className="text-blue-700 text-sm">
                You have <strong>{ticketCredits}</strong> credits remaining. Creating this event will use 1 credit.
              </p>
            </div>
            <button
              onClick={handleBuyCredits}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Buy More
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Enter event name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Type
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="meetup">Meetup</option>
                  <option value="concert">Concert</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.description ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Describe your event"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Dates and Venue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.startDate ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.endDate ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.venue ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Event venue"
                />
                {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
              </div>
            </div>

            {/* Capacity and Fee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.maxParticipants ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Maximum number of participants"
                />
                {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Registration Fee (₹)
                </label>
                <input
                  type="number"
                  name="registrationFee"
                  value={formData.registrationFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0 for free events"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 border border-border rounded-md hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !hasEnoughCredits(1)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  loading || !hasEnoughCredits(1)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
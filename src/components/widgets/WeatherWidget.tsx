import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, MapPin, Loader2, Sun, CloudRain, Wind } from 'lucide-react';

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    condition: string;
    description: string;
    icon: string;
    city: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (city: string) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'Weather unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get user's location via browser Geolocation API
    // If not, fallback to default (let backend handle default or pass 'New York')
    fetchWeather('New York'); // Simple default
    
    // Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            // Optional: reverse geocode or let OpenWeather handle lat/lon directly if we updated backend
            // To keep frontend simple without modifying backend: we just use 'New York' as fallback or continue.
          } catch (e) {}
        },
        () => {
          // Denied/Failed, keep default
        }
      );
    }
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return <Sun className="w-8 h-8 text-amber-500" />;
      case 'clouds': return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'rain': 
      case 'drizzle': return <CloudRain className="w-8 h-8 text-blue-400" />;
      default: return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-center">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60px] w-full">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[60px] text-red-500">
          <Droplets className="w-6 h-6 mb-2 opacity-50" />
          <p className="text-xs">{error}</p>
        </div>
      ) : weatherData ? (
        <div className="flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weatherData.condition)}
            <div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <MapPin className="w-3 h-3" />
                {weatherData.city}
              </div>
              <p className="text-sm font-medium text-gray-700 capitalize">{weatherData.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-light text-slate-800">
              {Math.round(weatherData.temp)}°<span className="text-lg text-slate-400">C</span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

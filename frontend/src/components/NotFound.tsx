import React from 'react';

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600">Sorry, the page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default NotFound;
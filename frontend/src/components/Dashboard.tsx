import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Rinexor Dashboard
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to Rinexor</h2>
        <p className="text-gray-600">
          Your debt recovery platform is ready to use.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
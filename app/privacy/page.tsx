import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600">
          Loophole is a nationwide marketplace for off-market and creative-finance deals. We collect the account
          information you provide (email, profile, listings, messages) to operate the board, review listings, and
          keep the community usable.
        </p>
        <p className="text-gray-600">
          Your email is not shown publicly on listings. Profile details you choose to add (display name, bio, photo)
          may appear to other users. Messages stay between you and the other party. We do not sell your personal
          information.
        </p>
        <p className="text-gray-600">
          Review or update your profile and notification preferences in Settings. Questions: use the Contact page.
        </p>
      </div>
    </div>
  )
}

export default page

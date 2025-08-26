import React from 'react'

const HomeHeader = ({name, email=null, createdAt}: {name:string, email?:string | null, createdAt:Date}) => {
  return (
    <div className="mb-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
      {email && <h5 className="text-sm text-gray-600 mb-2">{email}</h5>}
      <p className="text-xs text-gray-500">Member since: {createdAt.toLocaleDateString()}</p>
    </div>
  )
}

export default HomeHeader
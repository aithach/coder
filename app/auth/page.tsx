'use client'

import { createAuthClient } from 'better-auth/client'
export default function LoginCard() {
  const handleGitHubLogin = async () => {
    const authClient = createAuthClient()

    const data = await authClient.signIn.social({
      provider: 'github',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Welcome</h2>
        <p className="text-gray-600 mb-6 text-center">Sign in with GitHub to continue</p>
        <button onClick={handleGitHubLogin} className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
          Login with GitHub
        </button>
      </div>
    </div>
  )
}

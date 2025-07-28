import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Out</h1>
          <p className="text-gray-600">Are you sure you want to sign out?</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing Out...
              </div>
            ) : (
              "Sign Out"
            )}
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import { CreateJoinModal } from "./CreateJoinModal";

export function ChatApp() {
  const [currentHostId, setCurrentHostId] = useState<string | null>(null);
  const [showCreateJoin, setShowCreateJoin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentHost = useQuery(
    api.hosts.getHost,
    currentHostId ? { hostId: currentHostId } : "skip"
  );

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          currentHostId={currentHostId}
          onHostSelect={setCurrentHostId}
          onCreateJoin={() => setShowCreateJoin(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentHost ? (
          <ChatWindow
            host={currentHost}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to ChatConnect
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a new chat room or join an existing one to get started
              </p>
              <button
                onClick={() => setShowCreateJoin(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-30 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Join Modal */}
      {showCreateJoin && (
        <CreateJoinModal
          onClose={() => setShowCreateJoin(false)}
          onHostCreated={(hostId) => {
            setCurrentHostId(hostId);
            setShowCreateJoin(false);
          }}
          onHostJoined={(hostId) => {
            setCurrentHostId(hostId);
            setShowCreateJoin(false);
          }}
        />
      )}
    </div>
  );
}

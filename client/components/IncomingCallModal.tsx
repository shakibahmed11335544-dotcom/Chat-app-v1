import React from "react";

interface IncomingCallProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({ onAccept, onReject }: IncomingCallProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
        <h2 className="text-xl font-bold mb-4">Incoming Call</h2>
        <div className="flex gap-4 justify-center">
          <button onClick={onAccept} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Accept</button>
          <button onClick={onReject} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Reject</button>
        </div>
      </div>
    </div>
  );
}

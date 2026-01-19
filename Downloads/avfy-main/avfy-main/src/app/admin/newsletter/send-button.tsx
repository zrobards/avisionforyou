"use client"

import { Send } from "lucide-react"

export function SendButton({ sending, onSend, id }: { sending: string | null; onSend: (id: string) => void; id: string }) {
  return (
    <button
      onClick={() => onSend(id)}
      disabled={sending === id}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
    >
      <Send className="w-4 h-4" />
      {sending === id ? 'Sending...' : 'Send'}
    </button>
  )
}

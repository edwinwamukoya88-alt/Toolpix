"use client"

import { useState } from "react"
import { Plus, Edit3, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function NotesApp() {
  const [notes, setNotes] = useLocalStorage<Note[]>("toolpix_notes", [])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editing, setEditing] = useState<string | null>(null)

  function save() {
    if (!title.trim() && !content.trim()) return
    if (editing) {
      setNotes((prev) => prev.map((n) => n.id === editing ? { ...n, title, content } : n))
      setEditing(null)
    } else {
      setNotes((prev) => [...prev, { id: crypto.randomUUID(), title, content, createdAt: new Date().toLocaleDateString() }])
    }
    setTitle("")
    setContent("")
  }

  function edit(note: Note) {
    setEditing(note.id)
    setTitle(note.title)
    setContent(note.content)
  }

  function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (editing === id) { setEditing(null); setTitle(""); setContent("") }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">{editing ? "Edit Note" : "New Note"}</h3>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={6}
            className="w-full rounded-md border bg-background p-3 text-sm resize-y min-h-[120px]"
          />
          <Button onClick={save}>{editing ? "Update" : "Save"}</Button>
        </CardContent>
      </Card>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {notes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No notes yet</p>
          </div>
        )}
        {[...notes].reverse().map((note) => (
          <Card key={note.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{note.title || "Untitled"}</h4>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => edit(note)}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(note.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{note.createdAt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

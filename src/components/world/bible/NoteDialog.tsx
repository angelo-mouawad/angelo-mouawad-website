"use client";

import { type RefObject, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fieldClass } from "./ui";

export type NoteDraft = { reference: string; verseText: string; initialText: string };

const same = (a: NoteDraft | null, b: NoteDraft) => a !== null && a.reference === b.reference && a.verseText === b.verseText && a.initialText === b.initialText;

/** Write, edit or delete the note on one verse. Pass null to close it. */
export function NoteDialog({ note, onSave, onDelete, onClose }: { note: NoteDraft | null; onSave: (text: string) => void; onDelete: () => void; onClose: () => void }) {
  const field = useRef<HTMLTextAreaElement>(null);
  // Keeps the last note on screen while the dialog fades out.
  const [shown, setShown] = useState(note);
  if (note && !same(shown, note)) setShown(note);

  return (
    <Dialog open={note !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" initialFocus={field}>
        {shown && <NoteForm key={shown.reference} note={shown} field={field} onSave={onSave} onDelete={onDelete} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function NoteForm({ note, field, onSave, onDelete, onClose }: { note: NoteDraft; field: RefObject<HTMLTextAreaElement | null>; onSave: (text: string) => void; onDelete: () => void; onClose: () => void }) {
  const [text, setText] = useState(note.initialText);
  const [confirming, setConfirming] = useState(false);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (text.trim()) onSave(text);
      }}
    >
      <DialogHeader>
        <DialogTitle>{note.initialText ? `Edit note on ${note.reference}` : `Note on ${note.reference}`}</DialogTitle>
        <DialogDescription className="sr-only">Write what stands out to you in this verse. Notes are saved in this browser.</DialogDescription>
      </DialogHeader>
      {note.verseText && <blockquote className="border-l-2 border-sky-bright pl-4 text-[0.9375rem] leading-relaxed text-ink-soft">{note.verseText}</blockquote>}
      <div className="flex flex-col gap-2">
        <label htmlFor="note-text" className="type-label text-muted-foreground">
          Your note
        </label>
        <textarea
          id="note-text"
          ref={field}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          placeholder="What stands out to you in this verse?"
          className={cn(fieldClass, "h-auto resize-y py-3 text-base leading-relaxed")}
        />
      </div>
      {confirming ? (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">Delete this note? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {note.initialText ? (
            <Button type="button" variant="destructive" size="sm" onClick={() => setConfirming(true)}>
              Delete note
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!text.trim()}>
              Save note
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

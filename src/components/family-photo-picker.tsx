import { useRef, useState } from "react";
import { Camera, ImagePlus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFamilyPhoto, removeFamilyPhoto } from "@/lib/firebase";

export type PhotoPerson = { id: string; name: string; image?: string | undefined };

export function FamilyPhotoPicker({ people, photos, onPhoto }: {
  people: PhotoPerson[];
  photos: Record<string, string>;
  onPhoto: (id: string, photo?: string) => void;
}) {
  const [selected, setSelected] = useState(people[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const person = people.find(item => item.id === selected);
  const image = photos[selected] ?? person?.image;

  async function selectPhoto(file?: File) {
    if (!file) return;
    setError("");
    setLoading(true);
    const id = selected;
    const url = URL.createObjectURL(file);
    try {
      const picture = new Image();
      picture.src = url;
      await picture.decode();

      // Optimize image for avatar display (max 400x400)
      const maxDim = 400;
      const scale = Math.min(1, maxDim / Math.max(picture.width, picture.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(picture.width * scale));
      canvas.height = Math.max(1, Math.round(picture.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas context unavailable");
      context.drawImage(picture, 0, 0, canvas.width, canvas.height);

      const base64Photo = canvas.toDataURL("image/jpeg", 0.75);

      // Save directly to Firestore (Free Spark Plan, no Blaze needed)
      await uploadFamilyPhoto(id, base64Photo);
      onPhoto(id, base64Photo);
    } catch (err: any) {
      console.error("Photo upload error:", err);
      const msg = err?.message || String(err);
      if (msg.includes("permission-denied") || msg.includes("missing or insufficient permissions")) {
        setError("Firestore Rules me Test Mode enable karein: Firestore Database > Rules > allow read, write: if true;");
      } else {
        setError("Photo save nahi ho saki. Kripya Firestore ka status check karein.");
      }
    } finally {
      URL.revokeObjectURL(url);
      setLoading(false);
      if (input.current) input.current.value = "";
    }
  }

  async function handleResetPhoto() {
    setLoading(true);
    setError("");
    try {
      await removeFamilyPhoto(selected);
      onPhoto(selected, undefined);
    } catch (err: any) {
      console.error("Remove photo error:", err);
      onPhoto(selected, undefined);
    } finally {
      setLoading(false);
    }
  }

  return <div className="photo-editor">
    <label className="flex flex-col gap-2 text-sm">Family member
      <select aria-label="Photo for family member" value={selected} disabled={loading} onChange={event => { setSelected(event.target.value); setError(""); }} className="rounded-lg border bg-card p-3">
        {people.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <div className="photo-preview">{image ? <img src={image} alt={person?.name ?? "Family photo"} /> : <Camera size={48} className="text-muted-foreground" />}</div>
    <p className="text-center font-display">{person?.name}</p>
    <input ref={input} type="file" accept="image/*" aria-label="Choose family photo" className="sr-only" onChange={event => void selectPhoto(event.target.files?.[0])} />
    <Button disabled={loading} onClick={() => input.current?.click()}><ImagePlus size={18} />{loading ? "Cloud par save ho rahi hai…" : photos[selected] ? "Change Photo" : "Add Photo"}</Button>
    {photos[selected] && <Button variant="ghost" disabled={loading} onClick={handleResetPhoto}><RotateCcw size={16} />Original Picture</Button>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}

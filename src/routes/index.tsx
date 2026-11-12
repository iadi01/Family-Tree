import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Search, Plus, Minus, Home, UserPlus, X, Images, Users, Bell, Camera } from "lucide-react";
import { familyRoot, firstName, type Member } from "@/lib/family";
import { nanaImg, naniImg } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { Branches, HeartFrame, WoodenSign } from "@/components/family-scenery";
import gardenImg from "@/assets/family-garden.jpg";
import { FamilyPhotoPicker } from "@/components/family-photo-picker";
import { subscribeToPhotos, subscribeToChildren, saveCustomChild, type CustomChild } from "@/lib/firebase";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Sharma Family Tree — Rooted in Love" },
    { name: "description", content: "Explore the Sharma family, from Nana and Nani to every little branch, in our illustrated family tree." },
    { property: "og:title", content: "Sharma Family Tree — Rooted in Love" },
    { property: "og:description", content: "Our roots, our strength, our forever — the Sharma family tree." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function CoupleCard({ member, expanded, highlight, onToggle }: {
  member: Member; expanded: boolean; highlight: boolean; onToggle: () => void;
}) {
  return <div className="family-couple">
    <Button variant="plain" size="natural" onClick={onToggle} aria-expanded={expanded} aria-label={`${expanded ? "Collapse" : "Expand"} ${firstName(member.name)} family`} className={`couple-button ${expanded ? "is-expanded" : ""} ${highlight ? "is-match" : ""}`}>
      <div className="couple-portrait"><img src={member.img} alt={`${member.name} and ${member.spouse ?? ""}`} width={992} height={672} /><Heart className="couple-heart fill-primary text-primary" size={18} /></div>
      <span className="couple-name">{firstName(member.name)} & {firstName(member.spouse ?? "")}</span>
    </Button>
    <Button variant="plain" size="natural" className="branch-toggle" onClick={onToggle} aria-label={`${expanded ? "Hide" : "Show"} children of ${firstName(member.name)}`}>{expanded ? <Minus size={18} /> : <Plus size={18} />}</Button>
  </div>;
}

function ChildrenPanel({ member, term, onAdd }: { member: Member; term: string; onAdd: (name: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  return <div className="children-panel">
      <span className="panel-flowers left">🌿🌸</span><span className="panel-flowers right">🌸🌿</span>
      <h2><span className="text-primary">♥</span> Our Little Stars <span className="text-primary">♥</span></h2>
       <p className="branch-parent-name">{firstName(member.name)} & {firstName(member.spouse ?? "")}</p>
      <div className="children-list">{member.children.length === 0 ? <p className="py-4 text-xs text-muted-foreground">Abhi koi bachcha add nahi hua</p> : member.children.map(child => <div id={child.id} key={child.id} className={`child-person ${term && child.name.toLowerCase().includes(term) ? "child-match" : ""}`}>
        <div className="child-portrait">{child.img ? <img src={child.img} alt={child.name} width={816} height={816} /> : <span className="font-display text-2xl">{firstName(child.name)[0]}</span>}</div>
        <span className="child-name">{firstName(child.name)}</span>
      </div>)}</div>
      {adding ? <form className="mt-3 flex gap-1" onSubmit={event => { event.preventDefault(); if (name.trim()) { onAdd(name.trim()); setName(""); setAdding(false); } }}>
        <input aria-label="Child name" autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="Naam" className="min-w-0 flex-1 rounded-full border border-input bg-card px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-ring" />
        <Button type="submit" size="sm" className="h-7 rounded-full px-2 text-xs">Add</Button>
        <Button variant="ghost" size="natural" aria-label="Cancel adding child" onClick={() => setAdding(false)}><X size={14} /></Button>
      </form> : <Button variant="secondary" size="natural" className="add-child" onClick={() => setAdding(true)}><Plus size={16} /> Add Child</Button>}
    </div>;
}

function Index() {
  const [root, setRoot] = useState(familyRoot);
  const [open, setOpen] = useState(new Set(["g2-5"]));
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"story" | "gallery" | "add" | "photos" | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [customChildren, setCustomChildren] = useState<Record<string, CustomChild[]>>({});
  const [parent, setParent] = useState("g2-5");
  const [newName, setNewName] = useState("");
  const tree = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Realtime sync from Firebase Firestore
    const unsubPhotos = subscribeToPhotos((livePhotos) => {
      setPhotos(livePhotos);
    });
    const unsubChildren = subscribeToChildren((liveChildren) => {
      setCustomChildren(liveChildren);
    });
    return () => {
      unsubPhotos();
      unsubChildren();
    };
  }, []);

  const centerTree = (behavior: ScrollBehavior = "smooth") => {
    const element = tree.current;
    if (element) element.scrollTo({ left: (element.scrollWidth - element.clientWidth) / 2, behavior });
  };
  useEffect(() => { centerTree("instant"); }, []);
  const term = query.trim().toLowerCase();

  // Merge base tree with custom added children from Firebase
  const mergedRoot = {
    ...root,
    children: root.children.map((member) => {
      const extra = customChildren[member.id] || [];
      const existingIds = new Set(member.children.map((c) => c.id));
      const filteredExtra = extra.filter((c) => !existingIds.has(c.id));
      return {
        ...member,
        children: [...member.children, ...filteredExtra],
      };
    }),
  };

  const displayRoot = {
    ...mergedRoot,
    children: mergedRoot.children.map((member) => ({
      ...member,
      img: photos[member.id] ?? member.img,
      children: member.children.map((child) => ({
        ...child,
        img: photos[child.id] ?? child.img,
      })),
    })),
  };

  const photoPeople = [
    { id: "nana", name: mergedRoot.name, image: nanaImg },
    { id: "nani", name: mergedRoot.spouse ?? "Nani", image: naniImg },
    ...mergedRoot.children.flatMap((member) => [
      { id: member.id, name: `${member.name} & ${member.spouse ?? ""}`, image: member.img },
      ...member.children.map((child) => ({ id: child.id, name: child.name, image: child.img })),
    ]),
  ];

  const changePhoto = (id: string, photo?: string) =>
    setPhotos((previous) => {
      const next = { ...previous };
      if (photo) next[id] = photo;
      else delete next[id];
      return next;
    });

  useEffect(() => {
    if (!term) return;
    const found = mergedRoot.children.find((member) =>
      [member.name, member.spouse ?? "", ...member.children.map((child) => child.name)].some((name) =>
        name.toLowerCase().includes(term),
      ),
    );
    const child = found?.children.find((member) => member.name.toLowerCase().includes(term));
    const target = child?.id ?? found?.id ?? "family-root";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [term, open, mergedRoot]);

  const matches = (member: Member) =>
    Boolean(term) &&
    [member.name, member.spouse ?? "", ...member.children.map((child) => child.name)].some((name) =>
      name.toLowerCase().includes(term),
    );

  const toggle = (id: string) =>
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addChild = async (parentId: string, name: string) => {
    const newChild: CustomChild = {
      id: `${parentId}-${Date.now()}`,
      name,
      relation: "Child",
    };
    setRoot((previous) => ({
      ...previous,
      children: previous.children.map((member) =>
        member.id === parentId ? { ...member, children: [...member.children, newChild] } : member,
      ),
    }));
    try {
      await saveCustomChild(parentId, newChild);
    } catch (err) {
      console.error("Save custom child failed:", err);
    }
  };
  const reset = () => { setZoom(1); requestAnimationFrame(() => centerTree()); };
  const search = (value: string) => {
    setQuery(value);
    const found = root.children.find(member => [member.name, member.spouse ?? "", ...member.children.map(child => child.name)].some(name => value.trim() && name.toLowerCase().includes(value.trim().toLowerCase())));
    if (found) setOpen(previous => new Set([...previous, found.id]));
  };
  return <div className="family-page">
    <img className="garden-background" src={gardenImg} alt="" width={1920} height={1088} />
    <header className="family-header">
      <div className="family-brand"><span aria-hidden="true">🌳</span><h1>Sharma<br />Family Tree</h1></div>
      <nav className="family-nav" aria-label="Main navigation">
       <Button variant="plain" size="natural" className="nav-active" onClick={reset}><Home size={17} /> Home</Button>
        <Button variant="plain" size="natural" onClick={() => setDialog("story")}><Heart size={17} /> Our Story</Button>
        <Button variant="plain" size="natural" onClick={reset}><Users size={18} /> Family Tree</Button>
        <Button variant="plain" size="natural" onClick={() => setDialog("gallery")}><Images size={17} /> Gallery</Button>
      </nav>
      <div className="family-search"><Search size={18} /><input aria-label="Search family member" value={query} onChange={event => search(event.target.value)} placeholder="Search family member..." />{query && <Button variant="plain" size="natural" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></Button>}</div>
      <span className="header-bell" aria-hidden="true"><Bell size={20} /><i /></span>
      <Button variant="secondary" size="icon" className="photo-toolbar-button" title="Family Photos" aria-label="Family Photos" onClick={() => setDialog("photos")}><Camera size={20} /></Button>
      <Button className="add-member" onClick={() => setDialog("add")}><UserPlus size={18} /><span>Add Member</span></Button>
      <span className="header-heart" aria-hidden="true">💗</span>
    </header>
    <main className="family-main">
      <WoodenSign />
      <div className="cloud-message" aria-hidden="true">Generations<br />grow, but love<br />always stays<span>♥</span></div>
      <div className="floating-heart one" aria-hidden="true">♥</div><div className="floating-heart two" aria-hidden="true">♥</div>
      <div className="zoom-controls" aria-label="Tree zoom">
        <Button variant="plain" size="natural" title="Zoom in" aria-label="Zoom in" onClick={() => setZoom(value => Math.min(1.6, value + 0.1))}><Plus size={21} /></Button>
        <Button variant="plain" size="natural" title="Zoom out" aria-label="Zoom out" onClick={() => setZoom(value => Math.max(0.5, value - 0.1))}><Minus size={21} /></Button>
        <Button variant="plain" size="natural" title="Reset view" aria-label="Reset view" onClick={reset}><Home size={20} /></Button>
      </div>
      <div className="tree-scroll" ref={tree}>
        <div className="tree-canvas" style={{ "--user-zoom": zoom } as CSSProperties}>
          <div id="family-root" className="grandparents">
            <HeartFrame />
            <span className="root-botanical left" aria-hidden="true">🌿<span>🌸</span>🌿</span><span className="root-botanical right" aria-hidden="true">🌿<span>🌸</span>🌿</span>
            <div className="grandparent-pair">{[{ name: root.name, img: photos["nana"] ?? nanaImg }, { name: root.spouse ?? "Nani", img: photos["nani"] ?? naniImg }].map(person => <div className="grandparent" key={person.name}><div className={`grandparent-portrait ${matches(root) ? "is-match" : ""}`}><img src={person.img} alt={person.name} width={816} height={816} /></div><span>{person.name}</span></div>)}<span className="grandparent-love" aria-hidden="true">💗</span></div>
            <div className="roots-ribbon"><span>♥</span> Our Roots <span className="ribbon-dot">·</span> Our Strength <span className="ribbon-dot">·</span> Our Forever <span>♥</span></div>
          </div>
          <Branches />
           <div className="couples-row">{displayRoot.children.map(member => <div id={member.id} key={member.id}><CoupleCard member={member} expanded={open.has(member.id)} highlight={matches(member)} onToggle={() => toggle(member.id)} /></div>)}</div>
           <div className={`expanded-branches ${open.size === 1 ? "single-branch" : ""}`}>{displayRoot.children.filter(member => open.has(member.id)).map(member => <ChildrenPanel key={member.id} member={member} term={term} onAdd={name => addChild(member.id, name)} />)}</div>
        </div>
      </div>
      <WoodenSign bottom />
      <div className="direction-signs" aria-hidden="true"><span>♥ Family ♥</span><span>Memories ♥</span><span>♥ Forever ♥</span></div>
    </main>
    <footer className="family-footer"><h2>The Sharma Family</h2><p>Rooted in Love <span>♥</span> Growing Together <span>♥</span> Always Home</p><p className="mt-1 text-xs opacity-80">Humara Parivar · Crafted with ♥ by Humna</p></footer>
    <Dialog.Root open={dialog !== null} onOpenChange={value => { if (!value) setDialog(null); }}><Dialog.Portal><Dialog.Overlay className="dialog-backdrop" /><Dialog.Content className="family-dialog" aria-describedby={undefined}>
      <Button variant="ghost" size="icon" className="absolute right-2 top-2" aria-label="Close" onClick={() => setDialog(null)}><X size={18} /></Button>
      <Dialog.Title className="mb-5 text-2xl">{dialog === "photos" ? "Our Family Photos" : dialog === "add" ? "A New Little Branch" : dialog === "story" ? "The Sharma Family" : "Family Gallery"}</Dialog.Title>
      {dialog === "photos" ? <FamilyPhotoPicker people={photoPeople} photos={photos} onPhoto={changePhoto} /> : dialog === "story" ? <div className="text-center"><span className="text-5xl">🌳</span><p className="mt-4">Nana & Nani</p><p className="mt-2 text-muted-foreground">Our Roots · Our Strength · Our Forever</p><div className="mt-5 flex flex-wrap justify-center gap-2">{root.children.map(member => <span className="rounded-full bg-secondary px-3 py-1 text-sm" key={member.id}>{firstName(member.name)} & {firstName(member.spouse ?? "")}</span>)}</div></div> : dialog === "gallery" ? <><Button variant="secondary" className="mb-4" onClick={() => setDialog("photos")}><Camera size={16} />Add Photos</Button><div className="grid grid-cols-3 gap-3">{photoPeople.map(person => <figure key={person.id}>{(photos[person.id] ?? person.image) ? <img src={photos[person.id] ?? person.image} alt={person.name} className="gallery-photo" /> : <div className="gallery-photo grid place-items-center bg-secondary"><Camera size={24} /></div>}<figcaption className="mt-1 text-center text-xs">{person.name}</figcaption></figure>)}</div></> : <form onSubmit={event => { event.preventDefault(); if (!newName.trim()) return; addChild(parent, newName.trim()); setOpen(previous => new Set([...previous, parent])); setNewName(""); setDialog(null); }} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">Family branch<select value={parent} onChange={event => setParent(event.target.value)} className="rounded-lg border bg-card p-3">{root.children.map(member => <option key={member.id} value={member.id}>{firstName(member.name)} & {firstName(member.spouse ?? "")}</option>)}</select></label>
        <label className="flex flex-col gap-2 text-sm">Child's name<input required value={newName} onChange={event => setNewName(event.target.value)} className="rounded-lg border bg-card p-3" /></label><Button type="submit" className="rounded-full"><Plus size={16} /> Add Child</Button>
      </form>}
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}

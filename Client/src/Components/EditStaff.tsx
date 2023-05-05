import { useState, useEffect, MouseEvent } from "react";
import VexSheet from "../Hooks/VexSheet";
import { NoteAccidental, Note, NoteDuration } from "../Types/Note";
import { Phrase, ValidatePhrase } from "../Types/Phrase";
import { Bounds, Clamp, Contains } from "../math";

function EditStaff()
{
  const [ghostNote, setGhost] = useState<Note>({ name: "C", octave: 5, duration: 2, accidental: 'n', dotted: false, rest: false });
  const [phrase, setPhrase] = useState<Phrase>([]);
  const [tied, setTied] = useState<number>(-1);

  const [RenderPhrase, GetStavePos, GetNotePlacementBounds] = VexSheet("Stave");

  useEffect(() => {    
    RenderPhrase(ValidatePhrase([...phrase, ghostNote]));
  });

  function GetNoteFromMousePos(mousePos: number) : Note {
    const NoteMap : string[] = ["C", "D", "E", "F", "G", "A", "B"].reverse();
    let voice = 7 - Math.floor((mousePos) / 7);
    let note = NoteMap[Math.floor(mousePos) % 7];

    return {
      ...ghostNote,
      name: note,
      octave: voice
    } as Note;
  }

  function MouseMove(e: MouseEvent<HTMLCanvasElement>) {
    const stavePos = Clamp(GetStavePos(e.currentTarget.offsetTop, e.clientY, phrase.length), 11, 31);
    const note = GetNoteFromMousePos(stavePos);


    const ghostNoteBounds : Bounds = GetNotePlacementBounds(phrase.length);
    let hovering  = Contains (
      {x: e.clientX - e.currentTarget.offsetLeft, y: e.clientY - e.currentTarget.offsetTop}, 
      ghostNoteBounds
    );

    if(hovering) {

      if(ghostNote.rest)
        setGhost({...note, name: "B", octave: 4})
      else
        setGhost(note);
    }
  }

  function MouseClick() {
    let local = [...phrase];

    if(tied != -1 && phrase.length > tied)
      local[tied].tie! += 1;

    setPhrase(ValidatePhrase([
      ...local, 
      {...ghostNote, tie: 0}
    ]));
  }

  function getNoteButtonStyle(duration: NoteDuration) : string {    
    return `noteBtn ${duration == ghostNote.duration ? 'active':''}`;
  }

  function getAccidentalButtonStyle(accent: NoteAccidental) : string {
    return `noteBtn ${accent == ghostNote.accidental ? '': 'active'}`;
  }

  function getDottedButtonStyle(){
    return `noteBtn ${ghostNote.dotted ? '':'active'}`
  }

  function getTieButtonStyle(){
    return `noteBtn ${tied != -1 ? '':'active'}`
  }

  function getRestButtonStyle(){
    return `noteBtn ${ghostNote.rest ? '':'active'}`
  }

  function SetGhostDuration(duration: NoteDuration) : void {
    setGhost({
      ...ghostNote,
      duration,
      dotted: duration == 1 ? false : ghostNote.dotted
    } as Note);  
  }

  function SetGhostAccidental(accidental: NoteAccidental) : void {
    setGhost({
      ...ghostNote,
      accidental
    } as Note);  
  }

  function SetGhostDotted(dotted: boolean) : void {
    setGhost({
      ...ghostNote,
      dotted
    } as Note);  
  }

  function SetGhostRest(rest: boolean) : void {
    setGhost({
      ...ghostNote,
      rest
    } as Note);  
  }

  function ToggleTie() : void {
    if(tied == -1){
      setTied(phrase.length);
    } else {
      setTied(-1);
    }
  }

  return (
    <>
      <canvas id="Stave" onMouseMove={MouseMove} onClick={MouseClick} style={{float: "none"}}/>
      <div style={{float:"none", marginTop: '3rem'}}>
        <button className={getNoteButtonStyle(8)} onClick={()=>{ SetGhostDuration(8) }}>Whole</button>
        <button className={getNoteButtonStyle(4)} onClick={()=>{ SetGhostDuration(4) }}>Half</button>
        <button className={getNoteButtonStyle(2)} onClick={()=>{ SetGhostDuration(2) }}>Quarter</button>
        <button className={getNoteButtonStyle(1)} onClick={()=>{ SetGhostDuration(1) }}>Eighth</button>
      </div>
      <div style={{float:"none", marginTop: "1rem"}}>
        <button className={getAccidentalButtonStyle("b")} onClick={()=>{ SetGhostAccidental("b") }}>Flat</button>
        <button className={getAccidentalButtonStyle("n")} onClick={()=>{ SetGhostAccidental("n") }}>Natural</button>
        <button className={getAccidentalButtonStyle("#")} onClick={()=>{ SetGhostAccidental("#") }}>Sharp</button>
      </div>
      <div style={{float:"none", marginTop: "1rem"}}>
        <button className={getDottedButtonStyle()} onClick={()=>{ SetGhostDotted(!ghostNote.dotted) }}>Dotted</button>
        <button className={getTieButtonStyle()} onClick={()=>{ ToggleTie() }}>Tie</button>
        <button className={getRestButtonStyle()} onClick={()=>{ SetGhostRest(!ghostNote.rest) }}>Rest</button>
      </div>
    </>
  );
}

export default EditStaff;
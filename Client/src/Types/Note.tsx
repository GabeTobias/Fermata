export type NoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type NoteDuration = 1 | 2 | 4 | 8;
export type NoteAccidental = "bb" | "b" | "n" | "#" | "##"

export const NoteDurationMap : { [index: number] : string } = {
  [1] : "8",
  [2] : "q",
  [4] : "h",
  [8] : "w"
};

export const DurationNoteMap : { [index: string] : number } = {
  ["8"] : 1,
  ["q"] : 2,
  ["h"] : 4,
  ["w"] : 8
};

export const NoteAccidentalList : string[] = [
  "bb",
  "b",
  "n",
  "#",
  "##"
];

export type Note = {
  name: NoteName,
  octave: number,
  duration: NoteDuration,       //Number of eighth notes it lasts
  accidental: NoteAccidental,
  dotted: boolean,
  rest: boolean,
  tie?: number    // Number of following notes that are tied to this note 
}

export function GetDuration(notes: Note[]) : number {
  let eightCount = 0;
  for(let i = 0; i < notes.length; i++)
  {
    eightCount += notes[i].duration;
    if(notes[i].duration > 1 && notes[i].dotted){
      eightCount += notes[i].duration / 2;
    }
  }
  return eightCount;
}

export function FillBeats(base: Note, beatCount: number, arr: Note[]) : Note[]
{
  if(beatCount == 0)
    return arr;

  for(let i = 8; i >= 1; i /= 2)
  {
    if(i <= beatCount)
      return FillBeats(base, beatCount-i, [...arr, {...base, duration: i as NoteDuration}]);
  }

  return [];
}

export function SPN(note: Note) : string { return note.name + '/' + note.octave; }
export function SPNDuration(note: Note) : string { return NoteDurationMap[note.duration] + (note.rest ? 'r':''); }

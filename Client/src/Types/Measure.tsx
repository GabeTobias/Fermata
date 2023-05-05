import { FillBeats, GetDuration, Note } from "./Note"

export type Clef = "treble" | "tenor" | "alto" | "bass";

export type TimeSignature = {
  beatsPerMeasure: number,
  durationOfBeat: number
};

export type Measure = {
  notes: Note[],
  clef: Clef,
  timeSigniture: TimeSignature,
  showClef: boolean,
  showTimeSignature: boolean
}

export function GetTrailingRests (measure: Measure) : Note[] {
  //Count number of rests in smallest increment (For now is eight notes)
  let eightCount = 8 - GetDuration(measure.notes);

  return FillBeats({
    name: "B",
    octave: 4,
    duration: 1,
    accidental: "n",
    dotted: false,
    rest: true
  } as Note, eightCount, [] as Note[]);
}

export function FormatTimeSignature(signature: TimeSignature) : string {
  return `${signature.beatsPerMeasure}/${signature.durationOfBeat}`;
}
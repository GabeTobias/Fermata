import { Measure, GetTrailingRests } from "./Measure";
import { GetDuration, Note, FillBeats } from "./Note";

export type Phrase = Note[];

export function ValidatePhrase(phrase: Phrase) : Note[] 
{
  let notes: Note[] = [];
  let beatCount = 0;
  for(let i = 0; i < phrase.length; i++)
  {
    if(beatCount + phrase[i].duration > 8)
    {
      let overflow = (beatCount + phrase[i].duration) - 8;
      let underflow = phrase[i].duration - overflow;

      let tiedNotes = [
        ...FillBeats(phrase[i], underflow, []), 
        ...FillBeats(phrase[i], overflow, [])
      ];

      tiedNotes[0].tie = tiedNotes.length-1;
      notes.push(...tiedNotes);

      beatCount = overflow;
    } else {
      notes.push(phrase[i]);

      if(beatCount + phrase[i].duration >= 8)
        beatCount = 0;
      else
        beatCount += phrase[i].duration;
    }
  }
  
  return notes; 
}
  
export function GetPhraseMeasures(phrase: Phrase) : Measure[] 
{ 
  if(phrase.length <= 0) return [];

  //For now we will assume its all in 4/4
  let beatCount = GetDuration(phrase);
  let measureCount = beatCount / 8;
  let measures : Measure[] = [];
  let currentNote = 1;

  for(let i = 0; i < measureCount; i++) {
    //Calculate Notes
    let mNotes : Note[] = [phrase[currentNote-1]];

    //Yet again assuming we're in 4/4
    while(currentNote < phrase.length && GetDuration(mNotes) + phrase[currentNote].duration <= 8) {
      mNotes.push(phrase[currentNote]);
      currentNote++;
    }

    if(currentNote < phrase.length)
      currentNote++;

    //Generate a Measure
    const measure : Measure = {
      notes: mNotes,
      clef: "treble",
      timeSigniture: { beatsPerMeasure: 4, durationOfBeat: 4 },
      showClef: true,
      showTimeSignature: true
    };

    //Generate Trailing Rests
    if(GetDuration(mNotes) < 8)
      measure.notes = [...mNotes, ...GetTrailingRests(measure)];

    measures.push(measure);
  }

  return measures;
}
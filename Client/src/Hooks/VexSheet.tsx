import { Accidental, BoundingBox, Dot, Curve, Formatter, RenderContext, Renderer, Stave, StaveNote, StaveTie, TieNotes, CurvePosition, Stem } from "vexflow";
import { DurationNoteMap, Note, SPN, SPNDuration } from "../Types/Note";
import { FormatTimeSignature, Measure, GetTrailingRests } from "../Types/Measure";
import { GetPhraseMeasures, Phrase } from "../Types/Phrase";
import { Bounds } from "../math";

const notePadding = 10;

type RenderedNote = { staveNote: StaveNote, theoryNote: Note, mIndex: number };

function VexSheet(docID: string) {
  let cachedContext : RenderContext;
  let cachedStaveNotes : RenderedNote[] = [];       //TODO: THis should be a map { [Note]: RenderedNote }

  function GenerateStaveNote(note: Note) : StaveNote {
    let stvNote = new StaveNote({ keys: [SPN(note)], duration: SPNDuration(note) });
        
    //TODO: Detect written accidentals based on the key signature
    if(note.accidental != 'n')
      stvNote.addModifier(new Accidental(note.accidental));
    
    if(note.dotted)
      Dot.buildAndAttach([stvNote]);
  
    return stvNote;
  }

  function GetStaveX(index: number) : number { return (index % 2) * 400; }
  function GetStaveY(index: number) : number { return Math.floor(index / 2) * 100; }

  function GetStavePos(canvasY: number, mouseY: number, index: number) : number {
    let box = GetNotePlacementBounds(index);
    return (-(canvasY - mouseY) + 50 - box.y) / 5;
  }

  function GenerateStave(measure: Measure, index: number) : { stave: Stave, notes: StaveNote[] } {    // Create a stave of width 400 at position 10, 40 on the canvas.
    const stave = new Stave(GetStaveX(index), GetStaveY(index), 400);

    if(index % 2 == 0)
      stave.addClef(measure.clef);
    
    if(index == 0)
      stave.addTimeSignature(FormatTimeSignature(measure.timeSigniture));

    let notes : StaveNote[] = [];
    for(let i = 0; i < measure.notes.length; i++) {
      notes.push(GenerateStaveNote(measure.notes[i]));
    }

    let rests : Note[] = GetTrailingRests(measure);
    for(let i = 0; i < rests.length; i++) {
      notes.push(GenerateStaveNote(rests[i]));
    }

    return { stave, notes };
  }

  function RenderMeasure(measure: Measure, context: RenderContext, index: number, final: number) : RenderedNote[] {
    let { stave, notes } = GenerateStave(measure, index);

    if(index == final)
    {
      //Find last note
      let fin : number = 0;
      for(let i = 0; i < notes.length; i++)
      {
        if(!notes[i].isRest())
          fin = i;
      }

      notes[fin].setStyle({fillStyle: 'blue'});
      notes[fin].setStemStyle({strokeStyle: 'blue'});
    }

    stave.setContext(context).draw();
    Formatter.FormatAndDraw(context, stave, notes, true);
    context.setFillStyle("#000000");

    let generatedNotes : RenderedNote[] = [];
    for(let i = 0; i < notes.length; i++)
      generatedNotes.push({ staveNote: notes[i], theoryNote: measure.notes[i], mIndex: index});

    return generatedNotes;
  }

  function GetNotePlacementBounds(index: number) : Bounds
  {
    let box : BoundingBox = cachedStaveNotes[index].staveNote.getBoundingBox();
    let padding = notePadding * DurationNoteMap[cachedStaveNotes[index].staveNote.getDuration()];
    return {
      x: box.getX() - padding, 
      y: GetStaveY(cachedStaveNotes[index].mIndex), 
      w: box.getW() + (padding*2), 
      h: 120
    };
  }
  
  function RenderNotePlacementBounds(index: number)
  {
    let box : Bounds = GetNotePlacementBounds(index);
    cachedContext.setFillStyle("#ff000055");
    cachedContext.fillRect(box.x, box.y, box.w, box.h);
  }

  function RenderPhraseTies(phrase: Phrase) {
    //Generate ties
    for(let i = 0; i < phrase.length; i++){
      if(phrase[i].tie){
        // Identify Ties across vertical bars
        let current = cachedStaveNotes[i];
        let lastNote = cachedStaveNotes[i + phrase[i].tie!];
        if(Math.floor(current.mIndex / 2) != Math.floor(lastNote.mIndex / 2)) {
          //TODO: There is a way to make it so ties can jump across multiple 
          //      vertical lines but thats not super important rn so I'm 
          //      ignoring the edge case 

          // Find the index where it splits
          let splitIndex = i;
          for(; splitIndex < i + phrase[i].tie!; splitIndex++) {
            if(Math.floor(cachedStaveNotes[splitIndex].mIndex / 2) != Math.floor(cachedStaveNotes[splitIndex+1].mIndex / 2)) {
              break;
            }
          }

          let offsetStart = current.staveNote.stem_direction == Stem.UP ? [5,10] : [-5,-10];
          let offsetEnd = current.staveNote.stem_direction == Stem.UP ? [10,5] : [-10,-5];

          //Draw Curve to the first note to the end of its measure
          new StaveTie({
            first_note: current.staveNote,
            last_note: lastNote.staveNote,
            first_indices: [0],
            last_indices: [0]
          } as TieNotes).setContext(cachedContext).renderTie({
            direction: current.staveNote.stem_direction!,
            first_x_px: current.staveNote.getTieRightX(),
            last_x_px: GetStaveX(i) + 400,
            first_ys: current.staveNote.getYs().map((value) => { return value + offsetStart[0] }),
            last_ys: current.staveNote.getYs().map((value) => { return value + offsetStart[1] })
          });

          //Draw Curve from the begining of the second measure to the last note
          new StaveTie({
            first_note: current.staveNote,
            last_note: lastNote.staveNote,
            first_indices: [0],
            last_indices: [0]
          } as TieNotes).setContext(cachedContext).renderTie({
            direction: cachedStaveNotes[splitIndex+1].staveNote.stem_direction!,
            first_x_px: GetStaveX(splitIndex+1),
            last_x_px: lastNote.staveNote.getTieLeftX(),
            first_ys: lastNote.staveNote.getYs().map((value) => { return value + offsetEnd[0] }),
            last_ys: lastNote.staveNote.getYs().map((value) => { return value + offsetEnd[1] })
          });
        }
        else {
          new Curve(
            current.staveNote,
            lastNote.staveNote,
            {
              cps: [
                { x: 0, y: current.theoryNote.tie! * 10 },
                { x: 0, y: current.theoryNote.tie! * 10 },
              ],
            }
          ).setContext(cachedContext).draw();
        }
      }
    }
  }

  function RenderPhrase(phrase: Phrase) {
    const renderer = new Renderer(docID, Renderer.Backends.CANVAS);    
    const context = renderer.getContext();
    renderer.resize(801, window.innerHeight - 300);
    cachedContext = context;

    let measures : Measure[] = GetPhraseMeasures(phrase);
    for(let i = 0; i < measures.length; i++){
      let rNotes : RenderedNote[] = RenderMeasure(measures[i], context, i, measures.length-1);
      cachedStaveNotes.push(...rNotes);
    }

    RenderPhraseTies(phrase);

    //DEBUG Render Note Placement Bounds
    if(0){
      for(let i = 0; i < cachedStaveNotes.length; i++)
        RenderNotePlacementBounds(i);
    }
  };

  return [RenderPhrase, GetStavePos, GetNotePlacementBounds, RenderNotePlacementBounds] as const;
}

export default VexSheet;
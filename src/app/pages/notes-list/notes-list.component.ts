import { Component, ElementRef, OnInit, Query, ViewChild } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';
import { animate, query, style, transition, trigger, stagger } from '@angular/animations';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      // Entry Animation
      transition('void => *', [
        //Initial State
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          // have to expand out the padding properties

          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,

        }),
        // Animate Height and Margin
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingLeft: '*',
          paddingRight: '*'
        })),

        animate(72)
      ]),

      transition('* => void', [
        // first scale up
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        // then scale down while begining to fade down
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        // scale down and fade out completely
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0,
        })),
        // then animate the spacing (height and margin and padding)
        animate('150ms ease-out', style({
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          'margin-bottom': 0,
        }))
      
      ])
      
    ]),
    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            height: 0
          }),
           stagger(100, [
             animate('0.2s ease')
           ])
        ],{ optional: true })
      ])
    ])
  ]
})


export class NotesListComponent implements OnInit {

  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();

  @ViewChild('filterInput') filterInputElRef : ElementRef<HTMLInputElement>;

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    // we want to retrive all notes
    this.notes = this.notesService.getAllNotes();
    //this.filteredNotes = this.notesService.getAllNotes();
    this.filter('');
  }

  deleteNote(note: Note){
    let noteId = this.notesService.getNoteId(note);
    this.notesService.deleteNote(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);
  }

  generateNoteURL(note: Note) {
    let noteId = this.notesService.getNoteId(note);
    return noteId;
  }

  filter(query: string){
    query = query.toLowerCase().trim();

    let allResults: Note [] = new Array<Note>();
    // split search query into individual words
    let terms: string[] = query.split(' '); // split on spaces
    // remove duplicates search terms
    terms = this.removeDuplicates(terms);
    //compile all relevent results into allResults array
    
    terms.forEach(term => {
      let results: Note[] = this.releventNotes(term);
      // append results to the allresults array
      allResults = [...allResults, ...results];
    });

    // allResults will include duplicate notes
    // because a particular note can be the result of many search terms
    // but we don't want to show the same note multiple times on the UI
    // so we first must remove the duplicate
    let uniqueResults = this. removeDuplicates(allResults);

    this.filteredNotes = uniqueResults;

    // now sort by relevance
    this.sortByRelevance(allResults);
  }

  removeDuplicates(arr: Array<any>): Array<any>{
    let uniqueResults: Set<any> = new Set<any>();
    //loop throught the input array and add the items to the set
    arr.forEach(e => uniqueResults.add(e));

    return Array.from(uniqueResults);
     
  }

  releventNotes(query: string): Array<Note>{
    query = query.toLowerCase().trim();

    let releventNotes = this.notes.filter(note => {
      if(note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }
      if(note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    })

    return releventNotes;
  }

  sortByRelevance(searchResults: Note[]) {
    // this method will calculate the relevancy of a note based on the number of times it appears in the search result

    let noteCountObj: Object = {}; // format - Key:Value => NoteId:number(note object id: count)

    searchResults.forEach( note => {
      let noteId = this.notesService.getNoteId(note); // get note id

       if (noteCountObj[noteId]) {
         noteCountObj[noteId] += 1;
       } else {
         noteCountObj[noteId] = 1;
       }
    })

    this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {
      let aId = this.notesService.getNoteId(a);
      let bId = this.notesService.getNoteId(b);


      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];

      return bCount - aCount;
    })
    
  }

}

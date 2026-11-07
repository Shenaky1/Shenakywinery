export type Event={date:string;type:string;text:string};
export type Task={title:string;due:string;done:boolean};
export type SourceNote={key:string;year:string;title:string;created:string;modified:string;text:string;kind:string};
export type Batch={sourceNotes?:SourceNote[];notesImportVersion?:number;source?:string;brix?:string;yeast?:string;filtration?:string;stability?:string;importVersion?:number;id:string;name:string;vintage:string;stage:string;volume:string;ph:string;ta:string;free:string;total:string;malic:string;temp:string;mlf:string;oak:string;additives:string;lab:string;notes:string;harvest:string;bottling:string;label:string;abv:string;bottles:string;sold:string;price:string;events:Event[];tasks:Task[]};

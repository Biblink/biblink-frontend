import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/take';


interface QueryConfig {
  path: string;
  field: string;
  type?: string;
  limit?: number;
  reverse?: boolean;
  prepend?: boolean;
}
@Injectable()
export class PaginationService {
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject([]);
  private query: QueryConfig;
  private _id: string;
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();
  constructor(private afs: AngularFirestore) { }
  init(id, path, field, opts?) {
    this.query = null;
    this._data = new BehaviorSubject([]);
    this._done = new BehaviorSubject(false);
    this._loading = new BehaviorSubject(false);
    this.done = this._done.asObservable();
    this.loading = this._loading.asObservable();
    this.data = null;
    this.query = {
      path,
      field,
      limit: 2,
      reverse: false,
      prepend: false,
      type: 'all',
      ...opts
    };
    this._id = id;
    let first = this.afs.collection('studies');
    if (this.query.type === 'all') {
      console.log('here');
      first = this.afs.collection('studies').doc(id).collection(this.query.path, ref => {
        return ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
          .limit(this.query.limit);
      });
    } else {
      first = this.afs.collection('studies').doc(id).collection(this.query.path, ref => {
        return ref.where('type', '==', this.query.type).orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
          .limit(this.query.limit);
      });
    }
    this.mapAndUpdate(first);

    this.data = this._data.asObservable()
      .scan((acc, val) => {
        return this.query.prepend ? val.concat(acc) : acc.concat(val);
      });
  }

  private mapAndUpdate(col: AngularFirestoreCollection<any>) {
    if (this._done.value || this._loading.value) { return; }
    this._loading.next(true);
    return col.snapshotChanges().do(arr => {
      let values = arr.map(snap => {
        const data = snap.payload.doc.data();
        const doc = snap.payload.doc;
        return { ...data, doc };
      });
      values = this.query.prepend ? values.reverse() : values;
      this._data.next(values);
      this._loading.next(false);
      if (!values.length) {
        this._done.next(true);
      }
    })
      .take(5)
      .subscribe();
  }

  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend ? current[ 0 ].doc : current[ current.length - 1 ].doc;
    }
    return null;
  }

  more() {
    const cursor = this.getCursor();
    let more = this.afs.collection('studies');
    if (this.query.type === 'all') {
      more = this.afs.collection('studies').doc(this._id).collection(this.query.path, ref => {
        return ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc').limit(this.query.limit).startAfter(cursor);
      });
    } else {
      more = this.afs.collection('studies').doc(this._id).collection(this.query.path, ref => {
        return ref.where('type', '==', this.query.type)
          .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc').limit(this.query.limit).startAfter(cursor);
      });
    }
    this.mapAndUpdate(more);
  }
}

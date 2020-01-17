import { through } from '@kjots/observable-stream';
import { streamObservable } from '@kjots/stream-observable';

import { Observable } from 'rxjs';

import File from 'vinyl';
import vinylFs, { DestOptions, SrcOptions } from 'vinyl-fs';

export function src(globs: string | Array<string>, opt?: SrcOptions): Observable<File> {
  return streamObservable(vinylFs.src(globs, opt));
}

export function dest(folder: string | ((file: File) => string), opt?: DestOptions): (observable: Observable<File>) => Observable<File> {
  return through(vinylFs.dest(folder as any, opt));
}

export function symlink(folder: string | ((file: File) => string), opts?: { cwd?: string, mode?: number | string, dirMode?: number }): (observable: Observable<File>) => Observable<File> {
  return through(vinylFs.symlink(folder as any, opts));
}

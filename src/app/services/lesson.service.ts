import { Injectable, signal } from '@angular/core';
import { VideoLesson } from '../models/lesson.model';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private _lessons = signal<VideoLesson[]>([
    {
      id: '1', videoId: 'jNQXAC9IVRw',
      title: 'Me at the Zoo',
      description: 'Video đầu tiên trên YouTube — giản dị, dễ nghe.',
      level: 'Beginner', topic: 'Daily Life', transcript: [],
    },
    {
      id: '2', videoId: 'UF8uR6Z6KLc',
      title: 'Steve Jobs — Stanford 2005',
      description: 'Bài phát biểu truyền cảm hứng nổi tiếng nhất thế giới.',
      level: 'Advanced', topic: 'Motivation', transcript: [],
    },
  ]);

  readonly lessons = this._lessons.asReadonly();

  addLesson(lesson: VideoLesson): void {
    this._lessons.update(ls => [lesson, ...ls]);
  }
}

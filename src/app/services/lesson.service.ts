import { Injectable, signal } from '@angular/core';
import { VideoLesson } from '../models/lesson.model';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private _lessons = signal<VideoLesson[]>([
    {
      id: '1', videoId: 'jNQXAC9IVRw',
      title: 'English for Beginners',
      description: 'Perfect for English beginners — simple, clear audio.',
      level: 'A1', topic: 'Daily Life', transcript: [],
    },
    {
      id: '2', videoId: 'UF8uR6Z6KLc',
      title: 'Steve Jobs — Stanford 2005',
      description: 'Bài phát biểu truyền cảm hứng nổi tiếng nhất thế giới.',
      level: 'C2', topic: 'Motivation', transcript: [],
    },
    {
      id: '3', videoId: 'dQw4w9WgXcQ',
      title: 'The Cozy English Podcast',
      description: 'Listening practice at A2 English level.',
      level: 'A2', topic: 'Podcast', transcript: [],
    },
    {
      id: '4', videoId: '9bZkp7q19f0',
      title: 'A Better Of You Podcast',
      description: 'Một playlist dành cho những ngày bạn muốn trở nên tốt hơn.',
      level: 'B2', topic: 'Motivation', transcript: [],
    },
    {
      id: '5', videoId: 'kXYiU_JCYtU',
      title: 'BBC Learning English',
      description: 'BBC Learning English offers short, clear lessons for learners.',
      level: 'B1', topic: 'Culture', transcript: [],
    },
    {
      id: '6', videoId: 'wOHmKsJwdL0',
      title: 'TOEIC Listening Practice',
      description: 'Practice for TOEIC listening section with real test formats.',
      level: 'C1', topic: 'Business', transcript: [],
    },
  ]);

  readonly lessons = this._lessons.asReadonly();

  addLesson(lesson: VideoLesson): void {
    this._lessons.update(ls => [lesson, ...ls]);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CommentDto {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  lessonId: string;
  lineIndex: number | null;
  content: string;
  parentId: string | null;
  likeCount: number;
  dislikeCount: number;
  myReaction: boolean | null;
  createdAt: string;
  replies: CommentDto[];
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);

  getComments(lessonId: string): Observable<CommentDto[]> {
    return this.http.get<CommentDto[]>(`${environment.apiUrl}/lessons/${lessonId}/comments`);
  }

  createComment(lessonId: string, content: string): Observable<CommentDto> {
    return this.http.post<CommentDto>(`${environment.apiUrl}/lessons/${lessonId}/comments`, { content, lineIndex: null, parentId: null });
  }

  deleteComment(lessonId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/lessons/${lessonId}/comments/${commentId}`);
  }

  toggleReaction(lessonId: string, commentId: string, reactionType: 'Like' | 'Dislike'): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/lessons/${lessonId}/comments/${commentId}/reactions`, { reactionType });
  }
}

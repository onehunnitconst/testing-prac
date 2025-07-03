import { Todo } from '@prisma/client';

export class TodoDto {
  id: number;
  title: string;
  completed: boolean;

  static fromModel(model: Todo): TodoDto {
    return {
      id: model.id,
      title: model.title,
      completed: model.completed,
    };
  }
}

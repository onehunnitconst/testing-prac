import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@App/modules/prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoDto } from './dto/todo.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodos(page: number, size: number): Promise<TodoDto[]> {
    const todos = await this.prisma.todo.findMany({
      skip: (page - 1) * size,
      take: size,
    });

    return todos.map((todo) => TodoDto.fromModel(todo));
  }

  async getTodo(id: number): Promise<TodoDto> {
    const todo = await this.prisma.todo.findFirst({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException('할 일을 찾을 수 없습니다.');
    }

    return TodoDto.fromModel(todo);
  }

  async createTodo(body: CreateTodoDto): Promise<TodoDto> {
    const createdTodo = await this.prisma.todo.create({
      data: body,
    });

    return TodoDto.fromModel(createdTodo);
  }

  async updateTodo(id: number, body: UpdateTodoDto): Promise<TodoDto> {
    const updatedTodo = await this.prisma.todo.update({
      where: { id },
      data: body,
    });

    return TodoDto.fromModel(updatedTodo);
  }

  async deleteTodo(id: number): Promise<TodoDto> {
    const deletedTodo = await this.prisma.todo.delete({
      where: { id },
    });

    return TodoDto.fromModel(deletedTodo);
  }
}

import { Test } from '@nestjs/testing';
import { PrismaService } from '@App/modules/prisma/prisma.service';
import { TodosService } from './todos.service';
import { Prisma, Todo } from '@prisma/client';
import { TodoDto } from './dto/todo.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('할 일 서비스 단위 테스트', () => {
  let service: TodosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: getMockPrismaContext(),
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('할 일 읽기 테스트', () => {
    it('할 일을 원하는 범위만큼 조회를 할 수 있어야 한다.', async () => {
      const result = await service.getTodos(1, 5);

      expect(result).toEqual(
        todos.slice(0, 5).map((todo) => TodoDto.fromModel(todo)),
      );
    });

    it('페이징 범위를 넘어가는 경우, 빈 리스트를 반환해야 한다.', async () => {
      const result = await service.getTodos(1000, 5);

      expect(result).toEqual([]);
    });

    it('할 일 상세 조회를 할 수 있어야 한다.', async () => {
      const result = await service.getTodo(1);

      expect(result).toEqual(TodoDto.fromModel(todos[0]));
    });

    it('해당 ID와 일치하는 할 일이 없는 경우, NotFoundException이 발생해야 한다.', () => {
      void expect(service.getTodo(1000)).rejects.toThrow(NotFoundException);
    });
  });

  describe('할 일 쓰기 테스트', () => {
    it('할 일을 생성하면 생성된 할 일을 반환받는다.', async () => {
      const body: CreateTodoDto = {
        title: '새로운 할 일',
      };

      const result = await service.createTodo(body);

      expect(result.title).toEqual(body.title);
    });

    it('할 일을 수정하면 내용이 변경된 할 일을 반환받는다.', async () => {
      const created = await prisma.todo.create({
        data: {
          title: '방금 생성한 할 일',
          completed: false,
        },
      });

      const body: UpdateTodoDto = {
        title: '수정된 할 일',
        completed: true,
      };

      const result = await service.updateTodo(created.id, body);

      expect({ title: result.title, completed: result.completed }).not.toEqual({
        title: created.title,
        completed: created.completed,
      });

      expect({ title: result.title, completed: result.completed }).toEqual({
        title: body.title,
        completed: body.completed,
      });
    });

    it('할 일을 삭제하면 삭제된 할 일은 조회할 수 없다.', async () => {
      const created = await prisma.todo.create({
        data: {
          title: '방금 생성한 할 일',
        },
      });

      await service.deleteTodo(created.id);

      const tryGetDeletedTodo = await prisma.todo.findFirst({
        where: {
          id: created.id,
        },
      });

      expect(tryGetDeletedTodo).toBeNull();
    });
  });
});

function getMockPrismaContext() {
  return {
    $transaction: jest.fn(),
    todo: {
      findMany: jest
        .fn()
        .mockImplementation((args: Prisma.TodoFindManyArgs) => {
          const result = [...todos];

          if (args.skip && args.take) {
            return result.slice(args.skip, args.skip + args.take);
          }

          if (args.skip) {
            return result.slice(args.skip);
          }

          if (args.take) {
            return result.slice(0, args.take);
          }

          return Promise.resolve(result);
        }),
      findFirst: jest
        .fn()
        .mockImplementation((args: Prisma.TodoFindFirstArgs) => {
          const result = todos.find((todo) => todo.id === args.where?.id);

          if (!result) {
            return null;
          }

          return Promise.resolve(result);
        }),
      create: jest.fn().mockImplementation((args: Prisma.TodoCreateArgs) => {
        const newTodo: Todo = {
          id: todosSequence++,
          title: args.data.title,
          completed: args.data.completed ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        todos.push(newTodo);

        return Promise.resolve(newTodo);
      }),
      update: jest.fn().mockImplementation((args: Prisma.TodoUpdateArgs) => {
        const findTodo = todos.find((todo) => todo.id === args.where?.id);

        if (!findTodo) {
          return null;
        }

        const updatedTodo = {
          ...findTodo,
        };

        updatedTodo.title = (args.data?.title ?? findTodo.title) as string;
        updatedTodo.completed = (args.data?.completed ??
          findTodo.completed) as boolean;

        return Promise.resolve(updatedTodo);
      }),
      delete: jest.fn().mockImplementation((args: Prisma.TodoDeleteArgs) => {
        const findTodo = todos.find((todo) => todo.id === args.where?.id);

        if (!findTodo) {
          return null;
        }

        todos = todos.filter((todo) => todo.id !== args.where?.id);

        return Promise.resolve(findTodo);
      }),
    },
  };
}

let todosSequence = 5;

let todos: Todo[] = [
  {
    id: 1,
    title: '빨래하기',
    completed: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 2,
    title: '청소하기',
    completed: false,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: 3,
    title: '인터넷 강의 듣기',
    completed: true,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-03'),
  },
  {
    id: 4,
    title: '운동하기',
    completed: false,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: 5,
    title: '책 읽기',
    completed: false,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
];

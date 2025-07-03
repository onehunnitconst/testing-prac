import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';

@Controller('todos')
export class TodosController {
  @Get()
  getTodos() {
    return 'todos';
  }
}

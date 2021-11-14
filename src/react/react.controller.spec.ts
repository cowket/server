import { Test, TestingModule } from '@nestjs/testing';
import { ReactController } from './react.controller';

describe('ReactController', () => {
  let controller: ReactController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactController],
    }).compile();

    controller = module.get<ReactController>(ReactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

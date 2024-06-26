import { Test, TestingModule } from '@nestjs/testing';
import { FavouriteCarController } from './favourite-car.controller';

describe('FavouriteCarController', () => {
  let controller: FavouriteCarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouriteCarController],
    }).compile();

    controller = module.get<FavouriteCarController>(FavouriteCarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

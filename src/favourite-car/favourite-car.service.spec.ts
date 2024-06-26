import { Test, TestingModule } from '@nestjs/testing';
import { FavouriteCarService } from './favourite-car.service';

describe('FavouriteCarService', () => {
  let service: FavouriteCarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavouriteCarService],
    }).compile();

    service = module.get<FavouriteCarService>(FavouriteCarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

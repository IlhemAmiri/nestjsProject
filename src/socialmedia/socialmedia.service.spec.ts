import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaService } from './socialmedia.service';

describe('SocialMediaService', () => {
  let service: SocialMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialMediaService],
    }).compile();

    service = module.get<SocialMediaService>(SocialMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

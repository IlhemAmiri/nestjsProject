import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaController } from './socialmedia.controller';

describe('SocialMediaController', () => {
  let controller: SocialMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialMediaController],
    }).compile();

    controller = module.get<SocialMediaController>(SocialMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

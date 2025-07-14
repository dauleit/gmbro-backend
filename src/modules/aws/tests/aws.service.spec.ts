import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from '../aws.service';
import { ConfigService } from 'src/configs/config.service';
import { S3 } from 'aws-sdk';
import { GeneratePresignedUrlDto } from '../dto/generate-presigned-url.dto';
import { GenerateMultiPresignedUrlDto } from '../dto/generate-multi-presigned-url.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';

jest.mock('aws-sdk', () => {
  const mockS3 = {
    getSignedUrlPromise: jest.fn()
  };
  return { S3: jest.fn(() => mockS3) };
});

describe('AwsService', () => {
  let service: AwsService;
  let configService: ConfigService;
  let s3Mock: jest.Mocked<S3>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                AWS_ACCESS_KEY_ID: 'test-access-key',
                AWS_SECRET_ACCESS_KEY: 'test-secret-key',
                AWS_REGION: 'test-region',
                AWS_BUCKET_NAME: 'test-bucket',
                AWS_ENDPOINT: 'https://test-endpoint.com'
              };
              return config[key];
            })
          }
        }
      ]
    }).compile();

    service = module.get<AwsService>(AwsService);
    configService = module.get<ConfigService>(ConfigService);
    s3Mock = new S3() as jest.Mocked<S3>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned URL', async () => {
      const mockUrl = 'https://test-bucket.s3.test-region.amazonaws.com/test-key';
      s3Mock.getSignedUrlPromise.mockResolvedValue(mockUrl);

      const dto: GeneratePresignedUrlDto = {
        folder: 'test-folder',
        extension: 'txt',
        contentType: 'text/plain'
      };

      const result = await service.generatePresignedUrl(dto);

      expect(s3Mock.getSignedUrlPromise).toHaveBeenCalledWith('putObject', {
        Bucket: 'test-bucket',
        Key: expect.stringMatching(/^test-folder\/.*\.txt$/),
        Expires: 600,
        ContentType: 'text/plain'
      });
      expect(result).toEqual({
        message: ERROR_MESSAGES.common.CREATED,
        data: {
          uploadUrl: mockUrl,
          endpoint: expect.stringMatching(/^https:\/\/test-endpoint\.com\/test-folder\/.*\.txt$/)
        }
      });
    });
  });

  describe('generateMultiPresignedUrl', () => {
    it('should generate multiple presigned URLs', async () => {
      const mockUrl = 'https://test-bucket.s3.test-region.amazonaws.com/test-key';
      s3Mock.getSignedUrlPromise.mockResolvedValue(mockUrl);

      const dto: GenerateMultiPresignedUrlDto = {
        files: [
          { folder: 'test-folder-1', extension: 'jpg', contentType: 'image/jpeg' },
          { folder: 'test-folder-2', extension: 'png', contentType: 'image/png' }
        ]
      };

      const result = await service.generateMultiPresignedUrl(dto);

      expect(s3Mock.getSignedUrlPromise).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        message: ERROR_MESSAGES.common.CREATED,
        data: {
          files: [
            {
              uploadUrl: mockUrl,
              endpoint: expect.stringMatching(/^https:\/\/test-endpoint\.com\/test-folder-1\/.*\.jpg$/)
            },
            {
              uploadUrl: mockUrl,
              endpoint: expect.stringMatching(/^https:\/\/test-endpoint\.com\/test-folder-2\/.*\.png$/)
            }
          ]
        }
      });
    });
  });
});

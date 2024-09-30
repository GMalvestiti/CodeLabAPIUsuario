import { ConfigService } from '@nestjs/config';
import { grpcConfig } from './grpc.config';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

describe('grpcConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'GRPC_URL') {
        return 'localhost:5000';
      }
      return null;
    });
  });

  it('should return the correct grpcConfig', () => {
    const packageName = 'testPackage';
    const urlEnv = 'GRPC_URL';
    const result = grpcConfig(packageName, urlEnv, configService);

    expect(result).toEqual({
      transport: Transport.GRPC,
      options: {
        package: packageName,
        protoPath: join(__dirname, `protos/${packageName}.proto`),
        url: 'localhost:5000',
      },
    });
  });
});

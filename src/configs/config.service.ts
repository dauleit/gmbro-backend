import * as dotenv from 'dotenv';

export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor() {
    const result = dotenv.config();
    this.envConfig = result.error ? process.env : result.parsed;
  }

  /**
   * Gets environment variable by its name
   *
   * @param key String
   * @returns Number | String
   */
  get(key: string): any {
    return this.envConfig[key];
  }

  /**
   * Gets MONGO Configuration
   * @returns MongoConfig
   */
  public getMongoConfig() {
    return {
      uri: this.get('MONGO_URI')
    };
  }
}

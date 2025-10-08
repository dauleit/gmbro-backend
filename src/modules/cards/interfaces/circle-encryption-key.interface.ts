export interface ICircleEncryptionKey {
  data: {
    keyId: string;
    publicKey: string;
    version: string;
  };
}

export interface ICircleEncryptionKeyResponse {
  keyId: string;
  publicKey: string;
  version: string;
}

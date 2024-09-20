export interface IKongJWTCredential {
  id: string;
  key: string;
}

export interface IKongJWTConsumer {
  data: IKongJWTCredential[];
}

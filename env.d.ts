export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_DB: string;
      MONGODB_URI: string;

      RABBITMQ_DEFAULT_PASS: string;
      RABBITMQ_DEFAULT_USER: string;
      RABBITMQ_PRIVATE_URL: string;

      TIMEOUT: string;
    }
  }
}

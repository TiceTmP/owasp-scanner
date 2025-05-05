export interface SwaggerDocument {
  swagger?: string;
  openapi?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  host?: string;
  basePath?: string;
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: {
    [path: string]: {
      [method: string]: {
        summary?: string;
        description?: string;
        operationId?: string;
        parameters?: Array<{
          name: string;
          in: string;
          description?: string;
          required?: boolean;
          schema?: any;
          type?: string;
        }>;
        responses?: {
          [statusCode: string]: {
            description: string;
            content?: any;
            schema?: any;
          };
        };
      };
    };
  };
  components?: {
    schemas?: {
      [name: string]: any;
    };
    securitySchemes?: {
      [name: string]: any;
    };
  };
  definitions?: {
    [name: string]: any;
  };
  securityDefinitions?: {
    [name: string]: any;
  };
}

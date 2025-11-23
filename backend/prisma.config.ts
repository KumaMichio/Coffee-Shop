// prisma.config.ts (ở thư mục backend)
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  // đường dẫn tới schema
  schema: 'prisma/schema.prisma',

  // dùng biến môi trường DATABASE_URL trong .env
  datasource: {
    url: env<Env>('DATABASE_URL'),
  },
});

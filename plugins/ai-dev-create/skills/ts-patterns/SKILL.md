---
name: ts-patterns
description: TypeScript/JavaScript 开发模式，包含 React、Node.js 最佳实践。当编辑 .ts/.tsx/.js/.jsx 文件时激活。
version: 1.0.0
---

# TypeScript/JavaScript Patterns

TypeScript 和 JavaScript 开发的最佳实践和模式指南。

## 激活时机

- 编辑 .ts/.tsx/.js/.jsx 文件
- 创建 React 组件
- 编写 Node.js 服务
- 配置 TypeScript 项目

## 目录结构

### React 项目

```
src/
├── components/          # 可复用组件
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── ...
├── hooks/               # 自定义 Hooks
├── services/            # API 服务
├── utils/               # 工具函数
├── types/               # 类型定义
└── App.tsx
```

### Node.js 项目

```
src/
├── controllers/         # 路由处理器
├── services/            # 业务逻辑
├── repositories/        # 数据访问
├── models/              # 数据模型
├── middlewares/         # 中间件
├── utils/               # 工具函数
└── types/               # 类型定义
```

## React 模式

### 组件结构

```typescript
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### 自定义 Hook

```typescript
// useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return [storedValue, setValue];
}
```

### 数据获取

```typescript
// useQuery.ts
export function useQuery<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}
```

## Node.js 模式

### 服务层

```typescript
// services/user.service.ts
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly logger: Logger
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    this.logger.info('Creating user', { email: data.email });

    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('User already exists');
    }

    const user = await this.repository.create({
      ...data,
      password: await hashPassword(data.password)
    });

    this.logger.info('User created', { id: user.id });
    return user;
  }
}
```

### Repository 模式

```typescript
// repositories/user.repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
```

### API 响应格式

```typescript
// types/api.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// 使用
app.get('/api/users', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const [users, total] = await Promise.all([
    userService.findAll({ page, limit }),
    userService.count()
  ]);

  const response: ApiResponse<User[]> = {
    success: true,
    data: users,
    meta: { page, limit, total }
  };

  res.json(response);
});
```

## TypeScript 配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 错误处理

### Result 模式

```typescript
// utils/result.ts
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export async function tryCatch<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// 使用
const result = await tryCatch(fetchUser(id));
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## 测试模式

### Jest/Vitest 配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80
      }
    }
  }
});
```

### 组件测试

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## 性能优化

### React 优化

```typescript
// 使用 memo 避免不必要的重渲染
export const ExpensiveComponent = memo(function ExpensiveComponent({
  data
}: Props) {
  // ...
});

// 使用 useMemo 缓存计算结果
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// 使用 useCallback 缓存回调
const handleSubmit = useCallback((data: FormData) => {
  submitForm(data);
}, [submitForm]);
```

### 代码分割

```typescript
// 动态导入
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```
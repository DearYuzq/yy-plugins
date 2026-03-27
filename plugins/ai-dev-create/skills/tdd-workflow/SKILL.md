---
name: tdd-workflow
description: TDD（测试驱动开发）工作流。当需要快速迭代开发或修复 bug 时激活。
version: 1.0.0
---

# TDD Workflow - 测试驱动开发

TDD (Test-Driven Development) 是一种先写测试后写代码的开发方法论，确保代码质量和测试覆盖率。

## 激活时机

- 快速迭代开发
- Bug 修复
- 重构代码
- 添加新功能（需求明确时）

## 核心循环

```
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────┐                            │
│     │ RED │  编写失败的测试              │
│     └──┬──┘                            │
│        │                               │
│        ▼                               │
│     ┌─────┐                            │
│     │GREEN│  编写最小实现                │
│     └──┬──┘                            │
│        │                               │
│        ▼                               │
│     ┌────────┐                         │
│     │REFACTOR│  优化代码结构            │
│     └───┬────┘                         │
│         │                              │
│         └──────────▶ 重复               │
│                                         │
└─────────────────────────────────────────┘
```

## RED 阶段 - 编写失败测试

### 目标
- 定义期望行为
- 测试应该失败（功能未实现）

### 示例

```typescript
// TypeScript
describe('UserService', () => {
  it('should create user with valid email', async () => {
    const service = new UserService();
    const user = await service.create({
      name: 'Test User',
      email: 'test@example.com'
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});

// 运行测试
// ❌ UserService is not defined
```

```python
# Python
def test_create_user():
    service = UserService()
    user = service.create("test@example.com", "Test User")

    assert user.id is not None
    assert user.email == "test@example.com"

# 运行测试
# ❌ NameError: name 'UserService' is not defined
```

## GREEN 阶段 - 最小实现

### 目标
- 编写最小代码使测试通过
- 不过度设计

### 示例

```typescript
// TypeScript - 最小实现
class UserService {
  private users: Map<string, User> = new Map();
  private counter = 0;

  async create(data: { name: string; email: string }): Promise<User> {
    const user = {
      id: `user-${++this.counter}`,
      name: data.name,
      email: data.email
    };
    this.users.set(user.id, user);
    return user;
  }
}

// 运行测试
// ✅ 1 passed
```

```python
# Python - 最小实现
class UserService:
    def __init__(self):
        self._users = {}
        self._counter = 0

    def create(self, email: str, name: str) -> User:
        self._counter += 1
        user = User(id=f"user-{self._counter}", email=email, name=name)
        self._users[user.id] = user
        return user

# 运行测试
# ✅ 1 passed
```

## REFACTOR 阶段 - 优化代码

### 目标
- 改善代码结构
- 保持测试通过

### 重构检查清单

- [ ] 消除重复代码
- [ ] 改善命名
- [ ] 简化逻辑
- [ ] 提取函数
- [ ] 运行测试（确认通过）

### 示例

```typescript
// 重构前
class UserService {
  async create(data: { name: string; email: string }): Promise<User> {
    if (!data.email.includes('@')) {
      throw new Error('Invalid email');
    }
    const user = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email
    };
    return user;
  }
}

// 重构后
class UserService {
  constructor(
    private readonly idGenerator: IdGenerator,
    private readonly validator: Validator
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    this.validator.validateEmail(data.email);

    return User.create({
      id: this.idGenerator.generate(),
      name: data.name,
      email: data.email
    });
  }
}
```

## 测试层次

### 单元测试

```typescript
// 测试单个函数
describe('formatCurrency', () => {
  it('should format USD', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-50, 'USD')).toBe('-$50.00');
  });
});
```

### 集成测试

```typescript
// 测试模块交互
describe('UserService with Repository', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    service = new UserService(repository);
  });

  it('should persist user to repository', async () => {
    const user = await service.create({ name: 'Test', email: 'test@example.com' });

    const found = await repository.findById(user.id);
    expect(found).toEqual(user);
  });
});
```

### E2E 测试

```typescript
// 测试完整流程
test('user registration flow', async ({ page }) => {
  await page.goto('/register');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## 覆盖率要求

| 类型 | 最低要求 |
|------|---------|
| 行覆盖率 | 80% |
| 分支覆盖率 | 80% |
| 函数覆盖率 | 80% |

## 测试反模式

❌ **避免**：

```typescript
// 测试实现细节
it('should set internal state', () => {
  component.setState({ count: 5 });
  expect(component.state.count).toBe(5);
});

// 测试之间有依赖
let user;
it('creates user', () => { user = createUser(); });
it('updates user', () => { updateUser(user); }); // 依赖上一个测试
```

✅ **推荐**：

```typescript
// 测试行为
it('should display count', () => {
  render(<Counter initialCount={5} />);
  expect(screen.getByText('5')).toBeInTheDocument();
});

// 独立测试
it('creates user', () => {
  const user = createTestUser();
  expect(user.id).toBeDefined();
});

it('updates user', () => {
  const user = createTestUser(); // 独立设置
  updateUser(user, { name: 'New Name' });
  expect(user.name).toBe('New Name');
});
```

## 技术栈配置

### TypeScript (Jest/Vitest)

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80
      }
    }
  }
});
```

### Python (pytest)

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
addopts = --cov=src --cov-fail-under=80
```

### Java (JUnit/Maven)

```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <configuration>
    <rules>
      <rule>
        <element>BUNDLE</element>
        <limits>
          <limit><counter>LINE</counter><value>COVEREDRATIO</value><minimum>0.80</minimum></limit>
        </limits>
      </rule>
    </rules>
  </configuration>
</plugin>
```
---
name: python-patterns
description: Python 开发模式，包含 FastAPI、Django 最佳实践。当编辑 .py 文件时激活。
version: 1.0.0
---

# Python Patterns

Python 开发的最佳实践和模式指南。

## 激活时机

- 编辑 .py 文件
- 创建 Python 模块
- 编写 FastAPI/Django 应用
- 数据处理脚本

## 目录结构

### FastAPI 项目

```
src/
├── api/
│   ├── routes/          # API 路由
│   ├── dependencies.py  # 依赖注入
│   └── middleware.py    # 中间件
├── services/            # 业务逻辑
├── repositories/        # 数据访问
├── models/              # Pydantic 模型
├── entities/            # 数据库实体
├── utils/               # 工具函数
└── main.py
```

### Django 项目

```
src/
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   └── ...
├── core/                # 共享配置
├── utils/               # 工具函数
└── manage.py
```

## FastAPI 模式

### 路由定义

```python
# api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserOut])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    service: UserService = Depends(get_user_service)
):
    """获取用户列表"""
    return await service.list(skip=skip, limit=limit)

@router.post("/", response_model=UserOut, status_code=201)
async def create_user(
    user_in: UserCreate,
    service: UserService = Depends(get_user_service)
):
    """创建用户"""
    try:
        return await service.create(user_in)
    except DuplicateError as e:
        raise HTTPException(status_code=409, detail=str(e))
```

### 依赖注入

```python
# api/dependencies.py
from functools import lru_cache
from fastapi import Depends

@lru_cache
def get_settings() -> Settings:
    return Settings()

def get_db(settings: Settings = Depends(get_settings)):
    """获取数据库会话"""
    db = Database(settings.database_url)
    try:
        yield db
    finally:
        db.close()

def get_user_service(
    db: Database = Depends(get_db)
) -> UserService:
    """获取用户服务"""
    return UserService(UserRepository(db))
```

### Pydantic 模型

```python
# models/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)

class UserOut(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## 服务层模式

### Repository 模式

```python
# repositories/user_repository.py
from abc import ABC, abstractmethod
from typing import Optional, List

class UserRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: str) -> Optional[User]:
        pass

    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def create(self, data: UserCreate) -> User:
        pass

class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_by_id(self, id: str) -> Optional[User]:
        result = await self._session.execute(
            select(UserModel).where(UserModel.id == id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        user = UserModel(**data.model_dump())
        self._session.add(user)
        await self._session.commit()
        return User.from_orm(user)
```

### 服务实现

```python
# services/user_service.py
from typing import List, Optional

class UserService:
    def __init__(self, repository: UserRepository):
        self._repository = repository

    async def get(self, id: str) -> Optional[User]:
        return await self._repository.find_by_id(id)

    async def create(self, data: UserCreate) -> User:
        # 验证邮箱唯一性
        existing = await self._repository.find_by_email(data.email)
        if existing:
            raise DuplicateError("Email already registered")

        # 哈希密码
        hashed = hash_password(data.password)

        # 创建用户
        return await self._repository.create(
            UserCreate(**data.model_dump(), password=hashed)
        )

    async def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        return await self._repository.list(skip=skip, limit=limit)
```

## 错误处理

### 自定义异常

```python
# utils/exceptions.py
class AppError(Exception):
    """应用基础异常"""
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code
        super().__init__(message)

class NotFoundError(AppError):
    def __init__(self, resource: str, id: str):
        super().__init__(f"{resource} not found: {id}", "NOT_FOUND")

class DuplicateError(AppError):
    def __init__(self, message: str):
        super().__init__(message, "DUPLICATE")

class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")
```

### 异常处理器

```python
# api/exception_handlers.py
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )
```

## 测试模式

### pytest 配置

```python
# conftest.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def user_data():
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }
```

### 单元测试

```python
# tests/test_user_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from services.user_service import UserService

@pytest.mark.asyncio
async def test_create_user():
    # Arrange
    repository = MagicMock()
    repository.find_by_email = AsyncMock(return_value=None)
    repository.create = AsyncMock(return_value=User(
        id="1",
        email="test@example.com",
        name="Test User"
    ))

    service = UserService(repository)

    # Act
    user = await service.create(UserCreate(
        email="test@example.com",
        name="Test User",
        password="password123"
    ))

    # Assert
    assert user.id == "1"
    assert user.email == "test@example.com"
    repository.find_by_email.assert_called_once()
    repository.create.assert_called_once()
```

### API 测试

```python
# tests/api/test_users.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, user_data: dict):
    response = await client.post("/users", json=user_data)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data

@pytest.mark.asyncio
async def test_list_users(client: AsyncClient):
    response = await client.get("/users")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

## 异步模式

### 异步上下文管理器

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_transaction(session: AsyncSession):
    """事务上下文管理器"""
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
```

### 并发执行

```python
import asyncio

async def fetch_all(users: list[str]) -> list[User]:
    """并发获取多个用户"""
    tasks = [fetch_user(id) for id in users]
    return await asyncio.gather(*tasks)
```

## 类型注解

### 常用类型

```python
from typing import Optional, List, Dict, Any, Union, TypeVar, Generic

# Optional
def get_user(id: str) -> Optional[User]:
    ...

# List
def list_users() -> List[User]:
    ...

# Dict
def get_config() -> Dict[str, Any]:
    ...

# Union
def process(data: Union[str, int]) -> str:
    ...

# 泛型
T = TypeVar('T')

class Repository(Generic[T]):
    def find_by_id(self, id: str) -> Optional[T]:
        ...
```

## 性能优化

### 缓存

```python
from functools import lru_cache
from typing import Optional

@lru_cache(maxsize=128)
def get_config(key: str) -> Optional[str]:
    """带缓存的配置获取"""
    return load_config().get(key)
```

### 数据库查询优化

```python
# 使用 selectinload 预加载关系
from sqlalchemy.orm import selectinload

async def get_user_with_posts(id: str) -> Optional[User]:
    result = await session.execute(
        select(UserModel)
        .options(selectinload(UserModel.posts))
        .where(UserModel.id == id)
    )
    return result.scalar_one_or_none()
```
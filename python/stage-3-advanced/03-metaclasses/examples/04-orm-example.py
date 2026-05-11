"""
迷你 ORM — 元类实战：声明式模型定义
"""

import logging

logging.basicConfig(level=logging.DEBUG, format='[%(name)s] %(message)s')
logger = logging.getLogger("MiniORM")


class Field:
    """数据库字段描述器"""

    def __init__(self, column_type: str, nullable: bool = True) -> None:
        self.column_type = column_type
        self.nullable = nullable
        self.name = ""

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value):
        if value is None and not self.nullable:
            raise ValueError(f"字段 '{self.name}' 不允许为 NULL")
        obj.__dict__[self.name] = value

    def __repr__(self):
        return f"Field({self.column_type!r})"


class IntegerField(Field):
    def __init__(self, **kwargs):
        super().__init__('INTEGER', **kwargs)

class StringField(Field):
    def __init__(self, max_length: int = 255, **kwargs):
        super().__init__(f'VARCHAR({max_length})', **kwargs)

class TextField(Field):
    def __init__(self, **kwargs):
        super().__init__('TEXT', **kwargs)


class ModelMeta(type):
    """ORM 元类 — 自动收集字段定义"""

    def __new__(mcs, name, bases, namespace):
        fields = {}
        for key, value in list(namespace.items()):
            if isinstance(value, Field):
                fields[key] = value

        namespace['_fields'] = fields
        namespace['_table'] = namespace.get('_table', name.lower())

        cls = super().__new__(mcs, name, bases, namespace)
        if fields:
            logger.debug("[ORM] 模型 %s: 表=%s, 字段=%s",
                         name, cls._table, list(fields.keys()))
        return cls


class Model(metaclass=ModelMeta):
    """ORM 基类"""

    def __init__(self, **kwargs):
        for name in self._fields:
            value = kwargs.get(name)
            setattr(self, name, value)

    def __repr__(self):
        attrs = ', '.join(f'{n}={getattr(self, n)!r}' for n in self._fields)
        return f"{type(self).__name__}({attrs})"

    @classmethod
    def create_table_sql(cls) -> str:
        """生成 CREATE TABLE SQL"""
        columns = []
        for name, field in cls._fields.items():
            nullable = "" if field.nullable else " NOT NULL"
            columns.append(f"  {name} {field.column_type}{nullable}")
        cols = ',\n'.join(columns)
        return f"CREATE TABLE {cls._table} (\n{cols}\n);"

    def insert_sql(self) -> str:
        """生成 INSERT SQL"""
        cols, vals = [], []
        for name in self._fields:
            value = getattr(self, name)
            if value is not None:
                cols.append(name)
                vals.append(repr(value))
        return f"INSERT INTO {self._table} ({', '.join(cols)}) VALUES ({', '.join(vals)});"


class User(Model):
    _table = 'users'
    name = StringField(max_length=100, nullable=False)
    email = StringField(max_length=200)
    age = IntegerField()


class Post(Model):
    _table = 'posts'
    title = StringField(max_length=200, nullable=False)
    content = TextField()
    author_id = IntegerField(nullable=False)


def main() -> None:
    print("=" * 60)
    print("迷你 ORM 演示")
    print("=" * 60)

    # CREATE TABLE
    print("\n--- CREATE TABLE ---")
    print(User.create_table_sql())
    print()
    print(Post.create_table_sql())

    # INSERT
    print("\n--- INSERT ---")
    user = User(name="Alice", email="alice@example.com", age=30)
    print(user)
    print(user.insert_sql())

    post = Post(title="Hello World", content="First post!", author_id=1)
    print(post)
    print(post.insert_sql())


if __name__ == '__main__':
    main()

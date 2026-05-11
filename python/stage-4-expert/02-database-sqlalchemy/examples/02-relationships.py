"""
SQLModel 鍏崇郴鏄犲皠绀轰緥
======================
婕旂ず涓€瀵瑰銆佸瀵瑰鍏崇郴瀹氫箟涓庢煡璇?杩愯: python 02-relationships.py
"""

import logging
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Session, create_engine, select

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


# --- 澶氬澶氬叧鑱旇〃 ---

class PostTagLink(SQLModel, table=True):
    """甯栧瓙-鏍囩鍏宠仈琛?""
    __tablename__ = "post_tags"
    post_id: int = Field(foreign_key="post.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


# --- 妯″瀷瀹氫箟 ---

class User(SQLModel, table=True):
    """鐢ㄦ埛妯″瀷"""
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=50)
    email: str = Field(max_length=100, unique=True)
    # 涓€瀵瑰锛氫竴涓敤鎴锋湁澶氱瘒甯栧瓙
    posts: list["Post"] = Relationship(back_populates="author")

    def __repr__(self) -> str:
        return f"User(id={self.id}, name={self.name!r})"


class Post(SQLModel, table=True):
    """甯栧瓙妯″瀷"""
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    content: str = ""
    published: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    # 澶氬涓€锛氭瘡绡囧笘瀛愬睘浜庝竴涓敤鎴?    author_id: int = Field(foreign_key="user.id")
    author: User | None = Relationship(back_populates="posts")
    # 澶氬澶氾細甯栧瓙鍜屾爣绛?    tags: list["Tag"] = Relationship(back_populates="posts", link_model=PostTagLink)

    def __repr__(self) -> str:
        return f"Post(id={self.id}, title={self.title!r})"


class Tag(SQLModel, table=True):
    """鏍囩妯″瀷"""
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)
    posts: list[Post] = Relationship(back_populates="tags", link_model=PostTagLink)

    def __repr__(self) -> str:
        return f"Tag(id={self.id}, name={self.name!r})"


# --- 鏁版嵁搴撴搷浣?---

engine = create_engine("sqlite:///./relationships_demo.db", echo=False)


def setup():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # 鍒涘缓鐢ㄦ埛
        alice = User(name="Alice", email="alice@example.com")
        bob = User(name="Bob", email="bob@example.com")
        session.add_all([alice, bob])
        session.commit()
        session.refresh(alice)
        session.refresh(bob)

        # 鍒涘缓鏍囩
        python_tag = Tag(name="Python")
        web_tag = Tag(name="Web")
        db_tag = Tag(name="Database")
        session.add_all([python_tag, web_tag, db_tag])
        session.commit()

        # 鍒涘缓甯栧瓙骞跺叧鑱?        post1 = Post(title="FastAPI 鍏ラ棬", content="...", author_id=alice.id, published=True)
        post1.tags = [python_tag, web_tag]

        post2 = Post(title="SQLAlchemy 鎸囧崡", content="...", author_id=alice.id, published=True)
        post2.tags = [python_tag, db_tag]

        post3 = Post(title="Docker 瀹炴垬", content="...", author_id=bob.id, published=False)
        post3.tags = [web_tag]

        session.add_all([post1, post2, post3])
        session.commit()
        logger.info("[Setup] 娴嬭瘯鏁版嵁鍒涘缓瀹屾垚")


def demo_queries():
    with Session(engine) as session:
        # 鏌ヨ鐢ㄦ埛鍙婂叾甯栧瓙锛堜竴瀵瑰锛?        print("\n=== 涓€瀵瑰锛氱敤鎴?-> 甯栧瓙 ===")
        users = session.exec(select(User)).all()
        for user in users:
            print(f"\n{user.name} 鐨勫笘瀛?")
            for post in user.posts:
                print(f"  - {post.title} (published={post.published})")

        # 鏌ヨ甯栧瓙鍙婂叾鏍囩锛堝瀵瑰锛?        print("\n=== 澶氬澶氾細甯栧瓙 <-> 鏍囩 ===")
        posts = session.exec(select(Post)).all()
        for post in posts:
            tag_names = [t.name for t in post.tags]
            print(f"  {post.title}: tags={tag_names}")

        # 鏌ヨ鐗瑰畾鏍囩涓嬬殑鎵€鏈夊笘瀛?        print("\n=== 鍙嶅悜鏌ヨ锛氭爣绛?-> 甯栧瓙 ===")
        python_tag = session.exec(select(Tag).where(Tag.name == "Python")).first()
        if python_tag:
            print(f"  鏍囩 '{python_tag.name}' 涓嬬殑甯栧瓙:")
            for post in python_tag.posts:
                print(f"    - {post.title} by {post.author.name}")

        # 澶嶆潅鏌ヨ锛氬凡鍙戝竷鐨?Python 鐩稿叧甯栧瓙
        print("\n=== 澶嶆潅鏌ヨ ===")
        stmt = (
            select(Post)
            .join(PostTagLink)
            .join(Tag)
            .where(Tag.name == "Python", Post.published == True)
        )
        results = session.exec(stmt).all()
        print(f"  宸插彂甯冪殑 Python 甯栧瓙: {[p.title for p in results]}")


if __name__ == "__main__":
    setup()
    demo_queries()
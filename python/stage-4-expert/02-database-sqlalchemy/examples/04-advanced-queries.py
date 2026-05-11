"""
SQLAlchemy 楂樼骇鏌ヨ绀轰緥
========================
婕旂ず鑱氬悎銆佸瓙鏌ヨ銆佺獥鍙ｅ嚱鏁般€丆TE
杩愯: python 04-advanced-queries.py
"""

import logging
from datetime import datetime, timedelta
from sqlmodel import SQLModel, Field, Session, create_engine, select
from sqlalchemy import func, case, and_, or_, text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Product(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    category: str = Field(max_length=50)
    price: float
    stock: int = 0
    created_at: datetime = Field(default_factory=datetime.now)


class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    total_price: float
    created_at: datetime = Field(default_factory=datetime.now)


engine = create_engine("sqlite:///./advanced_demo.db", echo=False)


def setup():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        products = [
            Product(name="Python Book", category="Books", price=49.99, stock=100),
            Product(name="JavaScript Book", category="Books", price=39.99, stock=50),
            Product(name="Laptop", category="Electronics", price=999.99, stock=20),
            Product(name="Keyboard", category="Electronics", price=79.99, stock=200),
            Product(name="Mouse", category="Electronics", price=29.99, stock=300),
        ]
        session.add_all(products)
        session.commit()

        for p in products:
            session.refresh(p)

        orders = [
            Order(product_id=1, quantity=3, total_price=149.97),
            Order(product_id=1, quantity=2, total_price=99.98),
            Order(product_id=3, quantity=1, total_price=999.99),
            Order(product_id=4, quantity=5, total_price=399.95),
            Order(product_id=5, quantity=10, total_price=299.90),
        ]
        session.add_all(orders)
        session.commit()
        logger.info("[Setup] 娴嬭瘯鏁版嵁鍒涘缓瀹屾垚")


def demo_aggregations():
    """鑱氬悎鏌ヨ"""
    print("\n=== 鑱氬悎鏌ヨ ===")
    with Session(engine) as session:
        # 鎸夊垎绫荤粺璁?        stmt = (
            select(
                Product.category,
                func.count(Product.id).label("count"),
                func.avg(Product.price).label("avg_price"),
                func.sum(Product.stock).label("total_stock"),
            )
            .group_by(Product.category)
        )
        results = session.exec(stmt).all()
        for row in results:
            print(f"  {row.category}: count={row.count}, avg={row.avg_price:.2f}, stock={row.total_stock}")

        # HAVING 杩囨护
        stmt = (
            select(Product.category, func.count(Product.id).label("cnt"))
            .group_by(Product.category)
            .having(func.count(Product.id) > 2)
        )
        results = session.exec(stmt).all()
        print(f"\n  瓒呰繃 2 涓骇鍝佺殑鍒嗙被: {[r.category for r in results]}")


def demo_conditional():
    """鏉′欢琛ㄨ揪寮?""
    print("\n=== 鏉′欢琛ㄨ揪寮?===")
    with Session(engine) as session:
        # CASE WHEN
        price_tier = case(
            (Product.price > 500, "楂樼"),
            (Product.price > 50, "涓"),
            else_="鍏ラ棬",
        ).label("tier")

        stmt = select(Product.name, Product.price, price_tier)
        results = session.exec(stmt).all()
        for row in results:
            print(f"  {row.name}: {row.price} -> {row.tier}")


def demo_subquery():
    """瀛愭煡璇?""
    print("\n=== 瀛愭煡璇?===")
    with Session(engine) as session:
        # 璁㈠崟鎬婚瓒呰繃骞冲潎鍊肩殑璁㈠崟
        avg_subquery = select(func.avg(Order.total_price)).scalar_subquery()
        stmt = select(Order).where(Order.total_price > avg_subquery)
        results = session.exec(stmt).all()
        print(f"  楂樹簬骞冲潎鎬婚鐨勮鍗? {[(o.id, o.total_price) for o in results]}")


def demo_raw_sql():
    """Raw SQL"""
    print("\n=== Raw SQL ===")
    with Session(engine) as session:
        stmt = text("""
            SELECT p.name, SUM(o.quantity) as total_sold
            FROM product p
            JOIN "order" o ON p.id = o.product_id
            GROUP BY p.name
            ORDER BY total_sold DESC
        """)
        results = session.exec(stmt).all()
        for name, total in results:
            print(f"  {name}: 鍏卞敭鍑?{total} 浠?)


if __name__ == "__main__":
    setup()
    demo_aggregations()
    demo_conditional()
    demo_subquery()
    demo_raw_sql()
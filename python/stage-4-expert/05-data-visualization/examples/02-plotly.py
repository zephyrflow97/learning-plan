"""
Plotly 浜や簰寮忓浘琛ㄧず渚?"""
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np


def demo_plotly_express():
    """Plotly Express 蹇€熺粯鍥?""
    print("=== Plotly Express ===")

    # 鍐呯疆鏁版嵁闆?鈥?GDP vs 瀵垮懡
    df = px.data.gapminder()
    fig = px.scatter(
        df.query("year == 2007"),
        x="gdpPercap", y="lifeExp",
        size="pop", color="continent",
        hover_name="country",
        log_x=True,
        size_max=60,
        title="2007 骞村悇鍥?GDP vs 棰勬湡瀵垮懡",
    )
    fig.write_html("plotly_scatter.html")
    print("宸蹭繚瀛? plotly_scatter.html")

    # 鎶樼嚎鍥?    df_china = df[df["country"] == "China"]
    fig = px.line(df_china, x="year", y="gdpPercap", title="涓浗浜哄潎 GDP 鍙樺寲")
    fig.write_html("plotly_line.html")
    print("宸蹭繚瀛? plotly_line.html")

    # 鏌辩姸鍥?    df_2007 = df.query("year == 2007").nlargest(10, "pop")
    fig = px.bar(df_2007, x="country", y="pop", color="continent",
                 title="2007 骞翠汉鍙ｆ渶澶氱殑 10 涓浗瀹?)
    fig.write_html("plotly_bar.html")
    print("宸蹭繚瀛? plotly_bar.html")


def demo_graph_objects():
    """Graph Objects 瀹屽叏鎺у埗"""
    print("\n=== Graph Objects ===")

    # 缁勫悎鍥捐〃
    fig = make_subplots(rows=1, cols=2, subplot_titles=("瓒嬪娍", "鍒嗗竷"))

    x = np.linspace(0, 10, 50)
    fig.add_trace(go.Scatter(x=x, y=np.sin(x), mode="lines+markers", name="sin"), row=1, col=1)
    fig.add_trace(go.Scatter(x=x, y=np.cos(x), mode="lines", name="cos"), row=1, col=1)

    data = np.random.randn(500)
    fig.add_trace(go.Histogram(x=data, nbinsx=30, name="鍒嗗竷"), row=1, col=2)

    fig.update_layout(title="缁勫悎鍥捐〃", height=400)
    fig.write_html("plotly_combined.html")
    print("宸蹭繚瀛? plotly_combined.html")


if __name__ == "__main__":
    demo_plotly_express()
    demo_graph_objects()

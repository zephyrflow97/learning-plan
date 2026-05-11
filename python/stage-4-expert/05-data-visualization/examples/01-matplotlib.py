"""
Matplotlib 绀轰緥
"""
import matplotlib.pyplot as plt
import numpy as np

def demo_basic_plots():
    """鍩虹鍥捐〃"""
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))

    # 鎶樼嚎鍥?    x = np.linspace(0, 2 * np.pi, 100)
    axes[0, 0].plot(x, np.sin(x), "b-", label="sin(x)", linewidth=2)
    axes[0, 0].plot(x, np.cos(x), "r--", label="cos(x)", linewidth=2)
    axes[0, 0].set_title("鎶樼嚎鍥?)
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)

    # 鏌辩姸鍥?    langs = ["Python", "JavaScript", "Go", "Rust", "Java"]
    scores = [92, 78, 65, 58, 80]
    colors = ["#3776AB", "#F7DF1E", "#00ADD8", "#CE422B", "#ED8B00"]
    axes[0, 1].bar(langs, scores, color=colors, edgecolor="white")
    axes[0, 1].set_title("缂栫▼璇█婊℃剰搴?)
    axes[0, 1].set_ylabel("婊℃剰搴?%")

    # 鏁ｇ偣鍥?    np.random.seed(42)
    n = 200
    x = np.random.randn(n)
    y = 2 * x + np.random.randn(n) * 0.8
    sc = axes[1, 0].scatter(x, y, c=y, cmap="RdYlGn", alpha=0.6, edgecolors="grey", s=50)
    axes[1, 0].set_title("鏁ｇ偣鍥撅紙棰滆壊鏄犲皠锛?)
    plt.colorbar(sc, ax=axes[1, 0])

    # 鐩存柟鍥?    data = np.random.randn(2000)
    axes[1, 1].hist(data, bins=40, color="#4C72B0", edgecolor="white", alpha=0.8)
    axes[1, 1].axvline(data.mean(), color="red", linestyle="--", label=f"Mean={data.mean():.2f}")
    axes[1, 1].set_title("鐩存柟鍥?)
    axes[1, 1].legend()

    fig.suptitle("Matplotlib 鍩虹鍥捐〃", fontsize=14, fontweight="bold")
    fig.tight_layout()
    plt.savefig("matplotlib_basics.png", dpi=150, bbox_inches="tight")
    print("鍥捐〃宸蹭繚瀛? matplotlib_basics.png")
    plt.show()


def demo_subplots():
    """瀛愬浘甯冨眬"""
    fig = plt.figure(figsize=(12, 6))

    # 涓嶈鍒欏竷灞€
    ax1 = fig.add_subplot(121)
    ax2 = fig.add_subplot(222)
    ax3 = fig.add_subplot(224)

    x = np.linspace(0, 10, 100)
    ax1.plot(x, np.sin(x) * np.exp(-0.1 * x))
    ax1.set_title("琛板噺姝ｅ鸡娉?)

    ax2.bar(range(5), np.random.randint(1, 10, 5))
    ax2.set_title("闅忔満鏌辩姸鍥?)

    ax3.pie([30, 25, 20, 15, 10], labels=["A", "B", "C", "D", "E"], autopct="%1.1f%%")
    ax3.set_title("楗煎浘")

    fig.tight_layout()
    plt.savefig("subplots_demo.png", dpi=150)
    print("鍥捐〃宸蹭繚瀛? subplots_demo.png")
    plt.show()


if __name__ == "__main__":
    demo_basic_plots()
    demo_subplots()

"""
Seaborn 缁熻鍥捐〃绀轰緥
"""
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


def demo_distribution():
    """鍒嗗竷鍥?""
    print("=== 鍒嗗竷鍥?===")
    tips = sns.load_dataset("tips")

    fig, axes = plt.subplots(1, 3, figsize=(15, 4))

    sns.histplot(tips["total_bill"], kde=True, ax=axes[0], color="#4C72B0")
    axes[0].set_title("鐩存柟鍥?+ KDE")

    sns.boxplot(x="day", y="total_bill", data=tips, ax=axes[1], palette="Set2")
    axes[1].set_title("绠辩嚎鍥?)

    sns.violinplot(x="day", y="total_bill", data=tips, ax=axes[2], palette="muted")
    axes[2].set_title("灏忔彁鐞村浘")

    fig.tight_layout()
    plt.savefig("seaborn_distribution.png", dpi=150)
    print("宸蹭繚瀛? seaborn_distribution.png")
    plt.show()


def demo_relationship():
    """鍏崇郴鍥?""
    print("\n=== 鍏崇郴鍥?===")
    tips = sns.load_dataset("tips")

    g = sns.lmplot(x="total_bill", y="tip", hue="smoker", data=tips, height=5)
    g.fig.suptitle("璐﹀崟 vs 灏忚垂锛堟寜鍚哥儫鍒嗙粍锛?, y=1.02)
    plt.savefig("seaborn_lmplot.png", dpi=150, bbox_inches="tight")
    print("宸蹭繚瀛? seaborn_lmplot.png")
    plt.show()

    # Pair plot
    iris = sns.load_dataset("iris")
    g = sns.pairplot(iris, hue="species", diag_kind="kde")
    g.fig.suptitle("楦㈠熬鑺辨暟鎹泦 Pair Plot", y=1.02)
    plt.savefig("seaborn_pairplot.png", dpi=150, bbox_inches="tight")
    print("宸蹭繚瀛? seaborn_pairplot.png")
    plt.show()


def demo_heatmap():
    """鐑姏鍥?""
    print("\n=== 鐑姏鍥?===")
    np.random.seed(42)
    data = pd.DataFrame(
        np.random.randn(5, 5),
        columns=["Feat_A", "Feat_B", "Feat_C", "Feat_D", "Feat_E"],
        index=["鏍锋湰1", "鏍锋湰2", "鏍锋湰3", "鏍锋湰4", "鏍锋湰5"],
    )
    corr = data.corr()

    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0,
                square=True, linewidths=0.5, ax=ax)
    ax.set_title("鐩稿叧鎬х煩闃电儹鍔涘浘")
    plt.savefig("seaborn_heatmap.png", dpi=150, bbox_inches="tight")
    print("宸蹭繚瀛? seaborn_heatmap.png")
    plt.show()


if __name__ == "__main__":
    sns.set_theme(style="whitegrid")
    demo_distribution()
    demo_relationship()
    demo_heatmap()

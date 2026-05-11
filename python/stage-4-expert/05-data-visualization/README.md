# 绗?5 绔狅細鏁版嵁鍙鍖?鈥?璁╂暟鎹璇?
> *"The greatest value of a picture is when it forces us to notice what we never expected to see."*
> 鈥?John Tukey
>
> 鏁版嵁鍙鍖栦笉鏄?璁╁浘琛ㄥソ鐪?鈥斺€旇€屾槸**璁╂暟鎹腑闅愯棌鐨勬ā寮忓彉寰楁樉鑰屾槗瑙?*銆?
---

## 馃摉 鏈珷鍐呭

- [1. Matplotlib 鍩虹](#1-matplotlib-鍩虹)
- [2. Plotly 浜や簰寮忓浘琛╙(#2-plotly-浜や簰寮忓浘琛?
- [3. Seaborn 缁熻鍥捐〃](#3-seaborn-缁熻鍥捐〃)
- [4. 鍥捐〃閫夋嫨鎸囧崡](#4-鍥捐〃閫夋嫨鎸囧崡)
- [鏈€浣冲疄璺礭(#鏈€浣冲疄璺?
- [缁冧範棰榏(#缁冧範棰?
- [鍙傝€冭祫婧怾(#鍙傝€冭祫婧?

---

## 1. Matplotlib 鍩虹

> 馃寣 **The Big Picture: Python 鍙鍖栫敓鎬?*
>
> | 搴?| 瀹氫綅 | 浜や簰鎬?| 閫傜敤鍦烘櫙 |
> |---|------|--------|---------|
> | **Matplotlib** | 搴曞眰鍩虹搴?| 闈欐€?| 鍑虹増绾у浘琛ㄣ€佸畬鍏ㄦ帶鍒?|
> | **Seaborn** | Matplotlib 楂樺眰灏佽 | 闈欐€?| 缁熻鍥捐〃銆佺編瑙傞粯璁?|
> | **Plotly** | 浜や簰寮忓浘琛?| 鉁?浜や簰 | Web 浠〃鏉裤€佹帰绱㈡€у垎鏋?|
> | **Altair** | 澹版槑寮忚娉?| 鉁?浜や簰 | 蹇€熷師鍨?|
> | **Bokeh** | Web 浜や簰寮?| 鉁?浜や簰 | 澶ф暟鎹€佹祦寮?|

### Figure 鍜?Axes 瀵硅薄妯″瀷

> 鈿涳笍 **The Science: Matplotlib 鐨勪袱绉嶆帴鍙?*
>
> Matplotlib 鏈変袱绉嶄娇鐢ㄦ柟寮忥細
> - **pyplot 鎺ュ彛**锛坄plt.plot()`锛夛細MATLAB 椋庢牸锛屽揩閫熶絾涓嶇伒娲?> - **闈㈠悜瀵硅薄鎺ュ彛**锛坄fig, ax = plt.subplots()`锛夛細鎺ㄨ崘锛屽畬鍏ㄦ帶鍒?>
> 姒傚康妯″瀷锛?> ```
> Figure锛堢敾甯冿級
> 鈹溾攢鈹€ Axes锛堝瓙鍥?1锛?> 鈹?  鈹溾攢鈹€ Title
> 鈹?  鈹溾攢鈹€ X-Axis / Y-Axis
> 鈹?  鈹溾攢鈹€ Lines / Bars / Scatter
> 鈹?  鈹斺攢鈹€ Legend
> 鈹斺攢鈹€ Axes锛堝瓙鍥?2锛?>     鈹斺攢鈹€ ...
> ```

```python
import matplotlib.pyplot as plt
import numpy as np

# 鉁?鎺ㄨ崘锛氶潰鍚戝璞℃帴鍙?fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# 鎶樼嚎鍥?x = np.linspace(0, 10, 100)
axes[0, 0].plot(x, np.sin(x), label="sin(x)")
axes[0, 0].plot(x, np.cos(x), label="cos(x)")
axes[0, 0].set_title("鎶樼嚎鍥?)
axes[0, 0].legend()

# 鏌辩姸鍥?categories = ["Python", "JS", "Go", "Rust"]
values = [85, 75, 60, 50]
axes[0, 1].bar(categories, values, color=["#3776AB", "#F7DF1E", "#00ADD8", "#CE422B"])
axes[0, 1].set_title("璇█娴佽搴?)

# 鏁ｇ偣鍥?np.random.seed(42)
x = np.random.randn(100)
y = 2 * x + np.random.randn(100) * 0.5
axes[1, 0].scatter(x, y, alpha=0.6, c=y, cmap="viridis")
axes[1, 0].set_title("鏁ｇ偣鍥?)

# 鐩存柟鍥?data = np.random.randn(1000)
axes[1, 1].hist(data, bins=30, edgecolor="white", alpha=0.7)
axes[1, 1].set_title("鐩存柟鍥?)

fig.suptitle("Matplotlib 甯歌鍥捐〃", fontsize=14)
fig.tight_layout()
plt.savefig("matplotlib_demo.png", dpi=150)
plt.show()
```

---

## 2. Plotly 浜や簰寮忓浘琛?
> 馃О **Toolbox: Plotly Express 鈥?涓€琛屼唬鐮佺敾鍥?*
>
> Plotly Express 鏄?Plotly 鐨勯珮灞傛帴鍙ｏ紝绫讳技 Seaborn 涔嬩簬 Matplotlib銆?> 澶у鏁扮畝鍗曞浘琛ㄥ彧闇€涓€琛屼唬鐮侊紝涓旇嚜鍔ㄦ敮鎸佷氦浜掞紙缂╂斁銆佹偓鍋溿€佸鍑猴級銆?
```python
import plotly.express as px
import plotly.graph_objects as go

# 鉁?Plotly Express 鈥?蹇€熺粯鍥?df = px.data.gapminder()

# 鏁ｇ偣鍥撅紙甯﹀姩鐢伙級
fig = px.scatter(
    df.query("year == 2007"),
    x="gdpPercap", y="lifeExp",
    size="pop", color="continent",
    hover_name="country",
    size_max=60,
    title="2007 骞村悇鍥?GDP vs 棰勬湡瀵垮懡",
)
fig.show()

# 鉁?Graph Objects 鈥?瀹屽叏鎺у埗
fig = go.Figure()
fig.add_trace(go.Scatter(x=[1,2,3], y=[4,5,6], mode="lines+markers", name="Line"))
fig.add_trace(go.Bar(x=[1,2,3], y=[2,3,1], name="Bar"))
fig.update_layout(title="缁勫悎鍥捐〃")
fig.show()
```

---

## 3. Seaborn 缁熻鍥捐〃

```python
import seaborn as sns
import matplotlib.pyplot as plt

# 鍔犺浇鍐呯疆鏁版嵁闆?tips = sns.load_dataset("tips")

# 鉁?鍒嗗竷鍥?fig, axes = plt.subplots(1, 3, figsize=(15, 4))
sns.histplot(tips["total_bill"], kde=True, ax=axes[0])
sns.boxplot(x="day", y="total_bill", data=tips, ax=axes[1])
sns.violinplot(x="day", y="total_bill", data=tips, ax=axes[2])
plt.tight_layout()
plt.show()

# 鉁?鍏崇郴鍥?sns.lmplot(x="total_bill", y="tip", hue="smoker", data=tips)
plt.show()

# 鉁?鐑姏鍥撅紙鐩稿叧鎬х煩闃碉級
corr = tips.select_dtypes(include="number").corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", center=0)
plt.title("鐩稿叧鎬х煩闃?)
plt.show()
```

---

## 4. 鍥捐〃閫夋嫨鎸囧崡

> 馃 **Zen of Code: 閫夋嫨姝ｇ‘鐨勫浘琛?*
>
> | 鐩殑 | 鎺ㄨ崘鍥捐〃 | 搴?|
> |------|---------|-----|
> | 瓒嬪娍鍙樺寲 | 鎶樼嚎鍥?| Matplotlib/Plotly |
> | 鍒嗙被瀵规瘮 | 鏌辩姸鍥?| Matplotlib/Plotly |
> | 鍒嗗竷 | 鐩存柟鍥俱€佺绾垮浘銆佸皬鎻愮惔鍥?| Seaborn |
> | 鍏崇郴 | 鏁ｇ偣鍥?| Plotly锛堜氦浜掞級|
> | 缁勬垚 | 楗煎浘銆佸爢鍙犳煴鐘跺浘 | Matplotlib |
> | 鐩稿叧鎬?| 鐑姏鍥?| Seaborn |
> | 鍦扮悊 | 鍦板浘 | Plotly |

---

## 鏈€浣冲疄璺?
1. **鍏堥棶"鎯冲睍绀轰粈涔?** 鈥?鍥捐〃鏈嶅姟浜庝俊鎭紶杈撅紝涓嶆槸鐐妧
2. **灏戝嵆鏄** 鈥?鍘绘帀涓嶅繀瑕佺殑瑁呴グ锛坈hart junk锛?3. **浣跨敤鍚堥€傜殑棰滆壊** 鈥?鑹茬洸鍙嬪ソ鐨勯厤鑹叉柟妗?4. **鏍囨敞娓呮櫚** 鈥?鏍囬銆佽酱鏍囩銆佸浘渚嬬己涓€涓嶅彲
5. **浜や簰寮忕敤 Plotly** 鈥?鎺㈢储鎬у垎鏋愶紱**闈欐€佺敤 Matplotlib** 鈥?璁烘枃銆佹姤鍛?
---

## 缁冧範棰?
<details>
<summary><b>缁冧範 1锛氬闈㈡澘浠〃鏉?/b></summary>

浣跨敤 Matplotlib 鍒涘缓涓€涓?2x3 鐨勫瓙鍥鹃潰鏉匡紝灞曠ず涓嶅悓绫诲瀷鐨勫浘琛ㄣ€?
</details>

<details>
<summary><b>缁冧範 2锛氫氦浜掑紡鏁版嵁鎺㈢储</b></summary>

浣跨敤 Plotly 鍒涘缓涓€涓氦浜掑紡鏁ｇ偣鍥撅紝鏀寔鎸夌被鍒潃鑹插拰鎮仠鏄剧ず璇︽儏銆?
</details>

---

## 鍙傝€冭祫婧?
- [Matplotlib 瀹樻柟鏁欑▼](https://matplotlib.org/stable/tutorials/) 鈥?鍏ㄩ潰鏁欑▼
- [Plotly 鏂囨。](https://plotly.com/python/) 鈥?浜や簰寮忓浘琛?- [Seaborn 瀹樻柟鏁欑▼](https://seaborn.pydata.org/tutorial.html) 鈥?缁熻鍙鍖?- [From Data to Viz](https://www.data-to-viz.com/) 鈥?鍥捐〃閫夋嫨鎸囧崡

---

**[馃憠 绗?6 绔狅細鏈哄櫒瀛︿範鍏ラ棬](../06-ml-basics/)**

[猬咃笍 杩斿洖 Stage 4 鐩綍](../README.md)

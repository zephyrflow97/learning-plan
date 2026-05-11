# Stage 4 缁冧範棰?
> 浠ヤ笅 25 閬撶粌涔犺鐩?Stage 4 鐨勫叏閮ㄦ牳蹇冪煡璇嗙偣銆?> 寤鸿鎸夐『搴忓畬鎴愶紝姣忛亾棰橀兘搴斿寘鍚被鍨嬫爣娉ㄥ拰鏃ュ織璁板綍銆?
---

## FastAPI 缁冧範锛?-6锛?
<details>
<summary><b>缁冧範 1锛氬浘涔︾鐞?API</b></summary>

鍒涘缓涓€涓浘涔︾鐞?REST API锛?- `Book` 妯″瀷锛歵itle, author, isbn, price, published_year
- CRUD 绔偣锛圙ET/POST/PUT/DELETE锛?- 鎸変綔鑰呫€佷环鏍艰寖鍥淬€佸嚭鐗堝勾浠界瓫閫?- 璇锋眰璁℃椂涓棿浠?
</details>

<details>
<summary><b>缁冧範 2锛氫緷璧栨敞鍏ラ摼</b></summary>

瀹炵幇涓夌骇渚濊禆娉ㄥ叆閾撅細
1. `verify_api_key` 鈥?浠?Header 璇诲彇 API Key
2. `get_current_user` 鈥?鏍规嵁 API Key 鏌ユ壘鐢ㄦ埛
3. `require_role(role)` 鈥?妫€鏌ョ敤鎴疯鑹?
</details>

<details>
<summary><b>缁冧範 3锛歐ebSocket 鑱婂ぉ瀹?/b></summary>

鍒涘缓澶氭埧闂?WebSocket 鑱婂ぉ搴旂敤锛?- 鏀寔鍔犲叆/绂诲紑鎴块棿
- 骞挎挱娑堟伅缁欐埧闂村唴鎵€鏈夌敤鎴?- 璁板綍鍦ㄧ嚎鐢ㄦ埛鏁?
</details>

<details>
<summary><b>缁冧範 4锛氭枃浠朵笂浼?API</b></summary>

瀹炵幇鏂囦欢涓婁紶绔偣锛?- 鏀寔 CSV 鍜?JSON 鏍煎紡
- 鏂囦欢澶у皬闄愬埗锛?0MB锛?- 杩斿洖鏂囦欢鎽樿淇℃伅锛堣鏁般€佸垪鏁般€佸垪鍚嶏級

</details>

<details>
<summary><b>缁冧範 5锛欰PI 鐗堟湰绠＄悊</b></summary>

瀹炵幇 API 鐗堟湰绠＄悊锛歚/api/v1/users` 鍜?`/api/v2/users` 鍏卞瓨銆?
</details>

<details>
<summary><b>缁冧範 6锛氬紓姝ユ壒閲忔搷浣?/b></summary>

瀹炵幇寮傛鎵归噺鏁版嵁澶勭悊绔偣锛?- POST `/batch/process` 鎺ユ敹涓€鎵?URL
- 骞跺彂璇锋眰鎵€鏈?URL
- 杩斿洖缁撴灉姹囨€?
</details>

---

## 鏁版嵁搴撶粌涔狅紙7-10锛?
<details>
<summary><b>缁冧範 7锛氬崥瀹㈡暟鎹簱璁捐</b></summary>

鐢?SQLModel 璁捐鍗氬绯荤粺锛歎ser銆丳ost銆丆omment銆乀ag锛堝瀵瑰锛夈€?瀹炵幇瀹屾暣 CRUD銆?
</details>

<details>
<summary><b>缁冧範 8锛氬垎椤垫煡璇?/b></summary>

瀹炵幇閫氱敤鍒嗛〉鍑芥暟锛?```python
async def paginate(session, model, page=1, page_size=20, order_by="id"):
    # 杩斿洖 {items, total, page, page_size, total_pages}
```

</details>

<details>
<summary><b>缁冧範 9锛歂+1 闂浼樺寲</b></summary>

鏋勯€犱竴涓湁 N+1 闂鐨勬煡璇紝鐢?selectinload 鍜?joinedload 鍒嗗埆浼樺寲銆?
</details>

<details>
<summary><b>缁冧範 10锛氫簨鍔″鐞?/b></summary>

瀹炵幇杞处鍔熻兘锛氱‘淇濅綑棰濇墸鍑忓拰澧炲姞鏄師瀛愭搷浣溿€?
</details>

---

## Pandas 鏁版嵁鍒嗘瀽缁冧範锛?1-16锛?
<details>
<summary><b>缁冧範 11锛氭暟鎹竻娲?/b></summary>

缁欏畾涓€涓惈缂哄け鍊笺€侀噸澶嶅€笺€佸紓甯稿€肩殑 CSV锛屽畬鎴愭暟鎹竻娲楁祦姘寸嚎銆?
</details>

<details>
<summary><b>缁冧範 12锛氶攢鍞暟鎹垎鏋?/b></summary>

鍒嗘瀽閿€鍞暟鎹細鏈堝害姹囨€汇€佺幆姣斿闀跨巼銆乀op 10 浜у搧銆佸鑺傛€у垎鏋愩€?
</details>

<details>
<summary><b>缁冧範 13锛氭暟鎹悎骞?/b></summary>

鍚堝苟澶氫釜鏁版嵁婧愶細鐢ㄦ埛琛?+ 璁㈠崟琛?+ 浜у搧琛紝鐢熸垚缁煎悎鍒嗘瀽鎶ュ憡銆?
</details>

<details>
<summary><b>缁冧範 14锛氭椂闂村簭鍒楀垎鏋?/b></summary>

瀵硅偂绁?姘旀俯鏁版嵁鍋氭椂闂村簭鍒楀垎鏋愶細绉诲姩骞冲潎銆佸鑺傛€у垎瑙ｃ€佽秼鍔挎娴嬨€?
</details>

<details>
<summary><b>缁冧範 15锛氶€忚琛ㄦ姤鍛?/b></summary>

鐢熸垚澶氱淮閫忚琛ㄦ姤鍛婏細鎸夐儴闂?x 鏈堜唤缁熻閿€鍞銆佸憳宸ユ暟銆佷汉鍧囦骇鍑恒€?
</details>

<details>
<summary><b>缁冧範 16锛氭暟鎹彲瑙嗗寲浠〃鏉?/b></summary>

鐢?Matplotlib 鎴?Plotly 鍒涘缓鍖呭惈鑷冲皯 4 涓浘琛ㄧ殑鍒嗘瀽浠〃鏉裤€?
</details>

---

## 鏈哄櫒瀛︿範缁冧範锛?7-21锛?
<details>
<summary><b>缁冧範 17锛氶涪灏捐姳鍒嗙被</b></summary>

姣旇緝閫昏緫鍥炲綊銆佸喅绛栨爲銆侀殢鏈烘．鏋椼€丼VM 鍦ㄩ涪灏捐姳鏁版嵁闆嗕笂鐨勮〃鐜般€?鐢ㄤ氦鍙夐獙璇佽瘎浼般€?
</details>

<details>
<summary><b>缁冧範 18锛氭埧浠烽娴?/b></summary>

鐢?California Housing 鏁版嵁闆嗘瀯寤哄洖褰掓ā鍨嬶紝姣旇緝绾挎€у洖褰掑拰闅忔満妫灄銆?
</details>

<details>
<summary><b>缁冧範 19锛氱壒寰佸伐绋?Pipeline</b></summary>

鏋勫缓瀹屾暣鐨?Pipeline锛氱己澶卞€煎鐞?+ 鏍囧噯鍖?+ One-Hot 缂栫爜 + 妯″瀷璁粌銆?
</details>

<details>
<summary><b>缁冧範 20锛氳繃鎷熷悎璇婃柇</b></summary>

鏋勫缓涓€涓繃鎷熷悎鐨勬ā鍨嬶紝鐒跺悗閫氳繃姝ｅ垯鍖栥€佸噺灏戠壒寰併€佸鍔犳暟鎹潵瑙ｅ喅銆?
</details>

<details>
<summary><b>缁冧範 21锛氭ā鍨嬫寔涔呭寲</b></summary>

璁粌妯″瀷锛岀敤 joblib 淇濆瓨锛屽姞杞藉悗鍦ㄦ柊鏁版嵁涓婇娴嬨€?
</details>

---

## Docker/閮ㄧ讲缁冧範锛?2-25锛?
<details>
<summary><b>缁冧範 22锛欴ocker 鍖?FastAPI</b></summary>

涓轰綘鐨?FastAPI 椤圭洰缂栧啓澶氶樁娈?Dockerfile銆傝姹傞暅鍍忓皬浜?200MB銆?
</details>

<details>
<summary><b>缁冧範 23锛欴ocker Compose 缂栨帓</b></summary>

缂栧啓 docker-compose.yml锛欶astAPI + PostgreSQL + Redis銆?鍖呭惈 healthcheck 鍜?volume 鎸佷箙鍖栥€?
</details>

<details>
<summary><b>缁冧範 24锛欸itHub Actions CI</b></summary>

缂栧啓 CI 閰嶇疆锛氫唬鐮佹鏌ワ紙ruff锛? 绫诲瀷妫€鏌ワ紙mypy锛? 娴嬭瘯锛坧ytest锛夈€?
</details>

<details>
<summary><b>缁冧範 25锛氶厤缃鐞?/b></summary>

鐢?pydantic-settings 瀹炵幇澶氱幆澧冮厤缃鐞嗭紙dev/staging/prod锛夈€?
</details>

---

## 鑷垜璇勪及

瀹屾垚浠ヤ笂缁冧範鍚庯紝妫€鏌ヤ互涓嬫爣鍑嗭細

- [ ] 鑳界嫭绔嬬敤 FastAPI 鏋勫缓鍖呭惈璁よ瘉鐨?REST API
- [ ] 鑳界敤 SQLModel 璁捐鏁版嵁搴撳苟澶勭悊鍏崇郴鏌ヨ
- [ ] 鑳界敤 Pandas 瀹屾垚瀹屾暣鐨勬暟鎹垎鏋愭祦绋?- [ ] 鑳界敤 scikit-learn 璁粌鍜岃瘎浼?ML 妯″瀷
- [ ] 鑳界敤 Docker 瀹瑰櫒鍖栭儴缃?Python 搴旂敤
- [ ] 鑳界紪鍐?CI/CD 娴佹按绾?
---

[猬咃笍 杩斿洖 Stage 4 鐩綍](../README.md)
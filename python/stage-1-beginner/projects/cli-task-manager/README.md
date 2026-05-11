# 瀹炴垬椤圭洰锛欳LI 浠诲姟绠＄悊鍣?
> *"The best way to learn is to build something."*

## 椤圭洰姒傝堪

涓€涓姛鑳藉畬鏁寸殑鍛戒护琛屼换鍔＄鐞嗗櫒锛岀患鍚堣繍鐢?Stage 1 鎵€鏈夌煡璇嗙偣銆?
## 鍔熻兘鐗规€?
- 鉃?娣诲姞鏂颁换鍔★紙鏍囬銆佹弿杩般€佷紭鍏堢骇銆佹埅姝㈡棩鏈燂級
- 鉁忥笍 缂栬緫鍜屾洿鏂颁换鍔?- 鉁?鏍囪浠诲姟瀹屾垚/鏈畬鎴?- 馃棏锔?鍒犻櫎浠诲姟
- 馃攳 鎸夌姸鎬?浼樺厛绾?鍏抽敭璇嶇瓫閫?- 馃搳 浠诲姟缁熻锛堝凡瀹屾垚/杩涜涓?杩囨湡锛?- 馃捑 JSON 鏂囦欢鎸佷箙鍖栧瓨鍌?- 馃帹 褰╄壊缁堢杈撳嚭

## 椤圭洰缁撴瀯

```
cli-task-manager/
鈹溾攢鈹€ README.md          # 椤圭洰璇存槑锛堟湰鏂囦欢锛?鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ main.py        # 涓诲叆鍙ｏ紙argparse锛?鈹?  鈹溾攢鈹€ task_manager.py # 鏍稿績涓氬姟閫昏緫
鈹?  鈹溾攢鈹€ storage.py     # JSON 鏂囦欢瀛樺偍
鈹?  鈹溾攢鈹€ display.py     # 褰╄壊缁堢杈撳嚭
鈹?  鈹斺攢鈹€ models.py      # 鏁版嵁妯″瀷
鈹斺攢鈹€ tasks.json         # 鏁版嵁鏂囦欢锛堣繍琛屽悗鑷姩鐢熸垚锛?```

## 杩愯鏂瑰紡

```bash
cd projects/cli-task-manager

# 娣诲姞浠诲姟
python src/main.py add --title "瀛︿範 Python" --priority high
python src/main.py add --title "鍐欐枃妗? --desc "瀹屾垚 README" --due 2026-03-01

# 鍒楀嚭浠诲姟
python src/main.py list
python src/main.py list --status pending
python src/main.py list --priority high

# 瀹屾垚浠诲姟
python src/main.py done 1

# 鍒犻櫎浠诲姟
python src/main.py delete 2

# 缁熻
python src/main.py stats

# 鎼滅储
python src/main.py search "Python"
```

## 娑电洊鐭ヨ瘑鐐?
| 鐭ヨ瘑鐐?| 搴旂敤鍦烘櫙 |
|--------|---------|
| 鏁版嵁缁撴瀯锛坉ict, list锛?| 浠诲姟鏁版嵁瀛樺偍 |
| 鍑芥暟璁捐涓庢ā鍧楀寲 | 鍚勬ā鍧楀垎宸?|
| 鏂囦欢鎿嶄綔锛圝SON锛?| 鏁版嵁鎸佷箙鍖?|
| 寮傚父澶勭悊 | 杈撳叆楠岃瘉銆佹枃浠舵搷浣?|
| pathlib | 璺緞绠＄悊 |
| argparse | 鍛戒护琛屽弬鏁?|
| f-string | 鏍煎紡鍖栬緭鍑?|
| logging | 缁撴瀯鍖栨棩蹇?|
| dataclass | 鏁版嵁妯″瀷 |
| 绫诲瀷鏍囨敞 | 浠ｇ爜鏂囨。 |

## 瀹炵幇姝ラ

1. 鉁?瀹氫箟鏁版嵁妯″瀷 (`models.py`)
2. 鉁?瀹炵幇瀛樺偍灞?(`storage.py`)
3. 鉁?瀹炵幇鏍稿績閫昏緫 (`task_manager.py`)
4. 鉁?瀹炵幇鏄剧ず灞?(`display.py`)
5. 鉁?瀹炵幇鍛戒护琛屾帴鍙?(`main.py`)

## 楠屾敹娓呭崟

- [ ] 鑳芥坊鍔犮€佸垪鍑恒€佸畬鎴愩€佸垹闄や换鍔?- [ ] 鏁版嵁鎸佷箙鍖栧埌 JSON 鏂囦欢
- [ ] 鏀寔鎸夌姸鎬?浼樺厛绾х瓫閫?- [ ] 褰╄壊缁堢杈撳嚭
- [ ] 鏈夋棩蹇楄緭鍑?`[妯″潡鍚峕 鎿嶄綔鎻忚堪`
- [ ] 浠ｇ爜鏈夌被鍨嬫爣娉?- [ ] 澶勭悊浜嗚竟鐣屾儏鍐靛拰寮傚父
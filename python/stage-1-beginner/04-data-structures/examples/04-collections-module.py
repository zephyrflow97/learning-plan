"""
collections 妯″潡 鈥?deque, OrderedDict, ChainMap

杩愯鏂瑰紡:
    python examples/04-collections-module.py
"""
from collections import ChainMap, OrderedDict, deque


def demo_deque() -> None:
    """婕旂ず鍙岀闃熷垪 deque"""
    print("[collections] === deque 鍙岀闃熷垪 ===")

    # deque 涓ょ鎿嶄綔閮芥槸 O(1)锛宭ist 澶撮儴鎿嶄綔鏄?O(n)
    dq = deque([1, 2, 3])
    print(f"[collections] 鍒濆: {dq}")

    dq.append(4)         # 鍙崇娣诲姞
    dq.appendleft(0)     # 宸︾娣诲姞
    print(f"[collections] append/appendleft: {dq}")

    dq.pop()             # 鍙崇寮瑰嚭
    dq.popleft()         # 宸︾寮瑰嚭
    print(f"[collections] pop/popleft: {dq}")

    # rotate 鈥?鏃嬭浆
    dq = deque([1, 2, 3, 4, 5])
    dq.rotate(2)   # 鍚戝彸鏃嬭浆 2 姝?    print(f"[collections] rotate(2): {dq}")
    dq.rotate(-2)  # 鍚戝乏鏃嬭浆 2 姝?    print(f"[collections] rotate(-2): {dq}")

    # maxlen 鈥?鍥哄畾澶у皬鐨勯槦鍒楋紙鑷姩涓㈠純鏃у厓绱狅級
    recent = deque(maxlen=3)
    for i in range(5):
        recent.append(i)
        print(f"[collections]   娣诲姞 {i}: {list(recent)}")


def demo_ordered_dict() -> None:
    """婕旂ず OrderedDict"""
    print("\n[collections] === OrderedDict ===")
    print("[collections] Python 3.7+ 鐨?dict 宸蹭繚璇佹彃鍏ラ『搴?)
    print("[collections] OrderedDict 浠嶆湁鐙壒鍔熻兘:")

    od = OrderedDict(a=1, b=2, c=3)

    # move_to_end
    od.move_to_end("a")
    print(f"[collections] move_to_end('a'): {od}")

    od.move_to_end("c", last=False)  # 绉诲埌寮€澶?    print(f"[collections] move_to_end('c', last=False): {od}")

    # popitem(last=False) 鈥?寮瑰嚭绗竴涓?    first = od.popitem(last=False)
    print(f"[collections] popitem(last=False): {first}, 鍓╀綑: {od}")


def demo_chainmap() -> None:
    """婕旂ず ChainMap"""
    print("\n[collections] === ChainMap ===")

    # ChainMap 灏嗗涓瓧鍏搁摼鎺ヨ捣鏉ワ紝浼樺厛浣跨敤绗竴涓?    defaults = {"color": "blue", "size": "medium", "theme": "light"}
    user_prefs = {"color": "red", "font": "Arial"}
    session = {"theme": "dark"}

    config = ChainMap(session, user_prefs, defaults)
    print(f"[collections] config['color'] = {config['color']}")  # red (user_prefs)
    print(f"[collections] config['size']  = {config['size']}")   # medium (defaults)
    print(f"[collections] config['theme'] = {config['theme']}")  # dark (session)
    print(f"[collections] config['font']  = {config['font']}")   # Arial (user_prefs)


def demo_data_structure_choice() -> None:
    """鏁版嵁缁撴瀯閫夋嫨鎸囧崡"""
    print("\n[閫夋嫨鎸囧崡] === 浣曟椂鐢ㄤ粈涔堟暟鎹粨鏋?===")
    print("[閫夋嫨鎸囧崡] 鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?闇€姹?           鈹?鎺ㄨ崘鏁版嵁缁撴瀯              鈹?)
    print("[閫夋嫨鎸囧崡] 鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹尖攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?鏈夊簭闆嗗悎,鍙慨鏀? 鈹?list                     鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?涓嶅彲鍙樺簭鍒?     鈹?tuple                    鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?閿€兼槧灏?       鈹?dict                     鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?鍘婚噸/鎴愬憳鍒ゆ柇   鈹?set                      鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?鍙岀闃熷垪        鈹?deque                    鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?璁℃暟            鈹?Counter                  鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?鍒嗙粍            鈹?defaultdict(list)        鈹?)
    print("[閫夋嫨鎸囧崡] 鈹?缁撴瀯鍖栬褰?     鈹?namedtuple / dataclass   鈹?)
    print("[閫夋嫨鎸囧崡] 鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?)


def main() -> None:
    print("=" * 60)
    print("Python collections 妯″潡婕旂ず")
    print("=" * 60)

    demo_deque()
    demo_ordered_dict()
    demo_chainmap()
    demo_data_structure_choice()

    print("\n" + "=" * 60)
    print("collections 妯″潡婕旂ず瀹屾垚")
    print("=" * 60)


if __name__ == "__main__":
    main()
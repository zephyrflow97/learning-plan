"""
璋冭瘯鎶€宸?鈥?print, logging, breakpoint

杩愯鏂瑰紡:
    python examples/04-debugging.py
"""
import logging

# 閰嶇疆 logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger("debugging")


def demo_print_debug() -> None:
    """print 璋冭瘯"""
    print("[璋冭瘯] === print 璋冭瘯 ===")

    def buggy_average(numbers):
        total = 0
        count = 0
        for n in numbers:
            total += n
            count += 1
            # print 璋冭瘯锛氭煡鐪嬩腑闂寸姸鎬?            print(f"[璋冭瘯]   n={n}, total={total}, count={count}")
        return total / count if count > 0 else 0

    result = buggy_average([10, 20, 30])
    print(f"[璋冭瘯] 骞冲潎鍊? {result}")


def demo_logging() -> None:
    """logging 妯″潡"""
    print("\n[璋冭瘯] === logging 妯″潡 ===")

    # 涓嶅悓绾у埆
    logger.debug("杩欐槸 DEBUG 淇℃伅锛堣缁嗚皟璇曪級")
    logger.info("杩欐槸 INFO 淇℃伅锛堟甯歌繍琛岋級")
    logger.warning("杩欐槸 WARNING 淇℃伅锛堣鍛婏級")
    logger.error("杩欐槸 ERROR 淇℃伅锛堥敊璇級")
    logger.critical("杩欐槸 CRITICAL 淇℃伅锛堜弗閲嶉敊璇級")

    # 瀹為檯搴旂敤
    def process_data(data: list) -> list:
        logger.info(f"寮€濮嬪鐞?{len(data)} 鏉℃暟鎹?)
        result = []
        for i, item in enumerate(data):
            try:
                processed = item * 2
                result.append(processed)
                logger.debug(f"澶勭悊绗?{i+1} 鏉? {item} -> {processed}")
            except Exception as e:
                logger.error(f"澶勭悊绗?{i+1} 鏉″け璐? {e}")
        logger.info(f"澶勭悊瀹屾垚锛屾垚鍔?{len(result)}/{len(data)} 鏉?)
        return result

    process_data([1, 2, 3, 4, 5])


def demo_breakpoint() -> None:
    """breakpoint() 璋冭瘯鍣?""
    print("\n[璋冭瘯] === breakpoint() ===")
    print("[璋冭瘯] breakpoint() 鏄?Python 3.7+ 鐨勫唴缃皟璇曞櫒鍏ュ彛")
    print("[璋冭瘯] 瀹冪瓑浠蜂簬 import pdb; pdb.set_trace()")
    print("[璋冭瘯] 甯哥敤鍛戒护:")
    print("[璋冭瘯]   n (next) 鈥?鎵ц涓嬩竴琛?)
    print("[璋冭瘯]   s (step) 鈥?杩涘叆鍑芥暟")
    print("[璋冭瘯]   c (continue) 鈥?缁х画鎵ц")
    print("[璋冭瘯]   p expr 鈥?鎵撳嵃琛ㄨ揪寮?)
    print("[璋冭瘯]   l (list) 鈥?鏄剧ず褰撳墠浠ｇ爜")
    print("[璋冭瘯]   q (quit) 鈥?閫€鍑鸿皟璇曞櫒")
    print("[璋冭瘯]")
    print("[璋冭瘯] 绀轰緥:")
    print("[璋冭瘯]   def my_func(x):")
    print("[璋冭瘯]       breakpoint()  # 鍦ㄨ繖閲屾殏鍋?)
    print("[璋冭瘯]       return x * 2")
    print("[璋冭瘯]")
    print("[璋冭瘯] 鎻愮ず: 璁剧疆 PYTHONBREAKPOINT=0 鍙鐢ㄦ墍鏈夋柇鐐?)


def demo_assert() -> None:
    """assert 鏂█"""
    print("\n[璋冭瘯] === assert 鏂█ ===")

    def calculate_discount(price: float, discount: float) -> float:
        assert 0 <= discount <= 1, f"鎶樻墸蹇呴』鍦?0-1 涔嬮棿锛屽緱鍒? {discount}"
        assert price >= 0, f"浠锋牸涓嶈兘涓鸿礋锛屽緱鍒? {price}"
        return price * (1 - discount)

    print(f"[璋冭瘯] calculate_discount(100, 0.2) = {calculate_discount(100, 0.2)}")

    try:
        calculate_discount(100, 1.5)
    except AssertionError as e:
        print(f"[璋冭瘯] AssertionError: {e}")

    print("[璋冭瘯] 娉ㄦ剰: assert 鍦?python -O 妯″紡涓嬩細琚拷鐣?)
    print("[璋冭瘯] 鎵€浠ヤ笉瑕佺敤 assert 鍋氳緭鍏ラ獙璇侊紒鍙敤浜庡紑鍙戞椂鐨勮嚜妫€")


def main() -> None:
    print("=" * 60)
    print("Python 璋冭瘯鎶€宸ф紨绀?)
    print("=" * 60)
    demo_print_debug()
    demo_logging()
    demo_breakpoint()
    demo_assert()
    print("\n" + "=" * 60)
    print("璋冭瘯鎶€宸ф紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()
"""
鏄剧ず灞?鈥?褰╄壊缁堢杈撳嚭

璐熻矗灏嗕换鍔℃暟鎹牸寮忓寲涓虹編瑙傜殑缁堢杈撳嚭銆?"""
import logging

logger = logging.getLogger("display")


# ANSI 棰滆壊鐮?class Colors:
    """缁堢棰滆壊甯搁噺"""
    RESET = "\033[0m"
    BOLD = "\033[1m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    GRAY = "\033[90m"


def colorize(text: str, color: str) -> str:
    """缁欐枃鏈坊鍔犻鑹?""
    return f"{color}{text}{Colors.RESET}"


def display_task(task) -> None:
    """鏄剧ず鍗曚釜浠诲姟"""
    # 鐘舵€佸浘鏍?    if task.status == "done":
        status = colorize("鉁?DONE", Colors.GREEN)
    else:
        status = colorize("猬?TODO", Colors.YELLOW)

    # 浼樺厛绾ч鑹?    priority_colors = {
        "high": Colors.RED,
        "medium": Colors.YELLOW,
        "low": Colors.GREEN,
    }
    priority_color = priority_colors.get(task.priority, Colors.RESET)
    priority = colorize(f"[{task.priority.upper()}]", priority_color)

    # 鏍囬锛堝畬鎴愮殑浠诲姟鐢ㄥ垹闄ょ嚎鏁堟灉鈥斺€旂伆鑹诧級
    if task.status == "done":
        title = colorize(task.title, Colors.GRAY)
    else:
        title = colorize(task.title, Colors.BOLD)

    print(f"  {status}  {priority}  #{task.id}  {title}")

    if task.description:
        print(f"         馃摑 {task.description}")

    if task.due_date:
        if task.is_overdue:
            due = colorize(f"馃搮 {task.due_date} 鈿狅笍 杩囨湡!", Colors.RED)
        else:
            due = f"馃搮 {task.due_date}"
        print(f"         {due}")

    print(f"         {colorize(f'鍒涘缓浜?{task.created_at}', Colors.GRAY)}")


def display_task_list(tasks: list, title: str = "浠诲姟鍒楄〃") -> None:
    """鏄剧ず浠诲姟鍒楄〃"""
    print()
    print(colorize(f"  === {title} ===", Colors.BOLD + Colors.CYAN))
    print()

    if not tasks:
        print(colorize("  娌℃湁浠诲姟銆?, Colors.GRAY))
        print()
        return

    for task in tasks:
        display_task(task)
        print()

    total = len(tasks)
    done = sum(1 for t in tasks if t.status == "done")
    pending = total - done
    print(colorize(f"  鍏?{total} 涓换鍔?| 鉁?{done} 瀹屾垚 | 猬?{pending} 寰呭姙", Colors.CYAN))
    print()
    logger.info(f"[display] 鏄剧ず {total} 鏉′换鍔?)


def display_stats(tasks: list) -> None:
    """鏄剧ず浠诲姟缁熻"""
    print()
    print(colorize("  === 浠诲姟缁熻 ===", Colors.BOLD + Colors.CYAN))
    print()

    total = len(tasks)
    if total == 0:
        print(colorize("  杩樻病鏈変换浣曚换鍔°€?, Colors.GRAY))
        return

    done = sum(1 for t in tasks if t.status == "done")
    pending = sum(1 for t in tasks if t.status == "pending")
    overdue = sum(1 for t in tasks if t.is_overdue)

    high = sum(1 for t in tasks if t.priority == "high" and t.status != "done")
    medium = sum(1 for t in tasks if t.priority == "medium" and t.status != "done")
    low = sum(1 for t in tasks if t.priority == "low" and t.status != "done")

    completion = done / total * 100 if total > 0 else 0

    print(f"  馃搳 鎬讳换鍔℃暟: {colorize(str(total), Colors.BOLD)}")
    print(f"  鉁?宸插畬鎴?   {colorize(str(done), Colors.GREEN)}")
    print(f"  猬?寰呭姙:     {colorize(str(pending), Colors.YELLOW)}")
    if overdue > 0:
        print(f"  鈿狅笍  杩囨湡:     {colorize(str(overdue), Colors.RED)}")
    print()
    print(f"  寰呭姙浼樺厛绾?")
    print(f"    馃敶 楂? {high}  馃煛 涓? {medium}  馃煝 浣? {low}")
    print()

    # 杩涘害鏉?    bar_length = 30
    filled = int(bar_length * completion / 100)
    bar = "鈻? * filled + "鈻? * (bar_length - filled)
    print(f"  瀹屾垚搴? [{colorize(bar, Colors.GREEN)}] {completion:.0f}%")
    print()
    logger.info(f"[display] 鏄剧ず缁熻: {total} 浠诲姟, {completion:.0f}% 瀹屾垚")


def display_message(message: str, msg_type: str = "info") -> None:
    """鏄剧ず娑堟伅"""
    colors = {
        "info": Colors.CYAN,
        "success": Colors.GREEN,
        "warning": Colors.YELLOW,
        "error": Colors.RED,
    }
    icons = {
        "info": "鈩癸笍",
        "success": "鉁?,
        "warning": "鈿狅笍",
        "error": "鉂?,
    }
    color = colors.get(msg_type, Colors.RESET)
    icon = icons.get(msg_type, "")
    print(f"\n  {icon} {colorize(message, color)}\n")
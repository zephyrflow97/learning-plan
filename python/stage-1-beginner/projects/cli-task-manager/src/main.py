"""
CLI 浠诲姟绠＄悊鍣?鈥?涓诲叆鍙?
浣跨敤 argparse 瑙ｆ瀽鍛戒护琛屽弬鏁帮紝璋冪敤 TaskManager 鎵ц鎿嶄綔銆?
杩愯鏂瑰紡:
    python src/main.py add --title "瀛︿範 Python" --priority high
    python src/main.py list
    python src/main.py list --status pending
    python src/main.py done 1
    python src/main.py delete 2
    python src/main.py stats
    python src/main.py search "Python"
"""
import argparse
import logging
import sys
from pathlib import Path

# 灏?src 鐩綍娣诲姞鍒拌矾寰勶紙纭繚妯″潡鍙互瀵煎叆锛?sys.path.insert(0, str(Path(__file__).parent))

from display import display_message, display_stats, display_task_list
from storage import Storage
from task_manager import TaskManager

# 閰嶇疆鏃ュ織
logging.basicConfig(
    level=logging.WARNING,  # 榛樿鍙樉绀鸿鍛婂強浠ヤ笂
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("main")


def create_parser() -> argparse.ArgumentParser:
    """鍒涘缓鍛戒护琛屽弬鏁拌В鏋愬櫒"""
    parser = argparse.ArgumentParser(
        prog="task-manager",
        description="CLI 浠诲姟绠＄悊鍣?鈥?Stage 1 瀹炴垬椤圭洰",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="鏄剧ず璇︾粏鏃ュ織",
    )

    subparsers = parser.add_subparsers(dest="command", help="鍙敤鍛戒护")

    # add 鍛戒护
    add_parser = subparsers.add_parser("add", help="娣诲姞鏂颁换鍔?)
    add_parser.add_argument("--title", "-t", required=True, help="浠诲姟鏍囬")
    add_parser.add_argument("--desc", "-d", default="", help="浠诲姟鎻忚堪")
    add_parser.add_argument(
        "--priority", "-p",
        choices=["low", "medium", "high"],
        default="medium",
        help="浼樺厛绾?(榛樿: medium)",
    )
    add_parser.add_argument("--due", default="", help="鎴鏃ユ湡 (YYYY-MM-DD)")

    # list 鍛戒护
    list_parser = subparsers.add_parser("list", help="鍒楀嚭浠诲姟")
    list_parser.add_argument(
        "--status", "-s",
        choices=["pending", "done"],
        help="鎸夌姸鎬佺瓫閫?,
    )
    list_parser.add_argument(
        "--priority", "-p",
        choices=["low", "medium", "high"],
        help="鎸変紭鍏堢骇绛涢€?,
    )

    # done 鍛戒护
    done_parser = subparsers.add_parser("done", help="鏍囪浠诲姟瀹屾垚")
    done_parser.add_argument("id", type=int, help="浠诲姟 ID")

    # undone 鍛戒护
    undone_parser = subparsers.add_parser("undone", help="鏍囪浠诲姟鏈畬鎴?)
    undone_parser.add_argument("id", type=int, help="浠诲姟 ID")

    # delete 鍛戒护
    delete_parser = subparsers.add_parser("delete", help="鍒犻櫎浠诲姟")
    delete_parser.add_argument("id", type=int, help="浠诲姟 ID")

    # stats 鍛戒护
    subparsers.add_parser("stats", help="鏄剧ず缁熻")

    # search 鍛戒护
    search_parser = subparsers.add_parser("search", help="鎼滅储浠诲姟")
    search_parser.add_argument("keyword", help="鎼滅储鍏抽敭璇?)

    return parser


def main() -> None:
    """涓诲嚱鏁?""
    parser = create_parser()
    args = parser.parse_args()

    # 璁剧疆鏃ュ織绾у埆
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # 鍒濆鍖栦换鍔＄鐞嗗櫒
    # 鏁版嵁鏂囦欢瀛樻斁鍦ㄩ」鐩牴鐩綍
    project_dir = Path(__file__).parent.parent
    storage = Storage(project_dir / "tasks.json")
    manager = TaskManager(storage)

    logger.info("[main] CLI 浠诲姟绠＄悊鍣ㄥ惎鍔?)

    # 璺敱鍛戒护
    if args.command is None:
        parser.print_help()
        return

    try:
        if args.command == "add":
            task = manager.add_task(
                title=args.title,
                description=args.desc,
                priority=args.priority,
                due_date=args.due,
            )
            display_message(f"浠诲姟宸叉坊鍔? #{task.id} {task.title}", "success")

        elif args.command == "list":
            tasks = manager.list_tasks(
                status=args.status,
                priority=args.priority,
            )
            title = "浠诲姟鍒楄〃"
            if args.status:
                title += f" (鐘舵€? {args.status})"
            if args.priority:
                title += f" (浼樺厛绾? {args.priority})"
            display_task_list(tasks, title)

        elif args.command == "done":
            task = manager.complete_task(args.id)
            if task:
                display_message(f"浠诲姟宸插畬鎴? #{task.id} {task.title}", "success")
            else:
                display_message(f"浠诲姟 #{args.id} 涓嶅瓨鍦?, "error")

        elif args.command == "undone":
            task = manager.uncomplete_task(args.id)
            if task:
                display_message(f"浠诲姟宸查噸鏂版墦寮€: #{task.id} {task.title}", "info")
            else:
                display_message(f"浠诲姟 #{args.id} 涓嶅瓨鍦?, "error")

        elif args.command == "delete":
            task = manager.delete_task(args.id)
            if task:
                display_message(f"浠诲姟宸插垹闄? #{task.id} {task.title}", "warning")
            else:
                display_message(f"浠诲姟 #{args.id} 涓嶅瓨鍦?, "error")

        elif args.command == "stats":
            display_stats(manager.tasks)

        elif args.command == "search":
            tasks = manager.search_tasks(args.keyword)
            display_task_list(tasks, f"鎼滅储缁撴灉: '{args.keyword}'")

    except ValueError as e:
        display_message(str(e), "error")
        sys.exit(1)
    except Exception as e:
        logger.exception("[main] 鏈鏈熺殑閿欒")
        display_message(f"鍙戠敓閿欒: {e}", "error")
        sys.exit(1)

    logger.info("[main] 鍛戒护鎵ц瀹屾垚")


if __name__ == "__main__":
    main()
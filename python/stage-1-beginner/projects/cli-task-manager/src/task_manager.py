"""
鏍稿績涓氬姟閫昏緫 鈥?浠诲姟绠＄悊鍣?
璐熻矗浠诲姟鐨勫鍒犳敼鏌ョ瓑鏍稿績鎿嶄綔銆?"""
import logging
from datetime import date

from models import Task
from storage import Storage

logger = logging.getLogger("task_manager")


class TaskManager:
    """浠诲姟绠＄悊鍣ㄦ牳蹇冪被

    鎻愪緵浠诲姟鐨勫鍒犳敼鏌ュ姛鑳斤紝閫氳繃 Storage 鎸佷箙鍖栨暟鎹€?    """

    def __init__(self, storage: Storage | None = None) -> None:
        self.storage = storage or Storage()
        self.tasks: list[Task] = self.storage.load_tasks()
        logger.info(f"[task_manager] 鍒濆鍖栧畬鎴愶紝鍔犺浇 {len(self.tasks)} 鏉′换鍔?)

    def add_task(
        self,
        title: str,
        description: str = "",
        priority: str = "medium",
        due_date: str = "",
    ) -> Task:
        """娣诲姞鏂颁换鍔?""
        # 楠岃瘉浼樺厛绾?        valid_priorities = {"low", "medium", "high"}
        if priority not in valid_priorities:
            raise ValueError(f"鏃犳晥鐨勪紭鍏堢骇: {priority}锛屽彲閫? {valid_priorities}")

        # 楠岃瘉鎴鏃ユ湡
        if due_date:
            try:
                date.fromisoformat(due_date)
            except ValueError:
                raise ValueError(f"鏃犳晥鐨勬棩鏈熸牸寮? {due_date}锛岃浣跨敤 YYYY-MM-DD")

        # 鍒涘缓浠诲姟
        task_id = self.storage.get_next_id()
        task = Task(
            id=task_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
        )

        self.tasks.append(task)
        self._save()
        logger.info(f"[task_manager] 娣诲姞浠诲姟 #{task.id}: {task.title}")
        return task

    def get_task(self, task_id: int) -> Task | None:
        """鏍规嵁 ID 鑾峰彇浠诲姟"""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def complete_task(self, task_id: int) -> Task | None:
        """鏍囪浠诲姟涓哄畬鎴?""
        task = self.get_task(task_id)
        if task is None:
            logger.warning(f"[task_manager] 浠诲姟 #{task_id} 涓嶅瓨鍦?)
            return None

        if task.status == "done":
            logger.info(f"[task_manager] 浠诲姟 #{task_id} 宸茬粡鏄畬鎴愮姸鎬?)
            return task

        task.status = "done"
        self._save()
        logger.info(f"[task_manager] 瀹屾垚浠诲姟 #{task.id}: {task.title}")
        return task

    def uncomplete_task(self, task_id: int) -> Task | None:
        """鏍囪浠诲姟涓烘湭瀹屾垚"""
        task = self.get_task(task_id)
        if task is None:
            return None
        task.status = "pending"
        self._save()
        logger.info(f"[task_manager] 閲嶆柊鎵撳紑浠诲姟 #{task.id}: {task.title}")
        return task

    def delete_task(self, task_id: int) -> Task | None:
        """鍒犻櫎浠诲姟"""
        task = self.get_task(task_id)
        if task is None:
            logger.warning(f"[task_manager] 浠诲姟 #{task_id} 涓嶅瓨鍦?)
            return None

        self.tasks.remove(task)
        self._save()
        logger.info(f"[task_manager] 鍒犻櫎浠诲姟 #{task.id}: {task.title}")
        return task

    def list_tasks(
        self,
        status: str | None = None,
        priority: str | None = None,
    ) -> list[Task]:
        """鍒楀嚭浠诲姟锛屾敮鎸佹寜鐘舵€佸拰浼樺厛绾х瓫閫?""
        result = self.tasks

        if status:
            result = [t for t in result if t.status == status]

        if priority:
            result = [t for t in result if t.priority == priority]

        logger.info(f"[task_manager] 鍒楀嚭 {len(result)} 鏉′换鍔?"
                     f"(status={status}, priority={priority})")
        return result

    def search_tasks(self, keyword: str) -> list[Task]:
        """鎸夊叧閿瘝鎼滅储浠诲姟"""
        keyword_lower = keyword.lower()
        result = [
            t for t in self.tasks
            if keyword_lower in t.title.lower()
            or keyword_lower in t.description.lower()
        ]
        logger.info(f"[task_manager] 鎼滅储 '{keyword}' 鎵惧埌 {len(result)} 鏉?)
        return result

    def get_stats(self) -> dict:
        """鑾峰彇浠诲姟缁熻"""
        total = len(self.tasks)
        done = sum(1 for t in self.tasks if t.status == "done")
        pending = total - done
        overdue = sum(1 for t in self.tasks if t.is_overdue)

        stats = {
            "total": total,
            "done": done,
            "pending": pending,
            "overdue": overdue,
            "completion": done / total * 100 if total > 0 else 0,
        }
        logger.info(f"[task_manager] 缁熻: {stats}")
        return stats

    def _save(self) -> None:
        """淇濆瓨浠诲姟鍒板瓨鍌?""
        self.storage.save_tasks(self.tasks)
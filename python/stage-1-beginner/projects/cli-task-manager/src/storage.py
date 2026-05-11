"""
存储层 —— JSON 文件持久化。
负责任务数据的读写，使用 JSON 格式存储到文件。"""
import json
import logging
from pathlib import Path

from models import Task

logger = logging.getLogger("storage")


class Storage:
    """JSON 文件存储

    所有任务数据存储在一个 JSON 文件中。格式: {"next_id": int, "tasks": [task_dict, ...]}
    """

    def __init__(self, filepath: str | Path = "tasks.json") -> None:
        self.filepath = Path(filepath)
        self._ensure_file()
        logger.info(f"[storage] 存储文件: {self.filepath.resolve()}")

    def _ensure_file(self) -> None:
        """确保存储文件存在"""
        if not self.filepath.exists():
            self._write_data({"next_id": 1, "tasks": []})
            logger.info("[storage] 创建新的存储文件")

    def _read_data(self) -> dict:
        """读取 JSON 数据"""
        try:
            content = self.filepath.read_text(encoding="utf-8")
            data = json.loads(content)
            logger.debug(f"[storage] 读取 {len(data.get('tasks', []))} 条任务")
            return data
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"[storage] 数据文件损坏: {e}")
            return {"next_id": 1, "tasks": []}

    def _write_data(self, data: dict) -> None:
        """写入 JSON 数据"""
        content = json.dumps(data, ensure_ascii=False, indent=2)
        self.filepath.write_text(content, encoding="utf-8")
        logger.debug(f"[storage] 写入 {len(data.get('tasks', []))} 条任务")

    def load_tasks(self) -> list[Task]:
        """加载所有任务"""
        data = self._read_data()
        tasks = [Task.from_dict(t) for t in data.get("tasks", [])]
        logger.info(f"[storage] 加载 {len(tasks)} 条任务")
        return tasks

    def save_tasks(self, tasks: list[Task]) -> None:
        """保存所有任务"""
        # 计算下一个 ID
        next_id = max((t.id for t in tasks), default=0) + 1
        data = {
            "next_id": next_id,
            "tasks": [t.to_dict() for t in tasks],
        }
        self._write_data(data)
        logger.info(f"[storage] 保存 {len(tasks)} 条任务")

    def get_next_id(self) -> int:
        """获取下一个可用 ID"""
        data = self._read_data()
        return data.get("next_id", 1)
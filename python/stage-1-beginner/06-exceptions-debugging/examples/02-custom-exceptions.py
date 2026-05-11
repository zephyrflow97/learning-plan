"""
鑷畾涔夊紓甯?鈥?涓轰綘鐨勫簲鐢ㄥ垱寤轰笓灞炲紓甯?
杩愯鏂瑰紡:
    python examples/02-custom-exceptions.py
"""


# 鑷畾涔夊紓甯哥被 鈥?缁ф壙 Exception
class AppError(Exception):
    """搴旂敤绋嬪簭鍩虹寮傚父"""
    pass


class ValidationError(AppError):
    """鏁版嵁楠岃瘉閿欒"""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"楠岃瘉閿欒 [{field}]: {message}")


class NotFoundError(AppError):
    """璧勬簮涓嶅瓨鍦ㄩ敊璇?""
    def __init__(self, resource: str, identifier: str | int):
        self.resource = resource
        self.identifier = identifier
        super().__init__(f"{resource} 涓嶅瓨鍦? {identifier}")


class AuthenticationError(AppError):
    """璁よ瘉閿欒"""
    pass


def demo_custom_exceptions() -> None:
    """婕旂ず鑷畾涔夊紓甯?""
    print("[鑷畾涔夊紓甯竇 === 鑷畾涔夊紓甯告紨绀?===")

    # 妯℃嫙鐢ㄦ埛娉ㄥ唽楠岃瘉
    def validate_user(name: str, age: int, email: str) -> None:
        if not name or len(name) < 2:
            raise ValidationError("name", "鐢ㄦ埛鍚嶈嚦灏?2 涓瓧绗?)
        if age < 0 or age > 150:
            raise ValidationError("age", f"骞撮緞 {age} 涓嶅悎娉?)
        if "@" not in email:
            raise ValidationError("email", f"閭鏍煎紡涓嶆纭? {email}")
        print(f"[鑷畾涔夊紓甯竇 鐢ㄦ埛楠岃瘉閫氳繃: {name}, {age}, {email}")

    # 娴嬭瘯鍚勭鎯呭喌
    test_cases = [
        ("Alice", 30, "alice@example.com"),
        ("A", 30, "alice@example.com"),
        ("Bob", -5, "bob@example.com"),
        ("Charlie", 25, "charlie_at_example"),
    ]

    for name, age, email in test_cases:
        try:
            validate_user(name, age, email)
        except ValidationError as e:
            print(f"[鑷畾涔夊紓甯竇 鎹曡幏: {e}")
            print(f"[鑷畾涔夊紓甯竇   瀛楁: {e.field}, 娑堟伅: {e.message}")


def demo_exception_hierarchy_custom() -> None:
    """婕旂ず鑷畾涔夊紓甯稿眰娆?""
    print("\n[鑷畾涔夊紓甯竇 === 寮傚父灞傛 ===")

    def do_something():
        raise NotFoundError("User", 42)

    # 鍙互鐢ㄥ熀绫绘崟鑾锋墍鏈夊簲鐢ㄥ紓甯?    try:
        do_something()
    except AppError as e:
        print(f"[鑷畾涔夊紓甯竇 鎹曡幏 AppError: {type(e).__name__}: {e}")

    print("\n[鑷畾涔夊紓甯竇 鑷畾涔夊紓甯稿眰娆?")
    print("[鑷畾涔夊紓甯竇 AppError")
    print("[鑷畾涔夊紓甯竇 鈹溾攢鈹€ ValidationError")
    print("[鑷畾涔夊紓甯竇 鈹溾攢鈹€ NotFoundError")
    print("[鑷畾涔夊紓甯竇 鈹斺攢鈹€ AuthenticationError")


def main() -> None:
    print("=" * 60)
    print("Python 鑷畾涔夊紓甯告紨绀?)
    print("=" * 60)
    demo_custom_exceptions()
    demo_exception_hierarchy_custom()
    print("\n" + "=" * 60)
    print("鑷畾涔夊紓甯告紨绀哄畬鎴?)
    print("=" * 60)


if __name__ == "__main__":
    main()
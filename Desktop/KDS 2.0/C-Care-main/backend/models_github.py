from dataclasses import dataclass, asdict, field
from datetime import datetime
from typing import Optional, List
import bcrypt


@dataclass
class User:
    user_id: int
    name: str
    username: str
    role: str
    pin_hash: str
    fingerprint_data: Optional[str] = None
    is_active: bool = True
    status: str = "active"
    institution_id: Optional[int] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def set_pin(self, pin: str):
        self.pin_hash = bcrypt.hashpw(pin.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def check_pin(self, pin: str) -> bool:
        try:
            return bcrypt.checkpw(pin.encode("utf-8"), self.pin_hash.encode("utf-8"))
        except Exception:
            return False

    def to_dict(self):
        return asdict(self)


@dataclass
class Drug:
    drug_id: int
    drug_name: str
    price: float
    stock_quantity: int
    category: Optional[str] = None
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None
    description: Optional[str] = None
    institution_id: Optional[int] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self):
        return asdict(self)

import os
import json
import base64
import time
from datetime import datetime
from typing import Any, Dict, Optional
import requests

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPO = os.getenv("GITHUB_REPO_NAME")
GITHUB_DATA_PATH = os.getenv("GITHUB_DATA_PATH", "data")
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")
MAX_RETRIES = int(os.getenv("GITHUB_MAX_RETRIES", "4"))
RETRY_DELAY = float(os.getenv("GITHUB_RETRY_DELAY_MS", "0.3"))

if not (GITHUB_TOKEN and GITHUB_OWNER and GITHUB_REPO):
    # allow import in environments without env vars; operations will fail with clearer error
    pass

API_BASE = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}"
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"} if GITHUB_TOKEN else {}


def _get_file(path: str) -> Dict[str, Any]:
    url = f"{API_BASE}/contents/{path}"
    resp = requests.get(url, headers=HEADERS, params={"ref": GITHUB_BRANCH})
    if resp.status_code == 404:
        return {"missing": True}
    resp.raise_for_status()
    return resp.json()


def read_json(file_name: str) -> Dict[str, Any]:
    """Read and decode JSON file from the repo. Returns dict with 'data' list."""
    path = f"{GITHUB_DATA_PATH}/{file_name}"
    try:
        data = _get_file(path)
        if data.get("missing"):
            return {"_version": "1.0", "data": []}
        content = data.get("content", "")
        decoded = base64.b64decode(content).decode("utf-8") if content else ""
        return json.loads(decoded) if decoded else {"_version": "1.0", "data": []}
    except Exception:
        return {"_version": "1.0", "data": []}


def _put_file(path: str, content_str: str, sha: Optional[str], message: str):
    url = f"{API_BASE}/contents/{path}"
    payload = {"message": message, "content": base64.b64encode(content_str.encode("utf-8")).decode("utf-8"), "branch": GITHUB_BRANCH}
    if sha:
        payload["sha"] = sha
    resp = requests.put(url, headers=HEADERS, json=payload)
    resp.raise_for_status()
    return resp.json()


def modify_json_file(file_name: str, mutator, commit_message: str):
    path = f"{GITHUB_DATA_PATH}/{file_name}"
    for attempt in range(1, MAX_RETRIES + 1):
        file_meta = _get_file(path)
        if file_meta.get("missing"):
            current = {"_version": "1.0", "data": []}
            sha = None
        else:
            sha = file_meta.get("sha")
            content = file_meta.get("content", "")
            decoded = base64.b64decode(content).decode("utf-8") if content else ""
            current = json.loads(decoded) if decoded else {"_version": "1.0", "data": []}

        current_copy = json.loads(json.dumps(current))
        new = mutator(current_copy)
        content_str = json.dumps(new, indent=2, default=str)
        try:
            _put_file(path, content_str, sha, commit_message)
            return new
        except requests.HTTPError as e:
            status = getattr(e.response, "status_code", None)
            if status in (409, 422) and attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY * attempt)
                continue
            raise


def append_to_array(file_name: str, item: dict, id_key: str = "id", commit_message: str = None):
    commit_message = commit_message or f"Add item to {file_name}"
    def mutator(current):
        arr = current.get("data") or []
        max_id = max((int(x.get(id_key, 0)) for x in arr), default=0)
        if id_key:
            item[id_key] = item.get(id_key) or (max_id + 1)
        arr.append(item)
        current["data"] = arr
        return current
    return modify_json_file(file_name, mutator, commit_message)


def update_in_array(file_name: str, predicate, updater, commit_message: str = None):
    commit_message = commit_message or f"Update item in {file_name}"
    def mutator(current):
        arr = current.get("data") or []
        idx = next((i for i, v in enumerate(arr) if predicate(v)), None)
        if idx is None:
            raise KeyError("Item not found")
        arr[idx] = {**arr[idx], **updater(arr[idx])}
        current["data"] = arr
        return current
    return modify_json_file(file_name, mutator, commit_message)


def delete_from_array(file_name: str, predicate, commit_message: str = None):
    commit_message = commit_message or f"Delete item from {file_name}"
    def mutator(current):
        arr = current.get("data") or []
        arr = [x for x in arr if not predicate(x)]
        current["data"] = arr
        return current
    return modify_json_file(file_name, mutator, commit_message)


def ensure_init_files():
    files = ["institutions.json", "users.json", "drugs.json", "customers.json", "sales.json", "audit_logs.json"]
    for f in files:
        path = f"{GITHUB_DATA_PATH}/{f}"
        try:
            meta = _get_file(path)
            if meta.get("missing"):
                _put_file(path, json.dumps({"_version": "1.0", "data": []}, indent=2), None, f"Initialize {f}")
        except Exception:
            continue

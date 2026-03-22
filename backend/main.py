import sys
import os
import threading
import time
import webview

# ── Path fix for PyInstaller bundle ──────────────────────────────────────────
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
    os.chdir(BASE_DIR)
    # Load .env from same folder as the exe
    EXE_DIR = os.path.dirname(sys.executable)
    env_path = os.path.join(EXE_DIR, '.env')
    if os.path.exists(env_path):
        from dotenv import load_dotenv
        load_dotenv(env_path)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Add base dir to path so imports work
sys.path.insert(0, BASE_DIR)

from app import app, db

PORT = 5000


def run_flask():
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=PORT, debug=False, use_reloader=False)


def wait_for_flask():
    import urllib.request
    for _ in range(30):
        try:
            urllib.request.urlopen(f'http://127.0.0.1:{PORT}/')
            return True
        except Exception:
            time.sleep(0.3)
    return False


if __name__ == '__main__':
    # Start Flask in background thread
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()

    # Wait until Flask is ready
    wait_for_flask()

    # Open native window
    webview.create_window(
        title="C-Care_UG — by Convergence",
        url=f'http://127.0.0.1:{PORT}/',
        width=1280,
        height=800,
        min_size=(900, 600),
        resizable=True,
    )
    webview.start()

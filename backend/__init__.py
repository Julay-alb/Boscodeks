"""Backend package initializer.

This file ensures the `backend` directory is treated as a Python package in
environments where implicit namespace packages may not be discovered the same
way (CI runners, older tooling, etc.).

Keep this file minimal.
"""

__all__ = []

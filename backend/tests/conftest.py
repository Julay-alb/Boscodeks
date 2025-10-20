"""Pytest conftest to ensure imports work on CI.

Some CI runners execute tests such that the test directory is on sys.path but
the repository root is not. Tests import `backend` as a top-level package,
so add the repository root to sys.path early during collection.
"""

import os
import sys

# backend/tests -> repo root is two levels up
TEST_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(TEST_DIR, "..", ".."))

if REPO_ROOT not in sys.path:
    # Insert at front to prefer local package over installed ones
    sys.path.insert(0, REPO_ROOT)

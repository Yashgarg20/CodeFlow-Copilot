from git import Repo
import tempfile

def clone_repository(repo_url):
    print("Step 1: Creating temp folder...")

    temp_dir = tempfile.mkdtemp(prefix="repo_")

    print("Step 2: Cloning repository...")

    Repo.clone_from(repo_url, temp_dir)

    print("Step 3: Clone complete!")

    return temp_dir
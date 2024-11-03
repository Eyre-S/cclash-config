import subprocess
from datetime import datetime

package_name: str = "sukazyo/cclash-config-deliver"

version_datetime: str = datetime.now().strftime("%Y.%m%d")
revision: int = 1
version: str = f"{version_datetime}.{revision}"

tag: str = f"{package_name}:{version}"
print(f"==> Building docker image with tag {tag}")
subprocess.run(["docker", "build", ".", "--tag", tag])

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

class JavaInstaller {
  constructor() {
    this.javaDir = process.env.JAVA_DIR || "/home/container/java";
    this.javaVersion = process.env.JAVA_VERSION || "21";
    // Allow overriding the base download URL via environment
    this.baseUrl = process.env.JAVA_BASE_URL || "https://download.oracle.com/java";
    this.downloadUrl = `${this.baseUrl}/${this.javaVersion}/latest/jdk-${this.javaVersion}_linux-x64_bin.tar.gz`;
    this.jdkDirPattern = `jdk-${this.javaVersion}`;
  }

  getJavaVersion(javaPath) {
    return new Promise((resolve, reject) => {
      exec(`${javaPath} -version`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stderr || stdout);
      });
    });
  }

  async checkSystemJava() {
    try {
      const output = await this.getJavaVersion("java");
      return { exists: true, output };
    } catch {
      return { exists: false };
    }
  }

  async checkExistingInstallation() {
    if (!fs.existsSync(this.javaDir)) {
      return { exists: false };
    }
    const files = fs.readdirSync(this.javaDir);
    const jdkDir = files.find(f => f.startsWith(this.jdkDirPattern));
    if (!jdkDir) {
      return { exists: false };
    }
    const javaPath = path.join(this.javaDir, jdkDir, "bin", "java");
    if (!fs.existsSync(javaPath)) {
      return { exists: false };
    }
    try {
      const output = await this.getJavaVersion(javaPath);
      return { exists: true, javaPath, output };
    } catch {
      return { exists: false };
    }
  }

  async downloadAndInstall() {
    return new Promise((resolve, reject) => {
      console.log(`🔽 Downloading Java ${this.javaVersion}...`);
      const cmd = `
        mkdir -p ${this.javaDir} && \
        cd ${this.javaDir} && \
        curl -L -o openjdk-${this.javaVersion}.tar.gz ${this.downloadUrl} && \
        tar -xzf openjdk-${this.javaVersion}.tar.gz && \
        rm openjdk-${this.javaVersion}.tar.gz
      `;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          console.warn(stderr);
        }
        resolve(stdout);
      });
    });
  }

  async install() {
    const systemCheck = await this.checkSystemJava();
    if (systemCheck.exists) {
      console.log("✅ Using system Java.");
      console.log(systemCheck.output);
      return { success: true, javaPath: "java", wasAlreadyInstalled: true };
    }

    const existing = await this.checkExistingInstallation();
    if (existing.exists) {
      console.log("✅ Java already installed.");
      console.log(existing.output);
      return { success: true, javaPath: existing.javaPath, wasAlreadyInstalled: true };
    }

    try {
      await this.downloadAndInstall();
    } catch (error) {
      return { success: false, error: error.message };
    }

    const installed = await this.checkExistingInstallation();
    if (installed.exists) {
      console.log("✅ Java installed.");
      return { success: true, javaPath: installed.javaPath, wasAlreadyInstalled: false };
    }
    return { success: false, error: "Installation failed" };
  }
}

async function installJava() {
  const installer = new JavaInstaller();
  console.log("🚀 Running Java installer...");
  const result = await installer.install();
  if (!result.success) {
    console.error("❌ Java installation failed:", result.error);
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  installJava().then(result => {
    if (result.success) {
      console.log("🎉 Java ready");
    } else {
      process.exit(1);
    }
  });
}

export { installJava, JavaInstaller };

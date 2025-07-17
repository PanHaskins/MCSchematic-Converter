const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class JavaInstaller {
  constructor() {
    this.javaDir = process.env.JAVA_DIR || '/home/container/java';
    this.javaVersion = process.env.JAVA_VERSION || '21';
    this.baseUrl = 'https://download.oracle.com/java';
    this.downloadUrl = `${this.baseUrl}/${this.javaVersion}/latest/jdk-${this.javaVersion}_linux-x64_bin.tar.gz`;
    this.jdkDirPattern = `jdk-${this.javaVersion}`;
  }

  async checkSystemJava() {
    try {
      const version = await this.getJavaVersion('java');
      const versionMatch = version.match(/openjdk version "(\d+)/i) || version.match(/java version "1\.(\d+)/i);
      
      if (versionMatch) {
        const majorVersion = versionMatch[1] === '8' ? '8' : versionMatch[1];
        return {
          exists: true,
          version: majorVersion,
          fullVersion: version,
          isCorrectVersion: majorVersion === this.javaVersion,
          message: `Systémová Java verzia ${majorVersion} je dostupná`
        };
      }
      
      return { exists: false, message: 'Java nie je dostupná v systéme' };
    } catch (error) {
      return { exists: false, message: 'Java nie je dostupná v systéme' };
    }
  }

  async checkExistingInstallation() {
    try {
      if (!fs.existsSync(this.javaDir)) {
        return { exists: false, message: 'Java adresár neexistuje' };
      }

      const files = fs.readdirSync(this.javaDir);
      const jdkDir = files.find(file => file.startsWith(this.jdkDirPattern));
      
      if (!jdkDir) {
        return { exists: false, message: `JDK verzia ${this.javaVersion} nebola nájdená` };
      }

      const javaPath = path.join(this.javaDir, jdkDir, 'bin', 'java');
      
      if (!fs.existsSync(javaPath)) {
        return { exists: false, message: 'Java executable neexistuje' };
      }

      // Overí funkčnosť
      const version = await this.getJavaVersion(javaPath);
      return { 
        exists: true, 
        javaPath, 
        jdkDir, 
        version,
        message: `Java ${this.javaVersion} je už nainštalovaná` 
      };
    } catch (error) {
      return { exists: false, message: `Chyba pri kontrole: ${error.message}` };
    }
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

  async downloadAndInstall() {
    return new Promise((resolve, reject) => {
      console.log(`🔽 Sťahujem Java ${this.javaVersion}...`);
      
      const installCmd = `
        mkdir -p ${this.javaDir} && \
        cd ${this.javaDir} && \
        curl -L -o openjdk-${this.javaVersion}.tar.gz ${this.downloadUrl} && \
        tar -xzf openjdk-${this.javaVersion}.tar.gz && \
        rm openjdk-${this.javaVersion}.tar.gz
      `;

      exec(installCmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Chyba pri inštalácii: ${error.message}`));
          return;
        }
        
        if (stderr) {
          console.warn('⚠️ stderr:', stderr);
        }
        
        console.log('✅ Sťahovanie a rozbalenie dokončené');
        resolve(stdout);
      });
    });
  }

  async findInstalledJdk() {
    try {
      const files = fs.readdirSync(this.javaDir);
      const jdkDir = files.find(file => file.startsWith(this.jdkDirPattern));
      
      if (!jdkDir) {
        throw new Error(`JDK adresár pre verziu ${this.javaVersion} nebol nájdený`);
      }

      return jdkDir;
    } catch (error) {
      throw new Error(`Chyba pri hľadaní JDK: ${error.message}`);
    }
  }

  async verifyInstallation(javaPath) {
    try {
      const version = await this.getJavaVersion(javaPath);
      console.log('📦 Java verzia:');
      console.log(version);
      return true;
    } catch (error) {
      console.error('❌ Java nefunguje:', error.message);
      return false;
    }
  }

  async install() {
    try {
      console.log(`🔍 Kontrolujem existujúcu inštaláciu Java ${this.javaVersion}...`);
      
      const existingCheck = await this.checkExistingInstallation();
      
      if (existingCheck.exists) {
        console.log('✅', existingCheck.message);
        console.log('📦 Java verzia:');
        console.log(existingCheck.version);
        console.log(`📂 Cesta: ${existingCheck.javaPath}`);
        return {
          success: true,
          javaPath: existingCheck.javaPath,
          jdkDir: existingCheck.jdkDir,
          wasAlreadyInstalled: true
        };
      }

      console.log('ℹ️', existingCheck.message);
      
      // Vymaže staré verzie ak existujú
      if (fs.existsSync(this.javaDir)) {
        const files = fs.readdirSync(this.javaDir);
        const oldJdkDirs = files.filter(file => file.startsWith('jdk-') && !file.startsWith(this.jdkDirPattern));
        
        if (oldJdkDirs.length > 0) {
          console.log('🧹 Odstraňujem staré verzie Java...');
          for (const oldDir of oldJdkDirs) {
            const oldPath = path.join(this.javaDir, oldDir);
            fs.rmSync(oldPath, { recursive: true, force: true });
            console.log(`🗑️ Odstránené: ${oldDir}`);
          }
        }
      }

      await this.downloadAndInstall();
      
      const jdkDir = await this.findInstalledJdk();
      const javaPath = path.join(this.javaDir, jdkDir, 'bin', 'java');
      
      const isWorking = await this.verifyInstallation(javaPath);
      
      if (isWorking) {
        console.log(`✅ Java ${this.javaVersion} bola úspešne nainštalovaná do ${this.javaDir}`);
        return {
          success: true,
          javaPath,
          jdkDir,
          wasAlreadyInstalled: false
        };
      } else {
        throw new Error('Java inštalácia zlyhala pri verifikácii');
      }

    } catch (error) {
      console.error('❌ Chyba pri inštalácii:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Spustenie inštalácie
const installer = new JavaInstaller();

console.log('🚀 Spúšťam Java inštalátor...');
console.log(`📋 Konfigurácia:`);
console.log(`   - Verzia: ${installer.javaVersion}`);
console.log(`   - Adresár: ${installer.javaDir}`);
console.log(`   - URL: ${installer.downloadUrl}`);
console.log('');

installer.install().then(result => {
  if (result.success) {
    console.log('');
    console.log('🎉 Inštalácia dokončená!');
    console.log(`📂 Java path: ${result.javaPath}`);
    console.log(`📁 JDK adresár: ${result.jdkDir}`);
    
    if (result.wasAlreadyInstalled) {
      console.log('ℹ️ Java bola už predtým nainštalovaná');
    }
  } else {
    console.log('');
    console.log('💥 Inštalácia zlyhala!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Neočakávaná chyba:', error.message);
  process.exit(1);
});
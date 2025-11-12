const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildScript {
  constructor() {
    this.buildDir = 'build';
    this.analysisDir = 'bundle-analysis';
  }

  async run() {
    try {
      console.log('🚀 Starting SecureX production build...\n');
      
      await this.cleanPreviousBuilds();
      await this.runSecurityAudit();
      await this.runTests();
      await this.buildApplication();
      await this.optimizeBuild();
      await this.generateBundleAnalysis();
      await this.createDeploymentPackage();
      
      console.log('\n✅ Build completed successfully!');
      this.printBuildSummary();
      
    } catch (error) {
      console.error('\n❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  async cleanPreviousBuilds() {
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true });
    }
    if (fs.existsSync(this.analysisDir)) {
      fs.rmSync(this.analysisDir, { recursive: true });
    }
  }

  async runSecurityAudit() {
    console.log('🔒 Running security audit...');
    execSync('npm audit --audit-level high', { stdio: 'inherit' });
    
    // Check for vulnerable dependencies
    execSync('npx check-dependencies --production', { stdio: 'inherit' });
  }

  async runTests() {
    console.log('🧪 Running test suite...');
    execSync('npm run test:ci', { stdio: 'inherit' });
    
    // Run accessibility tests
    execSync('npm run test:a11y', { stdio: 'inherit' });
  }

  async buildApplication() {
    console.log('🏗️ Building application...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  async optimizeBuild() {
    console.log('⚡ Optimizing build...');
    
    // Compress static assets
    this.compressAssets();
    
    // Generate brotli compression
    this.generateBrotliCompression();
    
    // Optimize images
    this.optimizeImages();
  }

  compressAssets() {
    const assets = this.findAssets(['.js', '.css', '.html']);
    assets.forEach(asset => {
      const compressed = this.gzipCompress(fs.readFileSync(asset));
      fs.writeFileSync(asset + '.gz', compressed);
    });
  }

  generateBrotliCompression() {
    if (this.hasBrotli()) {
      const assets = this.findAssets(['.js', '.css', '.html']);
      assets.forEach(asset => {
        execSync(`brotli -k -f ${asset}`, { stdio: 'inherit' });
      });
    }
  }

  optimizeImages() {
    const images = this.findAssets(['.png', '.jpg', '.jpeg', '.svg']);
    images.forEach(image => {
      // Implement image optimization logic
      console.log(`Optimizing image: ${image}`);
    });
  }

  async generateBundleAnalysis() {
    console.log('📊 Generating bundle analysis...');
    execSync('npm run analyze', { stdio: 'inherit' });
    
    // Generate bundle report
    const report = this.generateBundleReport();
    fs.writeFileSync(path.join(this.analysisDir, 'bundle-report.json'), JSON.stringify(report, null, 2));
  }

  async createDeploymentPackage() {
    console.log('📦 Creating deployment package...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deploymentInfo = {
      version: packageJson.version,
      buildDate: new Date().toISOString(),
      commitHash: process.env.GITHUB_SHA || 'local',
      environment: 'production',
      features: {
        aiAssistant: process.env.REACT_APP_AI_ASSISTANT_ENABLED === 'true',
        zeroTrust: process.env.REACT_APP_ZERO_TRUST_ENABLED === 'true',
        threatPrediction: process.env.REACT_APP_THREAT_PREDICTION_ENABLED === 'true'
      }
    };
    
    fs.writeFileSync(path.join(this.buildDir, 'deployment-info.json'), JSON.stringify(deploymentInfo, null, 2));
    
    // Create deployment checksum
    this.createDeploymentChecksum();
  }

  createDeploymentChecksum() {
    const files = this.getAllBuildFiles();
    const checksum = this.generateChecksum(files.map(f => fs.readFileSync(f)).join(''));
    fs.writeFileSync(path.join(this.buildDir, 'checksum.sha256'), checksum);
  }

  findAssets(extensions) {
    const assets = [];
    const findFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findFiles(filePath);
        } else if (extensions.some(ext => file.endsWith(ext))) {
          assets.push(filePath);
        }
      });
    };
    
    findFiles(this.buildDir);
    return assets;
  }

  getAllBuildFiles() {
    return this.findAssets(['.js', '.css', '.html', '.json', '.png', '.jpg', '.jpeg', '.svg', '.ico']);
  }

  generateChecksum(content) {
    // Simple checksum implementation
    return require('crypto').createHash('sha256').update(content).digest('hex');
  }

  gzipCompress(buffer) {
    return require('zlib').gzipSync(buffer);
  }

  hasBrotli() {
    try {
      execSync('which brotli', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  generateBundleReport() {
    const stats = JSON.parse(fs.readFileSync(path.join(this.buildDir, 'asset-manifest.json'), 'utf8'));
    const report = {
      totalSize: 0,
      files: [],
      chunks: [],
      recommendations: []
    };
    
    // Analyze bundle and generate recommendations
    return report;
  }

  printBuildSummary() {
    const buildInfo = JSON.parse(fs.readFileSync(path.join(this.buildDir, 'deployment-info.json'), 'utf8'));
    const stats = fs.statSync(path.join(this.buildDir, 'asset-manifest.json'));
    
    console.log('\n📋 Build Summary:');
    console.log('────────────────');
    console.log(`Version: ${buildInfo.version}`);
    console.log(`Build Date: ${new Date(buildInfo.buildDate).toLocaleString()}`);
    console.log(`Environment: ${buildInfo.environment}`);
    console.log(`Total Size: ${this.formatBytes(this.getTotalBuildSize())}`);
    console.log(`Features: ${Object.keys(buildInfo.features).filter(k => buildInfo.features[k]).join(', ')}`);
  }

  getTotalBuildSize() {
    const files = this.getAllBuildFiles();
    return files.reduce((total, file) => total + fs.statSync(file).size, 0);
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Run the build script
if (require.main === module) {
  new BuildScript().run();
}

module.exports = BuildScript;
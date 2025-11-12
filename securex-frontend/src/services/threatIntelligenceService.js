import axios from 'axios';

class ThreatIntelligenceService {
  constructor() {
    this.sources = {
      alienvault: process.env.REACT_APP_ALIENVAULT_API_KEY,
      virustotal: process.env.REACT_APP_VIRUSTOTAL_API_KEY,
      abuseipdb: process.env.REACT_APP_ABUSEIPDB_API_KEY
    };
    this.cache = new Map();
  }

  async analyzeIP(ipAddress) {
    const cacheKey = `ip_${ipAddress}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const [alienvaultData, abuseipdbData] = await Promise.all([
        this.checkAlienVault(ipAddress),
        this.checkAbuseIPDB(ipAddress)
      ]);

      const threatScore = this.calculateThreatScore(alienvaultData, abuseipdbData);
      const result = {
        ip: ipAddress,
        threatScore,
        reputation: this.getReputationLevel(threatScore),
        data: { alienvaultData, abuseipdbData },
        lastUpdated: new Date()
      };

      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), 300000); // 5 minute cache

      return result;
    } catch (error) {
      console.error('Threat intelligence analysis failed:', error);
      throw error;
    }
  }

  async analyzeHash(fileHash) {
    const cacheKey = `hash_${fileHash}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const virustotalData = await this.checkVirusTotal(fileHash);
      const result = {
        hash: fileHash,
        malicious: virustotalData.positives > 0,
        detectionRate: `${virustotalData.positives}/${virustotalData.total}`,
        scanDate: virustotalData.scan_date,
        lastUpdated: new Date()
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Hash analysis failed:', error);
      throw error;
    }
  }

  async checkAlienVault(ipAddress) {
    const response = await axios.get(
      `https://otx.alienvault.com/api/v1/indicators/IPv4/${ipAddress}/general`,
      {
        headers: {
          'X-OTX-API-KEY': this.sources.alienvault
        }
      }
    );
    return response.data;
  }

  async checkVirusTotal(fileHash) {
    const response = await axios.get(
      `https://www.virustotal.com/vtapi/v2/file/report`,
      {
        params: {
          apikey: this.sources.virustotal,
          resource: fileHash
        }
      }
    );
    return response.data;
  }

  async checkAbuseIPDB(ipAddress) {
    const response = await axios.get(
      `https://api.abuseipdb.com/api/v2/check`,
      {
        headers: {
          'Key': this.sources.abuseipdb,
          'Accept': 'application/json'
        },
        params: {
          ipAddress,
          maxAgeInDays: 90
        }
      }
    );
    return response.data;
  }

  calculateThreatScore(alienvaultData, abuseipdbData) {
    let score = 0;
    
    // AlienVault factors
    if (alienvaultData.pulse_info && alienvaultData.pulse_info.count > 0) {
      score += Math.min(alienvaultData.pulse_info.count * 2, 40);
    }
    
    // AbuseIPDB factors
    if (abuseipdbData.data && abuseipdbData.data.abuseConfidenceScore) {
      score += abuseipdbData.data.abuseConfidenceScore;
    }
    
    return Math.min(score, 100);
  }

  getReputationLevel(score) {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  async getGlobalThreatFeed() {
    try {
      const response = await axios.get('/api/threat-intel/global-feed');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global threat feed:', error);
      return this.getMockThreatFeed();
    }
  }

  getMockThreatFeed() {
    // Fallback mock data
    return {
      recentIOCs: [
        {
          type: 'ip',
          value: '192.168.1.100',
          threat: 'C2 Server',
          confidence: 95,
          firstSeen: new Date(Date.now() - 86400000)
        },
        {
          type: 'domain',
          value: 'malicious-domain.com',
          threat: 'Phishing',
          confidence: 87,
          firstSeen: new Date(Date.now() - 172800000)
        }
      ],
      trendingThreats: [
        {
          name: 'Ransomware-as-a-Service',
          severity: 'critical',
          trend: 'increasing',
          affectedSectors: ['Healthcare', 'Finance']
        }
      ]
    };
  }
}

export default new ThreatIntelligenceService();
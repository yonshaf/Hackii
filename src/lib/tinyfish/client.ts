/**
 * Official TinyFish API Client
 * Supports:
 * - TinyFish Search API: GET https://api.search.tinyfish.ai
 * - TinyFish Automation Run API: POST https://agent.tinyfish.ai/v1/automation/run
 */

export interface TinyFishSearchOptions {
  query: string;
  purpose?: string;
  location?: string;
  language?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  recencyMinutes?: number;
}

export interface TinyFishSearchResultItem {
  title: string;
  url: string;
  snippet?: string;
  score?: number;
  publishedDate?: string;
}

export interface TinyFishSearchResponse {
  results: TinyFishSearchResultItem[];
  query: string;
}

export interface TinyFishAutomationRunPayload {
  url: string;
  goal: string;
  output_schema?: Record<string, any>;
  browser_profile?: 'lite' | 'stealth';
  agent_config?: {
    max_steps?: number;
    max_duration_seconds?: number;
  };
}

export interface TinyFishAutomationRunResponse {
  status: 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  run_id?: string;
  result?: any;
  error?: string;
}

export class TinyFishClient {
  private apiKey: string | null;
  private searchEndpoint: string;
  private agentEndpoint: string;

  constructor() {
    this.apiKey = process.env.TINYFISH_API_KEY || null;
    this.searchEndpoint = process.env.TINYFISH_SEARCH_ENDPOINT || 'https://api.search.tinyfish.ai';
    this.agentEndpoint = process.env.TINYFISH_AGENT_ENDPOINT || 'https://agent.tinyfish.ai/v1/automation/run';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('your_tinyfish_api_key'));
  }

  /**
   * Search for public event pages using TinyFish Search API
   */
  public async search(options: TinyFishSearchOptions): Promise<TinyFishSearchResultItem[]> {
    if (!this.isConfigured()) {
      throw new Error('TinyFish API key not configured. Please set TINYFISH_API_KEY in .env.local.');
    }

    const params = new URLSearchParams({
      query: options.query,
      location: options.location || 'US',
      language: options.language || 'en',
    });

    if (options.purpose) params.set('purpose', options.purpose);
    if (options.recencyMinutes) params.set('recency_minutes', String(options.recencyMinutes));
    if (options.includeDomains && options.includeDomains.length > 0) {
      params.set('include_domains', options.includeDomains.join(','));
    }
    if (options.excludeDomains && options.excludeDomains.length > 0) {
      params.set('exclude_domains', options.excludeDomains.join(','));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${this.searchEndpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey as string,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TinyFish Search API error (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const data = await response.json();
      return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Run goal-directed browser agent on a webpage to extract structured event data
   */
  public async runAutomation(payload: TinyFishAutomationRunPayload): Promise<TinyFishAutomationRunResponse> {
    if (!this.isConfigured()) {
      throw new Error('TinyFish API key not configured. Please set TINYFISH_API_KEY in .env.local.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s safety timeout

    try {
      const response = await fetch(this.agentEndpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey as string,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: payload.url,
          goal: payload.goal,
          output_schema: payload.output_schema,
          browser_profile: payload.browser_profile || 'lite',
          agent_config: payload.agent_config || {
            max_steps: 25,
            max_duration_seconds: 40,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TinyFish Automation API error (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const data = await response.json();
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const tinyFishClient = new TinyFishClient();

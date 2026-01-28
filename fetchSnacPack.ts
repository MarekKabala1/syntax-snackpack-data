import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { SnackPackIssue, SnackPackData } from './types';

async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

function parseDate(dateText: string): string {
  try {
    const date = new Date(dateText);
    return date.toISOString();
  } catch {
    return dateText;
  }
}

async function scrapeSnackPackList(url: string = 'https://syntax.fm/snackpack'): Promise<SnackPackIssue[]> {
  console.log('🔍 Fetching Snack Pack issues...\n');

  const html = await fetchHTML(url);
  const $ = cheerio.load(html);
  const issues: SnackPackIssue[] = [];

  $('a[href^="/snackpack/"]').each((index, element) => {
    const $link = $(element);
    const href = $link.attr('href');
    const fullUrl = `https://syntax.fm${href}`;

    const issueNumber = href?.match(/\/snackpack\/(\d+)/)?.[1] || '';

    const fullText = $link.text().trim();

    const datePattern = /^([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/;
    const dateMatch = fullText.match(datePattern);

    let date = '';
    let title = fullText;

    if (dateMatch) {
      date = dateMatch[1];
      title = fullText.replace(datePattern, '').trim();
    }

    if (!title) {
      title = fullText;
    }

    if (title && issueNumber) {
      issues.push({
        id: issueNumber,
        title,
        date: parseDate(date),
        url: fullUrl,
        issueNumber,
      });

      console.log(`  ✅ ${issues.length}. ${title}`);
    }
  });

  return issues;
}

async function saveToFile(data: SnackPackData, filename: string = 'snackpack-list.json'): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Data saved to ${filePath}`);
    console.log(`📊 Total issues: ${data.metadata.totalIssues}`);
    console.log(`📅 Last updated: ${data.metadata.lastUpdated}`);
  } catch (error) {
    console.error('❌ Error saving file:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    console.log('🥪 Syntax Snack Pack Scraper\n');
    console.log('================================\n');

    const issues = await scrapeSnackPackList();

    const output: SnackPackData = {
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalIssues: issues.length,
        version: '1.0.0',
      },
      issues,
    };

    await saveToFile(output);

    console.log('\n🎉 Done! Check data/snackpack-list.json');
  } catch (error) {
    console.error('\n❌ Failed to scrape Snack Pack:', error);
    process.exit(1);
  }
}

main();
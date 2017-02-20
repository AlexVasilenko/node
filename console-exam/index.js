#!/usr/bin/env node

const command = require('commander');
const scraper = require('./scrapperClient');

const LEVEL = 5;

command
  .option('-u, --url <url>', 'URL to search')
  .option('-e, --element <element>', 'Element to search')
  .option('-l, --level <level>', 'Search depth level')
  .option('-d, --delete', 'Delete search request')
  .option('-s, --list', 'Show search history')
  .parse(process.argv);

if (command.list) {
  scraper.searchHistory();
} else {
  if (!command.url) {
    console.log('URL is missed.');
    process.exit(1);
  }
  if (!command.element) {
    console.log('Element is missed.');
    process.exit(1);
  }
  if (!command.level) {
    command.level = LEVEL;
  }

  const request = scraper.generateRequest(command.url, command.element, command.level);
  if (command.delete) {
    scraper.delete(request);
  } else {
    scraper.getDomElements(request);
  }
}

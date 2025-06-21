#!/usr/bin/env node

/**
 * SaaS Kit CLI Tool
 * 
 * Command-line interface for managing SaaS Kit projects, generating components,
 * and handling template operations.
 * 
 * Usage:
 *   npx saas-cli <command> [options]
 *   node scripts/saas-cli.js <command> [options]
 * 
 * Commands:
 *   init              Initialize a new SaaS Kit project
 *   generate <type>   Generate components, pages, or API routes
 *   template          Manage project templates
 *   config            Manage project configuration
 *   deploy            Deploy project to various platforms
 * 
 * Examples:
 *   saas-cli init my-project
 *   saas-cli generate component Button
 *   saas-cli generate page dashboard
 *   saas-cli template list
 *   saas-cli config set theme dark
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple argument parser (alternative to commander.js to avoid dependencies)
class ArgumentParser {
  constructor() {
    this.commands = new Map();
    this.globalOptions = new Map();
  }

  command(name, description) {
    const cmd = {
      name,
      description,
      options: new Map(),
      action: null,
      examples: []
    };
    this.commands.set(name, cmd);
    return {
      description: (desc) => { cmd.description = desc; return this; },
      option: (flag, desc, defaultValue) => {
        cmd.options.set(flag, { description: desc, default: defaultValue });
        return this;
      },
      action: (fn) => { cmd.action = fn; return this; },
      example: (ex) => { cmd.examples.push(ex); return this; }
    };
  }

  option(flag, description, defaultValue) {
    this.globalOptions.set(flag, { description, default: defaultValue });
    return this;
  }

  parse(argv = process.argv) {
    const args = argv.slice(2);
    const commandName = args[0];
    
    if (!commandName || commandName === 'help' || commandName === '--help' || commandName === '-h') {
      this.showHelp();
      return;
    }

    const command = this.commands.get(commandName);
    if (!command) {
      console.error(`❌ Unknown command: ${commandName}`);
      this.showHelp();
      process.exit(1);
    }

    // Parse options and arguments
    const parsedArgs = this.parseArgs(args.slice(1));
    
    if (command.action) {
      command.action(parsedArgs);
    }
  }

  parseArgs(args) {
    const result = { _: [], options: {} };
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        if (value !== undefined) {
          result.options[key] = value;
        } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          result.options[key] = args[++i];
        } else {
          result.options[key] = true;
        }
      } else if (arg.startsWith('-')) {
        const key = arg.slice(1);
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          result.options[key] = args[++i];
        } else {
          result.options[key] = true;
        }
      } else {
        result._.push(arg);
      }
    }
    
    return result;
  }

  showHelp() {
    console.log(`
🚀 SaaS Kit CLI Tool

Usage: saas-cli <command> [options]

Commands:`);

    for (const [name, cmd] of this.commands) {
      console.log(`  ${name.padEnd(12)} ${cmd.description}`);
    }

    console.log(`
Global Options:
  -h, --help     Show help information
  -v, --version  Show version information

Examples:
  saas-cli init my-project
  saas-cli generate component Button
  saas-cli generate page dashboard
  saas-cli template list
  saas-cli config set theme dark

For more information on a specific command:
  saas-cli <command> --help
`);
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🚀${colors.reset} ${colors.bright}${msg}${colors.reset}`),
};

// Template definitions
const templates = {
  component: {
    description: 'React component with TypeScript',
    files: {
      'component.tsx': (name) => `import React from 'react';
import { cn } from '@/lib/utils';

interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${name}({ className, children, ...props }: ${name}Props) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export default ${name};`,
      'component.test.tsx': (name) => `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name}>Test content</${name}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});`,
      'index.ts': (name) => `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';`
    }
  },
  page: {
    description: 'Next.js page with TypeScript',
    files: {
      'page.tsx': (name) => `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${name}',
  description: '${name} page',
};

export default function ${name}Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">${name}</h1>
      <p className="text-muted-foreground">
        Welcome to the ${name} page.
      </p>
    </div>
  );
}`
    }
  },
  api: {
    description: 'Next.js API route with TypeScript',
    files: {
      'route.ts': (name) => `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement ${name} GET logic
    return NextResponse.json({ 
      message: '${name} GET endpoint',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('${name} GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Implement ${name} POST logic
    return NextResponse.json({ 
      message: '${name} POST endpoint',
      data: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('${name} POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`
    }
  },
  hook: {
    description: 'Custom React hook with TypeScript',
    files: {
      'hook.ts': (name) => `import { useState, useEffect } from 'react';

interface Use${name}Options {
  // Add options here
}

interface Use${name}Return {
  // Add return type here
  loading: boolean;
  error: Error | null;
}

export function use${name}(options?: Use${name}Options): Use${name}Return {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // TODO: Implement ${name} logic
    setLoading(true);
    
    // Cleanup function
    return () => {
      setLoading(false);
    };
  }, []);

  return {
    loading,
    error,
  };
}`,
      'hook.test.ts': (name) => `import { renderHook } from '@testing-library/react';
import { use${name} } from './use${name}';

describe('use${name}', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => use${name}());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});`
    }
  }
};

// Utility functions
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase());
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// Command implementations
function initCommand(args) {
  const projectName = args._[0];
  
  if (!projectName) {
    log.error('Project name is required');
    console.log('Usage: saas-cli init <project-name>');
    process.exit(1);
  }

  log.step(`Initializing SaaS Kit project: ${projectName}`);
  
  try {
    // Run the setup script
    execSync(`node scripts/setup-project.js`, { stdio: 'inherit' });
    log.success(`Project ${projectName} initialized successfully!`);
  } catch (error) {
    log.error(`Failed to initialize project: ${error.message}`);
    process.exit(1);
  }
}

function generateCommand(args) {
  const type = args._[0];
  const name = args._[1];
  
  if (!type || !name) {
    log.error('Type and name are required');
    console.log('Usage: saas-cli generate <type> <name>');
    console.log('Types: component, page, api, hook');
    process.exit(1);
  }

  const template = templates[type];
  if (!template) {
    log.error(`Unknown template type: ${type}`);
    console.log('Available types:', Object.keys(templates).join(', '));
    process.exit(1);
  }

  log.step(`Generating ${type}: ${name}`);

  // Determine output directory
  let outputDir;
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const kebabName = toKebabCase(name);

  switch (type) {
    case 'component':
      outputDir = path.join('components', kebabName);
      break;
    case 'page':
      outputDir = path.join('app', kebabName);
      break;
    case 'api':
      outputDir = path.join('app', 'api', kebabName);
      break;
    case 'hook':
      outputDir = path.join('hooks');
      break;
    default:
      outputDir = kebabName;
  }

  // Create directory
  ensureDirectoryExists(outputDir);

  // Generate files
  for (const [fileName, contentFn] of Object.entries(template.files)) {
    let actualFileName = fileName;
    let content = contentFn(pascalName);

    // Replace template filename
    if (type === 'component') {
      actualFileName = fileName.replace('component', pascalName);
    } else if (type === 'hook') {
      actualFileName = fileName.replace('hook', `use${pascalName}`);
    }

    const filePath = path.join(outputDir, actualFileName);
    fs.writeFileSync(filePath, content);
    log.success(`Created ${filePath}`);
  }

  // Update exports if needed
  if (type === 'component') {
    updateComponentExports(kebabName, pascalName);
  }

  log.success(`${type} ${name} generated successfully!`);
}

function updateComponentExports(kebabName, pascalName) {
  const indexPath = 'components/index.ts';
  
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const exportLine = `export { ${pascalName} } from './${kebabName}';`;
    
    if (!content.includes(exportLine)) {
      fs.appendFileSync(indexPath, `\n${exportLine}`);
      log.info(`Updated ${indexPath} with new export`);
    }
  } else {
    // Create index file
    const content = `export { ${pascalName} } from './${kebabName}';`;
    fs.writeFileSync(indexPath, content);
    log.success(`Created ${indexPath}`);
  }
}

function templateCommand(args) {
  const subcommand = args._[0];
  
  switch (subcommand) {
    case 'list':
      log.info('Available templates:');
      for (const [name, template] of Object.entries(templates)) {
        console.log(`  ${name.padEnd(12)} ${template.description}`);
      }
      break;
    case 'info':
      const templateName = args._[1];
      if (!templateName) {
        log.error('Template name is required');
        console.log('Usage: saas-cli template info <template-name>');
        process.exit(1);
      }
      
      const template = templates[templateName];
      if (!template) {
        log.error(`Template not found: ${templateName}`);
        process.exit(1);
      }
      
      console.log(`\n📋 Template: ${templateName}`);
      console.log(`Description: ${template.description}`);
      console.log('\nFiles generated:');
      for (const fileName of Object.keys(template.files)) {
        console.log(`  - ${fileName}`);
      }
      break;
    default:
      log.error('Unknown template subcommand');
      console.log('Usage: saas-cli template <list|info>');
      process.exit(1);
  }
}

function configCommand(args) {
  const subcommand = args._[0];
  
  switch (subcommand) {
    case 'show':
      log.info('Current configuration:');
      if (fs.existsSync('.env.local')) {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const lines = envContent.split('\n').filter(line => 
          line.trim() && !line.startsWith('#')
        );
        
        for (const line of lines) {
          const [key, value] = line.split('=');
          if (key && value) {
            // Hide sensitive values
            const displayValue = key.includes('SECRET') || key.includes('KEY') 
              ? '***hidden***' 
              : value;
            console.log(`  ${key}: ${displayValue}`);
          }
        }
      } else {
        log.warning('No .env.local file found');
      }
      break;
    case 'set':
      const key = args._[1];
      const value = args._[2];
      
      if (!key || !value) {
        log.error('Key and value are required');
        console.log('Usage: saas-cli config set <key> <value>');
        process.exit(1);
      }
      
      // TODO: Implement config setting
      log.info(`Setting ${key} = ${value}`);
      log.warning('Config setting not yet implemented');
      break;
    default:
      log.error('Unknown config subcommand');
      console.log('Usage: saas-cli config <show|set>');
      process.exit(1);
  }
}

function deployCommand(args) {
  const platform = args._[0] || 'vercel';
  
  log.step(`Deploying to ${platform}...`);
  
  switch (platform) {
    case 'vercel':
      try {
        execSync('vercel --prod', { stdio: 'inherit' });
        log.success('Deployed to Vercel successfully!');
      } catch (error) {
        log.error('Vercel deployment failed');
        log.info('Make sure you have Vercel CLI installed: npm i -g vercel');
      }
      break;
    case 'netlify':
      try {
        execSync('netlify deploy --prod', { stdio: 'inherit' });
        log.success('Deployed to Netlify successfully!');
      } catch (error) {
        log.error('Netlify deployment failed');
        log.info('Make sure you have Netlify CLI installed: npm i -g netlify-cli');
      }
      break;
    default:
      log.error(`Unknown platform: ${platform}`);
      console.log('Supported platforms: vercel, netlify');
      process.exit(1);
  }
}

// Main CLI setup
const cli = new ArgumentParser();

cli.command('init', 'Initialize a new SaaS Kit project')
  .action(initCommand);

cli.command('generate', 'Generate components, pages, or API routes')
  .action(generateCommand);

cli.command('template', 'Manage project templates')
  .action(templateCommand);

cli.command('config', 'Manage project configuration')
  .action(configCommand);

cli.command('deploy', 'Deploy project to various platforms')
  .action(deployCommand);

// Parse command line arguments
if (require.main === module) {
  cli.parse();
}

module.exports = {
  cli,
  templates,
  initCommand,
  generateCommand,
  templateCommand,
  configCommand,
  deployCommand,
}; 
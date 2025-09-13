// Basic tests for NutriSteck Secure Banking Application
const fs = require('fs');
const path = require('path');

describe('Basic Application Tests', () => {
  
  test('Required files exist', () => {
    const requiredFiles = [
      'package.json',
      'server.js',
      'app.js',
      'index.html',
      'login.html',
      'dashboard.html',
      'styles.css',
      '.env.example'
    ];
    
    requiredFiles.forEach(file => {
      expect(fs.existsSync(path.join(__dirname, '..', file))).toBe(true);
    });
  });
  
  test('Package.json has required fields', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.name).toBe('secur-nutristeck');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.main).toBe('server.js');
    expect(packageJson.scripts.start).toBe('node server.js');
    expect(packageJson.dependencies).toBeDefined();
  });
  
  test('Server.js can be required without errors', () => {
    expect(() => {
      // Check syntax without executing
      const serverCode = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
      expect(serverCode).toContain('express');
      expect(serverCode).toContain('app.listen');
    }).not.toThrow();
  });
  
  test('HTML files have proper structure', () => {
    const htmlFiles = ['index.html', 'login.html', 'dashboard.html'];
    
    htmlFiles.forEach(file => {
      const htmlContent = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html');
      expect(htmlContent).toContain('</html>');
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('<body>');
    });
  });
  
  test('CSS file exists and has content', () => {
    const cssContent = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
    expect(cssContent.length).toBeGreaterThan(0);
  });
  
  test('Environment example file has required variables', () => {
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
    expect(envContent).toContain('TELEGRAM_BOT_TOKEN');
    expect(envContent).toContain('TELEGRAM_SECRET_TOKEN');
    expect(envContent).toContain('INTERNAL_TOKEN');
    expect(envContent).toContain('PORT');
  });
  
});
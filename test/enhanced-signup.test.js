// Test for enhanced signup functionality
const fs = require('fs');
const path = require('path');

describe('Enhanced Signup Form Tests', () => {
  
  test('signup.html includes all required enhanced fields', () => {
    const signupContent = fs.readFileSync(path.join(__dirname, '..', 'signup.html'), 'utf8');
    
    // Test for all new field labels
    expect(signupContent).toContain('Phone Number');
    expect(signupContent).toContain('Date of Birth');
    expect(signupContent).toContain('Street Address');
    expect(signupContent).toContain('City');
    expect(signupContent).toContain('State');
    expect(signupContent).toContain('Zip/Postal Code');
    expect(signupContent).toContain('Country');
    expect(signupContent).toContain('Tax ID/SSN'); // Updated label as requested
    expect(signupContent).toContain('Employment Status');
    expect(signupContent).toContain('Annual Income');
    expect(signupContent).toContain('Security Question');
    expect(signupContent).toContain('Security Answer');
    expect(signupContent).toContain('4-Digit PIN');
    expect(signupContent).toContain('I agree to the Terms of Service and Privacy Policy');
    
    // Test for employment status dropdown options
    expect(signupContent).toContain('Employed');
    expect(signupContent).toContain('Self-Employed');
    expect(signupContent).toContain('Unemployed');
    expect(signupContent).toContain('Retired');
    expect(signupContent).toContain('Student');
    
    // Test for security questions
    expect(signupContent).toContain('What was the name of your first pet?');
    expect(signupContent).toContain('What elementary school did you attend?');
    
    // Test for PIN validation pattern
    expect(signupContent).toContain('pattern="[0-9]{4}"');
    expect(signupContent).toContain('maxlength="4"');
  });
  
  test('signup form includes all required input types', () => {
    const signupContent = fs.readFileSync(path.join(__dirname, '..', 'signup.html'), 'utf8');
    
    expect(signupContent).toContain('type="date"');
    expect(signupContent).toContain('type="number"');
    expect(signupContent).toContain('type="checkbox"');
  });
  
  test('signup form includes PIN and agreement validation', () => {
    const signupContent = fs.readFileSync(path.join(__dirname, '..', 'signup.html'), 'utf8');
    
    expect(signupContent).toContain('PIN must be exactly 4 digits');
    expect(signupContent).toContain('You must agree to the Terms');
  });
  
  test('server.js handles all new registration fields', () => {
    const serverContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    
    // Test that all new fields are extracted from request body
    const requiredFields = [
      'phoneNumber', 'dateOfBirth', 'streetAddress', 'city', 'state',
      'zipCode', 'country', 'taxId', 'employmentStatus', 'annualIncome',
      'securityQuestion', 'securityAnswer', 'pin'
    ];
    
    requiredFields.forEach(field => {
      expect(serverContent).toContain(field);
    });
    
    // Test PIN validation
    expect(serverContent).toContain('PIN must be exactly 4 digits');
    expect(serverContent).toContain('/^\\d{4}$/');
    
    // Test PIN hashing
    expect(serverContent).toContain('hashedPin');
    expect(serverContent).toContain('bcrypt.hash(pin');
    
    // Test sensitive fields filtering
    expect(serverContent).toContain('pin: __');
    expect(serverContent).toContain('securityAnswer: ___');
  });
  
});
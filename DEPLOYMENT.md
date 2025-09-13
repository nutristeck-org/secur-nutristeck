# NutriSteck Secure - Production Deployment Guide

## 🚀 Launch Readiness Checklist

### ✅ Pre-Launch Requirements Completed
- [x] Code quality: All ESLint errors fixed
- [x] Testing: Basic test suite implemented and passing
- [x] Dependencies: All packages installed and verified
- [x] Server functionality: Express server tested and working

### 📋 Production Deployment Checklist

#### 1. Environment Setup
- [ ] Create production `.env` file with real credentials
- [ ] Set secure `JWT_SECRET` (not the default dev value)
- [ ] Configure `ADMIN_PASSWORD` (change from default)
- [ ] Set up Telegram bot tokens if using Telegram integration
- [ ] Configure production `PORT` (default: 3000)

#### 2. Security Configuration
- [ ] Review and update hardcoded demo credentials
- [ ] Implement proper password hashing for all users
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domains only
- [ ] Review and secure API endpoints
- [ ] Enable rate limiting for authentication endpoints

#### 3. Database Setup
- [ ] The app currently uses JSON file storage (`./data/` directory)
- [ ] For production, consider migrating to a proper database (PostgreSQL, MySQL, MongoDB)
- [ ] Set up database backups and recovery procedures
- [ ] Configure data persistence and user data management

#### 4. Infrastructure Setup
- [ ] Choose hosting platform (AWS, Heroku, DigitalOcean, etc.)
- [ ] Configure reverse proxy (nginx) if needed
- [ ] Set up process management (PM2, systemd)
- [ ] Configure logging and monitoring
- [ ] Set up automatic deployments via CI/CD

#### 5. Domain and DNS
- [ ] Purchase and configure domain name
- [ ] Set up DNS records pointing to your server
- [ ] Configure SSL certificate (Let's Encrypt recommended)
- [ ] Test domain accessibility

#### 6. Telegram Integration (if using)
- [ ] Create production Telegram bot via @BotFather
- [ ] Set webhook URL using the GitHub Actions workflow
- [ ] Test Telegram notifications and account linking

## 🛠️ Quick Start Commands

### Local Development
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
# OR
npm start

# Run tests
npm test

# Check code quality
npm run lint
```

### Production Deployment

#### Option 1: Direct Server Deployment
```bash
# Clone repository
git clone https://github.com/nutristeck-org/secur-nutristeck.git
cd secur-nutristeck

# Install production dependencies
npm install --production

# Create production environment
cp .env.example .env
# Edit .env with production values

# Start with process manager
pm2 start server.js --name nutristeck-secure
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment
```bash
# Create Dockerfile (see Docker section below)
docker build -t nutristeck-secure .
docker run -p 3000:3000 --env-file .env nutristeck-secure
```

#### Option 3: Heroku Deployment
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set ADMIN_PASSWORD=your-admin-password
# Add other environment variables

git push heroku main
```

## 🐳 Docker Configuration

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  nutristeck-secure:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secure-jwt-secret
      - ADMIN_PASSWORD=your-admin-password
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

## 🔒 Security Best Practices

### 1. Environment Variables
Never commit sensitive data to git. Required production variables:
```bash
# Required for production
NODE_ENV=production
JWT_SECRET=your-very-secure-random-string-at-least-32-chars
ADMIN_PASSWORD=your-secure-admin-password

# Optional - Telegram integration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_SECRET_TOKEN=your-webhook-secret
INTERNAL_TOKEN=your-internal-api-token

# Optional - Custom port
PORT=3000
```

### 2. Demo Credentials Replacement
Current demo credentials (replace in production):
- **User ID:** `Lowkeyrich1413`
- **Password:** `$SlimYellow1`
- **PIN:** `1234`

### 3. Data Storage
- Current: JSON files in `./data/` directory
- Recommended: Move to encrypted database for production
- Ensure proper file permissions on data directory

### 4. HTTPS Configuration
Use reverse proxy (nginx) configuration:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring and Maintenance

### Health Check Endpoint
```bash
curl http://your-domain.com/api/health
```

### Log Monitoring
```bash
# With PM2
pm2 logs nutristeck-secure

# Direct logs
tail -f /var/log/nutristeck-secure.log
```

### Regular Maintenance
- Monitor disk space (data files can grow)
- Regular backups of user data
- Update dependencies monthly
- Monitor security advisories

## 🚨 Known Limitations & Recommendations

### Current State
- ⚠️ Uses JSON file storage (not scalable for production)
- ⚠️ Demo credentials hardcoded
- ⚠️ No input validation on some endpoints
- ⚠️ Console.log statements present (warnings)

### Production Recommendations
1. **Database Migration**: Move from JSON files to proper database
2. **Input Validation**: Add comprehensive input validation
3. **Rate Limiting**: Implement authentication rate limiting
4. **Session Management**: Proper session handling
5. **Audit Logging**: Comprehensive audit trail
6. **Backup Strategy**: Automated data backups

## 📞 Support

For deployment issues or questions:
1. Check the GitHub repository issues
2. Review application logs
3. Test with provided demo credentials first
4. Ensure all environment variables are set correctly

---

**🎯 Ready for Launch**: After completing the production checklist above, your NutriSteck Secure banking application will be ready for production deployment!
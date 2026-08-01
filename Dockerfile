FROM node:22-alpine

WORKDIR /app

# 1. Copy package configurations
COPY package*.json ./

# 2. Copy database schema
COPY prisma ./prisma/

# 3. INSTALL ALL DEPENDENCIES (Make sure this line is NOT commented out!)
RUN npm install

# 4. Copy the application source code files
COPY . .

RUN DATABASE_URL="DATABASE_URL" npm run build


EXPOSE 8000

CMD ["npm", "start"]

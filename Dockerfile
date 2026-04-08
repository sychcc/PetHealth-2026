FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma.config.ts ./          
COPY prisma/ ./prisma/            
RUN npm ci                      
COPY . .
RUN npx prisma generate 
RUN npm run build       

# 第二階段：production（只要 build 好的東西）
FROM node:22-alpine AS runner
WORKDIR /app
# 從本機拿（這些沒有被 build，直接複製）：

COPY package*.json ./  
COPY prisma.config.ts ./ 
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

RUN npm ci --only=production   

COPY --from=builder /app/.next ./.next          
COPY --from=builder /app/generated ./generated 
COPY --from=builder /app/public ./public
COPY next.config.ts ./ 

EXPOSE 3000
CMD ["npm", "start"]
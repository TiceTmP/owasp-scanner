# Base image
FROM node:20-alpine

# ตั้งค่า working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์โปรเจคทั้งหมด
COPY . .

# สร้าง build สำหรับ production
RUN npm run build

# ตั้งค่า environment variables
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# เปิด port
EXPOSE 3000

# รันคำสั่งเริ่มต้นเซิร์ฟเวอร์
CMD ["npm", "run", "start"]
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 創建上傳目錄
RUN mkdir -p public/uploads/showcase public/uploads/avatars public/uploads/gallery

EXPOSE 3001

CMD ["npm", "start"] 
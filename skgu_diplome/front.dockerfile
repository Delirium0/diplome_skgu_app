FROM node:18-alpine
 
WORKDIR /front
 
COPY package*.json ./
 
RUN npm install
 
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
EXPOSE 3000
 
CMD ["npm", "start"]
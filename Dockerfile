FROM node:18-alpine

WORKDIR /home/app
COPY ./package.json /home/app/package.json

# RUN SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -s --arch=x64 --platform=linux sharp
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install

COPY . /home/app

USER root

RUN mkdir /home/app/public
RUN mkdir /home/app/public/images
RUN mkdir /home/app/public/images/thumbs
RUN mkdir /home/app/public/images/profile

CMD npm start
EXPOSE 5000
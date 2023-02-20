FROM node:18-alpine as build
COPY . /app
WORKDIR /app
RUN yarn install --frozen-lockfile
RUN yarn build

FROM gcr.io/distroless/nodejs:18
WORKDIR /app
COPY --from=build /app/dist/main.js .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.env .
EXPOSE 3300
CMD ["main.js"]
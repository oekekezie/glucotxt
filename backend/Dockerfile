# Dockerfile
FROM quay.io/aptible/nodejs:v4.3.x

# Add package.json before rest of repo, for Docker caching purposes
ADD package.json /
WORKDIR /
RUN npm install --production

ADD . /

# Run any additional build commands here...
# grunt some:task

ENV PORT 3000
EXPOSE 3000

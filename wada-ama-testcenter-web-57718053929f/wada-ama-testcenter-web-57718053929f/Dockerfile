#################
# Used as a Jenkins agent -- See Jenkinsfile #
#################

FROM node:14.16.0-alpine3.12 as agent

RUN apk add libxslt zip
RUN apk add --no-cache git


################
# Run in NGINX #
################
FROM nginx:1.19.8-alpine as run

RUN apk add zip curl

WORKDIR /app

## add permissions
RUN chown -R nginx:nginx /app && chmod -R 755 /app && \
        mkdir /usr/share/nginx/ssl && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /etc/nginx/conf.d && \
        chown -R nginx:nginx /usr/share/nginx/html && \
        chown -R nginx:nginx /usr/share/nginx/ssl

RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

## switch to non-root user
USER nginx

COPY --chown=nginx:nginx server/testcenter-webserver.zip .
COPY --chown=nginx:nginx server/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx server/nginx/logrotate.conf /etc/logrotate.d/nginx

RUN unzip testcenter-webserver.zip -d /app && \
    rm testcenter-webserver.zip && \
    cp -r /app/public /usr/share/nginx/html/ng  && \
    cp -r /app/ssl/. /usr/share/nginx/ssl/. && \
    rm -rf /app/public && \
    rm -rf /app/ssl

EXPOSE 4200

# When the container starts, replace the config.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/ng/en/config.template.js > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]

#!/bin/bash
cp /usr/local/share/ca-certificates/CGI/CGI-Web-Gateway2.crt .
docker build --add-host=dl-cdn.alpinelinux.org:151.101.194.133 -f ./Dockerfile.local -t testcenter-web:latest .
rm -rf CGI-Web-Gateway2.crt
docker system prune -f
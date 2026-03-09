#!/bin/sh
set -e

# Substitui o placeholder BACKEND_URL pelo valor da variável de ambiente
sed -i "s|BACKEND_URL|${BACKEND_URL}|g" /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'

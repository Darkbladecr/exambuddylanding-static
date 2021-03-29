#!/usr/bin/env bash
docker build -t 'docker.mitrasinovic.co.uk/exambuddy-landing' .
docker push 'docker.mitrasinovic.co.uk/exambuddy-landing'
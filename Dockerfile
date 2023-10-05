FROM node:19.9.0
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && \
    apt-get install -y build-essential apt-utils git curl supervisor systemd software-properties-common && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get autoremove -y && \
    apt-get clean

ADD . /rsk-contract-verifier
WORKDIR /rsk-contract-verifier
RUN git checkout -B docker-branch origin/master
RUN npm install
COPY docker-files/config.json /rsk-contract-verifier/
COPY docker-files/supervisord.conf /etc/supervisor/conf.d/contract-verifier.conf
EXPOSE 3008
CMD ["/usr/bin/supervisord"]
